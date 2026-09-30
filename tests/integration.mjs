import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
const req = createRequire(import.meta.url);
const wranglerRequire = createRequire(req.resolve("wrangler/package.json"));
const { Miniflare } = wranglerRequire("miniflare");
const worker = new Miniflare({
  modulesRoot: resolve("dist/server"),
  modules: ["index.js", ...(await readdir("dist/server", { recursive: true })).filter(p => p.endsWith(".js") && p !== "index.js")].map(p => ({ type: "ESModule", path: resolve("dist/server", p) })),
  compatibilityDate: "2026-05-15", compatibilityFlags: ["nodejs_compat"],
  d1Databases: { DB: "split-signal-tests" }, cf: false,
});
const database = await worker.getD1Database("DB");
const sql = await readFile("drizzle/0000_zippy_dark_beast.sql", "utf8");
for (const statement of sql.split("--> statement-breakpoint")) if (statement.trim()) await database.prepare(statement.trim()).run();
const base = "http://game.test";
try {
let checks = 0;
const verify = (condition, message) => { assert.ok(condition, message); checks++; };
async function request(path, data, seat, expected = 200) {
  const response = await worker.dispatchFetch(base + path, {
    method: data ? "POST" : "GET",
    headers: { ...(data ? { "Content-Type": "application/json" } : {}), ...(seat ? { Authorization: "Bearer " + seat.token } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const value = await response.json();
  assert.equal(response.status, expected, JSON.stringify(value));
  return value;
}
const create = async (name, mode = "practice") => (await request("/api/rooms", { name, mode }, null, 201)).session;
const join = async (seat, name) => (await request("/api/rooms/join", { name, code: seat.code })).session;
const read = seat => request("/api/rooms/" + seat.code, null, seat);
async function action(seat, type, extra = {}, expected = 200) {
  const current = await read(seat);
  return request("/api/rooms/" + seat.code, {
    type, requestId: randomUUID(), puzzleId: current.role?.puzzleId, configRevision: current.role?.configRevision, ...extra,
  }, seat, expected);
}
async function solve(seats, round) {
  let views = await Promise.all(seats.map(read));
  const powerIndex = views.findIndex(v => v.role?.kind === "power"), power = seats[powerIndex];
  const target = views[powerIndex].role.target;
  verify(views.filter(v => v.role?.target !== undefined).length === 1, "Only Power receives the target");
  verify(views.filter(v => v.role?.powerRules).length === 1, "Only Relay 1 receives power clues");
  verify(!JSON.stringify(views).includes("token_hash"), "No token hashes in projections");
  const guide = views.find(v => v.role?.powerRules).role.powerRules[target];
  await action(power, "set", { field: "channel", value: guide.channel });
  await action(power, "set", { field: "strength", value: guide.strength });
  for (let r = 0; r < seats.length - 1; r++) {
    const index = views.findIndex(v => v.role?.relayIndex === r);
    const live = await read(seats[index]), role = live.role;
    const dial = role.shifts.findIndex(shift => (role.incoming + shift) % 3 === role.exits[target]);
    verify(dial !== -1, "Every relay has a valid route");
    await action(seats[index], "set", { field: "relay", value: dial });
  }
  views = await Promise.all(seats.map(read));
  const revision = views[0].role.configRevision, puzzleId = views[0].role.puzzleId;
  await Promise.all(seats.map(seat => request("/api/rooms/" + seat.code, { type: "lock", requestId: randomUUID(), puzzleId, configRevision: revision }, seat)));
  const after = await Promise.all(seats.map(read));
  verify(after.every(v => v.repairs === round + 1), "Concurrent locks apply exactly one repair");
  verify(after.every(v => v.phase === (round === 2 ? "won" : "between")), "All sessions agree on the phase");
  if (round < 2) {
    await Promise.all(seats.map(seat => action(seat, "ready")));
    const next = await read(power);
    verify(next.role.kind !== "power", "Power role rotates");
    verify(next.role.puzzleId !== puzzleId, "New repair has a new puzzle ID");
  }
}
for (const count of [2, 3, 6]) {
  const host = await create("Crew" + count + "Host");
  const seats = [host];
  for (let i = 1; i < count; i++) seats.push(await join(host, "Crew" + count + "P" + i));
  verify(new Set(seats.map(s => s.token)).size === count, "Independent session credentials");
  await request("/api/rooms/" + host.code, null, null, 401);
  if (count === 6) await request("/api/rooms/join", { code: host.code, name: "Overflow" }, null, 400);
  await action(seats[1], "start", {}, 403);
  await action(host, "start", {}, 400);
  await Promise.all(seats.map(s => action(s, "ready")));
  await action(host, "start");
  verify((await read(host)).deadline === null, "Practice has no deadline");
  await request("/api/rooms/join", { code: host.code, name: "Late" }, null, 400);
  const router = seats[1];
  await action(router, "set", { field: "strength", value: 2 }, 403);
  await action(host, "set", { field: "channel", value: 7 }, 400);
  const viewsBefore = await Promise.all(seats.map(read));
  await Promise.all([
    action(host, "set", { field: "channel", value: (viewsBefore[0].role.channel + 1) % 3 }),
    action(router, "set", { field: "relay", value: (viewsBefore[1].role.selected + 1) % 3 }),
  ]);
  const viewsAfter = await Promise.all(seats.map(read));
  verify(viewsAfter[0].role.channel === (viewsBefore[0].role.channel + 1) % 3, "Concurrent Power change survives");
  verify(viewsAfter[1].role.selected === (viewsBefore[1].role.selected + 1) % 3, "Concurrent relay change survives");
  await action(host, "lock");
  await action(router, "set", { field: "relay", value: (viewsAfter[1].role.selected + 2) % 3 });
  verify((await read(host)).players.every(p => !p.ready), "Control changes clear all locks");
  await request("/api/rooms/" + host.code, { type: "lock", requestId: randomUUID(), puzzleId: viewsAfter[0].role.puzzleId, configRevision: viewsAfter[0].role.configRevision }, host, 409);
  const msgId = randomUUID(), text = "Test crew message " + count;
  await request("/api/rooms/" + host.code, { type: "chat", requestId: msgId, text }, host);
  await request("/api/rooms/" + host.code, { type: "chat", requestId: msgId, text }, host);
  verify((await read(router)).chat.filter(m => m.text === text).length === 1, "Duplicate messages apply once");
  const oldRole = await read(router);
  verify((await read(router)).selfId === oldRole.selfId, "Seat survives reconnect with same credential");
  for (let round = 0; round < 3; round++) await solve(seats, round);
  await action(host, "lobby");
  const lobby = await read(router);
  verify(lobby.phase === "lobby" && lobby.repairs === 0 && lobby.role === null, "Replay resets mission state");
  await action(host, "leave");
  const transferred = await read(router);
  verify(transferred.hostId === router.playerId && transferred.players.length === count - 1, "Leaving host transfers ownership");
  console.log("PASS " + count + "-player full mission, concurrency, privacy, chat, reconnect, replay, departure");
}
const host = await create("TimedHost", "mission"), guest = await join(host, "TimedGuest"), seats = [host, guest];
await Promise.all(seats.map(s => action(s, "ready"))); await action(host, "start");
const timed = await read(host);
verify(timed.deadline - timed.startedAt === 300000, "Mission deadline is five minutes and server owned");
for (let failure = 0; failure < 3; failure++) {
  const power = await read(host), relay = await read(guest);
  const required = relay.role.powerRules[power.role.target].channel;
  await action(host, "set", { field: "channel", value: (required + 1) % 3 });
  const live = await read(host);
  const id = randomUUID();
  await request("/api/rooms/" + host.code, { type: "lock", requestId: id, puzzleId: live.role.puzzleId, configRevision: live.role.configRevision }, host);
  await action(guest, "lock");
  await request("/api/rooms/" + host.code, { type: "lock", requestId: id, puzzleId: live.role.puzzleId, configRevision: live.role.configRevision }, host);
  const result = await read(host);
  verify(result.strikes === failure + 1, "A failed check counts once even if the request repeats");
}
verify((await read(guest)).phase === "lost", "Three failed checks end the mission for both players");
console.log("PASS timed mission, fuse failure, duplicate lock safety");
// Fixture-only clock/presence changes keep production timing and auth unchanged.
async function editState(code, edit) {
  const row = await database.prepare("SELECT state FROM rooms WHERE code = ?").bind(code).first();
  const state = JSON.parse(row.state); edit(state);
  await database.prepare("UPDATE rooms SET state = ?, version = version + 1 WHERE code = ?").bind(JSON.stringify(state), code).run();
}
async function botTurn(seat) {
  await editState(seat.code, state => { if (state.bot) state.bot.nextAt = 0; });
  return read(seat);
}
async function untilBot(seat, predicate) {
  for (let i = 0; i < 15; i++) { const view = await botTurn(seat); if (predicate(view)) return view; }
  assert.fail("Bot did not reach the expected state");
}
const solo = (await request("/api/rooms", { name: "SoloPilot", mode: "practice", solo: true }, null, 201)).session;
let soloView = await read(solo);
verify(soloView.players.length === 2 && soloView.players.some(p => p.isBot && p.name === "Nova (bot)" && p.online), "Solo creates a clearly labelled online bot");
verify((await database.prepare("SELECT count(*) AS n FROM members WHERE room_code = ?").bind(solo.code).first()).n === 1, "Bot has no external bearer seat");
await request("/api/rooms/join", { name: "UnexpectedGuest", code: solo.code }, null, 400);
await action(solo, "ready"); await action(solo, "start");
for (let round = 0; round < 3; round++) {
  soloView = await botTurn(solo);
  const puzzleId = soloView.role.puzzleId;
  verify(!("bot" in soloView), "Internal bot memory never leaves the server");
  if (soloView.role.kind === "power") {
    verify(!soloView.role.powerRules, "Solo does not reveal the bot's private table");
    for (let i = 0; i < 3; i++) await botTurn(solo);
    verify(!(await read(solo)).players.find(p => p.isBot).ready, "Relay bot waits for a shared target");
    await action(solo, "chat", { text: "We need " + ["STAR", "MOON", "TRIANGLE"][soloView.role.target] });
    const clue = await untilBot(solo, v => v.chat.some(m => m.name === "Nova (bot)" && /For .*choose channel/.test(m.text) && m.at >= soloView.serverTime));
    const message = clue.chat.filter(m => m.name === "Nova (bot)" && /For .*choose channel/.test(m.text)).at(-1).text;
    const settings = message.match(/channel ([ABC]), strength ([123])/);
    verify(!!settings, "Bot supplies a usable clue in chat");
    await action(solo, "set", { field: "channel", value: "ABC".indexOf(settings[1]) });
    await action(solo, "set", { field: "strength", value: Number(settings[2]) });
    const locked = await untilBot(solo, v => v.players.find(p => p.isBot).ready);
    verify(locked.role.receiving === locked.role.target, "Relay bot routes the communicated target");
    await action(solo, "lock");
  } else {
    verify(soloView.role.target === undefined, "Relay human must learn the target through chat");
    const announced = await untilBot(solo, v => v.chat.some(m => m.name === "Nova (bot)" && /My turn on Power/.test(m.text)));
    const announcement = announced.chat.filter(m => /My turn on Power/.test(m.text)).at(-1).text;
    const target = ["STAR", "MOON", "TRIANGLE"].findIndex(s => announcement.includes("We need " + s));
    verify(target >= 0, "Power bot tells its teammate the target");
    await action(solo, "chat", { text: "help" });
    await untilBot(solo, v => v.chat.at(-1).name === "Nova (bot)" && v.chat.at(-1).text.includes("Send that row"));
    const rule = announced.role.powerRules[target];
    await action(solo, "chat", { text: `For ${["STAR", "MOON", "TRIANGLE"][target]}: choose channel ${"ABC"[rule.channel]}, strength ${rule.strength}.` });
    const ready = await untilBot(solo, v => v.role.incoming === rule.channel && v.chat.some(m => /Power (set to|is at)/.test(m.text)));
    const dial = ready.role.shifts.findIndex(shift => (ready.role.incoming + shift) % 3 === ready.role.exits[target]);
    await action(solo, "set", { field: "relay", value: dial });
    await action(solo, "lock");
  }
  const completed = await untilBot(solo, v => v.phase === (round === 2 ? "won" : "between"));
  verify(completed.repairs === round + 1 && completed.strikes === 0, "Human and bot complete repair with shared clues");
  if (round < 2) {
    await untilBot(solo, v => v.players.find(p => p.isBot).ready);
    await action(solo, "ready");
    verify((await read(solo)).role.puzzleId !== puzzleId, "Solo rotates roles and generates new clues");
  }
}
await action(solo, "lobby");
verify((await read(solo)).players.some(p => p.isBot), "Replay keeps the solo teammate");
await action(solo, "bot");
verify((await read(solo)).players.length === 1, "Switching to friends removes the bot");
const friend = await join(solo, "RealFriend");
await action(friend, "bot", {}, 403);
await action(solo, "bot", {}, 400);
verify((await read(friend)).players.length === 2, "Solo room can become a real multiplayer room");
console.log("PASS complete bot mission, both roles, private clues, conversation, replay, switching to friends");
const offlineHost = await create("OfflineHost"), active = await join(offlineHost, "ActivePlayer");
await database.prepare("UPDATE members SET last_seen = ? WHERE id = ?").bind(Date.now() - 60000, offlineHost.playerId).run();
await action(active, "claim");
await action(active, "lobby");
verify((await read(active)).players.length === 1, "Lobby reset removes an offline former host");
await request("/api/rooms/" + offlineHost.code, null, offlineHost, 401);
await action(active, "bot"); await botTurn(active);
await action(active, "leave");
const empty = JSON.parse((await database.prepare("SELECT state FROM rooms WHERE code = ?").bind(active.code).first()).state);
verify(empty.players.length === 0 && empty.hostId === "", "Last human departure cannot leave a bot host");
const deadlineHost = await create("DeadlineHost", "mission"), deadlineGuest = await join(deadlineHost, "DeadlineGuest");
await action(deadlineHost, "ready"); await action(deadlineGuest, "ready"); await action(deadlineHost, "start");
await editState(deadlineHost.code, state => { state.deadline = Date.now() - 1000; });
const expired = await read(deadlineGuest);
verify(expired.phase === "lost" && expired.finishedAt === expired.deadline, "Server deadline expires without a client timer action");
verify((await read(deadlineHost)).phase === "lost", "Deadline result is shared across sessions");
console.log("PASS offline host takeover, seat removal, bot departure cleanup, deadline expiry");
console.log("PASS " + checks + " integration assertions");

} finally { await worker.dispose(); }
