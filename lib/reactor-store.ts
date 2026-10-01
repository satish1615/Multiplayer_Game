import { getDb } from '@/db';
import { hash, rateLimit } from './room-store';
import { ReactorError, advance, apply, makeRoom, placeHomes, project, runner, type Action, type Character, type Room } from './reactor-engine';
const DAY = 86400000;
const secret = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
type Row = { state: string; version: number; expires_at: number; id?: string };
function parse(row: Row | null): Room {
  if (!row || row.expires_at < Date.now()) throw new ReactorError('Room not found or expired. Check the code.', 404);
  const r = JSON.parse(row.state) as Room;
  if (r.game !== 'reactor-rush') throw new ReactorError('That code belongs to a different game. Create a Reactor Rush room.', 404);
  return r;
}
async function save(r: Room, version: number) {
  const result = await getDb().prepare('UPDATE rooms SET state = ?, version = version + 1, expires_at = ? WHERE code = ? AND version = ?').bind(JSON.stringify(r), Date.now() + DAY, r.code, version).run();
  return result.meta.changes === 1;
}
export async function create(name: string, character: Character, solo: boolean) {
  const db = getDb(), now = Date.now(), id = crypto.randomUUID(), token = secret();
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  await db.batch([
    db.prepare('DELETE FROM rooms WHERE expires_at < ?').bind(now),
    db.prepare('DELETE FROM request_limits WHERE reset_at < ?').bind(now - DAY),
  ]);
  for (let attempt = 0; attempt < 4; attempt++) {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), n => alphabet[n % alphabet.length]).join('');
    const room = makeRoom(code, id, name, character, now, solo);
    try {
      await db.batch([
        db.prepare('INSERT INTO rooms (code, state, version, expires_at) VALUES (?, ?, 0, ?)').bind(code, JSON.stringify(room), now + DAY),
        db.prepare('INSERT INTO members (id, room_code, token_hash, last_seen) VALUES (?, ?, ?, ?)').bind(id, code, await hash(token), now),
      ]);
      return { session: { code, token, playerId: id }, room: project(room, id, 0, now) };
    } catch (e) { if (String(e).includes('UNIQUE') && String(e).includes('rooms.code')) continue; throw e; }
  }
  throw new ReactorError('Could not create a room. Try again.', 503);
}
export async function join(code: string, name: string, character: Character) {
  const db = getDb(), now = Date.now(), id = crypto.randomUUID(), token = secret();
  parse(await db.prepare('SELECT state, version, expires_at FROM rooms WHERE code = ?').bind(code).first<Row>());
  await db.prepare('INSERT INTO members (id, room_code, token_hash, last_seen) VALUES (?, ?, ?, ?)').bind(id, code, await hash(token), now).run();
  try {
    for (let i = 0; i < 6; i++) {
      const row = await db.prepare('SELECT state, version, expires_at FROM rooms WHERE code = ?').bind(code).first<Row>();
      const r = parse(row);
      if (r.phase !== 'lobby') throw new ReactorError('This match has started. Ask the host to return to the lobby afterward.');
      if (r.players.length >= 6) throw new ReactorError('This room is full. The host can remove a bot to make space.');
      if (r.players.some(p => !p.isBot && p.name.toLowerCase() === name.toLowerCase())) throw new ReactorError('That nickname is already in use. Choose another.');
      r.players.push(runner(id, name, character, now)); placeHomes(r);
      if (!r.hostId) r.hostId = id;
      if (await save(r, row!.version)) return { session: { code, token, playerId: id }, room: project(r, id, row!.version + 1, now) };
    }
    throw new ReactorError('The room is busy. Try joining again.', 409);
  } catch (e) { await db.prepare('DELETE FROM members WHERE id = ?').bind(id).run(); throw e; }
}
export async function sync(code: string, request: Request, action?: Action) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw new ReactorError('Join this room to get a player seat.', 401);
  const tokenHash = await hash(token), db = getDb();
  for (let retry = 0; retry < 8; retry++) {
    const row = await db.prepare('SELECT r.state, r.version, r.expires_at, m.id FROM rooms r JOIN members m ON m.room_code = r.code WHERE r.code = ? AND m.token_hash = ?').bind(code, tokenHash).first<Row>();
    if (!row) throw new ReactorError('This player seat is no longer available. Join the room again.', 401);
    const r = parse(row), id = row.id!, p = r.players.find(p => p.id === id), now = Date.now();
    if (!p || p.isBot) throw new ReactorError('This seat has left the room. Join again.', 401);
    // Fast input is rate bounded by server time in the room itself. Do not add
    // a database write per animation heartbeat solely to count requests.
    if ((!action || action.type === 'input') && now - p.lastSeen < 70) return project(r, id, row.version, now);
    if (action && action.type !== 'input' && retry === 0) await rateLimit('reactor-action:' + id, 100, 60000);
    p.lastSeen = now;
    if (action) apply(r, id, action, now); else advance(r, now);
    if (!await save(r, row.version)) continue;
    if (action?.type === 'leave') {
      await db.prepare('DELETE FROM members WHERE id = ?').bind(id).run();
      return { left: true };
    }
    return project(r, id, row.version + 1, now);
  }
  throw new ReactorError('Connection catching up. Please keep this tab open.', 409);
}
