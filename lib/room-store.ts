import { getDb } from "@/db";
import { GameError, applyAction, expire, projectRoom, type Action } from "./game-engine";
import type { RoomState, Session } from "./game-types";
import { tickBot } from "./game-bot";

const DAY = 86400000;
type Row = { state: string; version: number; expires_at: number };
export async function hash(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), x => x.toString(16).padStart(2, "0")).join("");
}
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), x => x.toString(16).padStart(2, "0")).join("");
export async function rateLimit(key: string, maximum: number, windowMs: number) {
  const now = Date.now(), db = getDb();
  const row = await db.prepare("INSERT INTO request_limits (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END, reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END RETURNING count").bind(key, now + windowMs, now, now).first<{ count: number }>();
  if (!row || row.count > maximum) throw new GameError("Too many requests. Wait a moment and try again.", 429);
}
async function load(code: string) {
  const row = await getDb().prepare("SELECT state, version, expires_at FROM rooms WHERE code = ?").bind(code).first<Row>();
  if (!row || row.expires_at <= Date.now()) throw new GameError("Room not found or expired. Check the code, or create a new room.", 404);
  return { room: JSON.parse(row.state) as RoomState, version: row.version };
}
async function seen(code: string) {
  const rows = await getDb().prepare("SELECT id, last_seen FROM members WHERE room_code = ?").bind(code).all<{ id: string; last_seen: number }>();
  return Object.fromEntries(rows.results.map(r => [r.id, r.last_seen]));
}
async function save(room: RoomState, version: number) {
  const result = await getDb().prepare("UPDATE rooms SET state = ?, version = version + 1, expires_at = ? WHERE code = ? AND version = ?")
    .bind(JSON.stringify(room), Date.now() + DAY, room.code, version).run();
  return result.meta.changes === 1;
}
export async function authenticate(code: string, request: Request) {
  const credential = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!credential || !/^[a-f0-9]{64}$/.test(credential)) throw new GameError("Rejoin this room to get a seat.", 401);
  const row = await getDb().prepare("SELECT id FROM members WHERE token_hash = ? AND room_code = ?").bind(await hash(credential), code).first<{ id: string }>();
  if (!row) throw new GameError("This seat has expired. Join the room again.", 401);
  const now = Date.now();
  await getDb().prepare("UPDATE members SET last_seen = ? WHERE id = ? AND last_seen < ?").bind(now, row.id, now - 10000).run();
  return row.id;
}
export async function readRoom(code: string, id: string) {
  for (let retry = 0; retry < 6; retry++) {
    const { room, version } = await load(code);
    if (!room.players.some(p => p.id === id)) throw new GameError("Your seat is no longer in this room. Join again.", 401);
    const now = Date.now(), presence = await seen(code);
    const expired = expire(room, now);
    const changed = tickBot(room, now, presence) || expired;
    if (changed && !await save(room, version)) continue;
    return projectRoom(room, id, version + (changed ? 1 : 0), presence, now);
  }
  throw new GameError("The crew is making changes. Try again.", 409);
}
export async function createRoom(name: string, mode: "mission" | "practice", solo = false) {
  const db = getDb(), now = Date.now(), playerId = crypto.randomUUID(), secret = token();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  await db.batch([
    db.prepare("DELETE FROM rooms WHERE expires_at < ?").bind(now),
    db.prepare("DELETE FROM request_limits WHERE reset_at < ?").bind(now - DAY),
  ]);
  for (let attempt = 0; attempt < 4; attempt++) {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), n => alphabet[n % alphabet.length]).join("");
    const room: RoomState = { code, hostId: playerId, mode, phase: "lobby", players: [{ id: playerId, name, ready: false, joined: now }], puzzle: null, round: 0, repairs: 0, strikes: 0, startedAt: null, deadline: null, finishedAt: null, notice: "Share the room code with your crew.", chat: [], processed: [], createdAt: now };
    if (solo) {
      room.players.push({ id: crypto.randomUUID(), name: "Nova (bot)", ready: true, joined: now, isBot: true });
      room.notice = "Nova is your bot teammate. Share clues in room chat.";
      tickBot(room, now, { [playerId]: now });
    }
    try {
      await db.batch([
        db.prepare("INSERT INTO rooms (code, state, version, expires_at) VALUES (?, ?, 0, ?)").bind(code, JSON.stringify(room), now + DAY),
        db.prepare("INSERT INTO members (id, room_code, token_hash, last_seen) VALUES (?, ?, ?, ?)").bind(playerId, code, await hash(secret), now),
      ]);
      const session: Session = { code, token: secret, playerId };
      return { session, room: projectRoom(room, playerId, 0, { [playerId]: now }, now) };
    } catch (err) {
      if (String(err).includes("UNIQUE") && String(err).includes("rooms.code")) continue;
      throw err;
    }
  }
  throw new GameError("Could not create a room. Please try again.", 503);
}
export async function joinRoom(code: string, name: string) {
  const db = getDb(), playerId = crypto.randomUUID(), secret = token(), now = Date.now();
  await load(code);
  await db.prepare("INSERT INTO members (id, room_code, token_hash, last_seen) VALUES (?, ?, ?, ?)").bind(playerId, code, await hash(secret), now).run();
  try {
    for (let retry = 0; retry < 6; retry++) {
      const { room, version } = await load(code);
      if (room.phase !== "lobby") throw new GameError("This crew is on a mission. Ask the host to return to the lobby.");
      if (room.players.some(p => p.isBot)) throw new GameError("This is a solo room. Ask the host to switch to friends in the lobby first.");
      if (room.players.length >= 6) throw new GameError("This room has six players. Create another room.");
      if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) throw new GameError("That nickname is already in this room. Choose another.");
      room.players.push({ id: playerId, name, ready: false, joined: now });
      if (!room.hostId) room.hostId = playerId;
      room.notice = name + " joined the crew.";
      if (!await save(room, version)) continue;
      return { session: { code, token: secret, playerId } as Session, room: projectRoom(room, playerId, version + 1, await seen(code), now) };
    }
    throw new GameError("The room changed while joining. Please try again.", 409);
  } catch (err) {
    await db.prepare("DELETE FROM members WHERE id = ?").bind(playerId).run();
    throw err;
  }
}
export async function mutateRoom(code: string, id: string, action: Action) {
  await rateLimit("member:" + id, 240, 60000);
  if (action.type === "chat") await rateLimit("chat:" + id, 40, 60000);
  for (let retry = 0; retry < 8; retry++) {
    const { room, version } = await load(code), now = Date.now(), presence = await seen(code);
    // Expiry is committed before rejecting an action that arrived after the deadline.
    if (expire(room, now)) {
      if (!await save(room, version)) continue;
      if (!["chat", "leave", "lobby", "claim"].includes(action.type)) return projectRoom(room, id, version + 1, presence, now);
      continue;
    }
    applyAction(room, id, action, now, presence);
    tickBot(room, now, presence);
    if (!await save(room, version)) continue;
    if (action.type === "leave") return { left: true };
    return projectRoom(room, id, version + 1, presence, now);
  }
  throw new GameError("Another setting just changed. Please try again.", 409);
}
