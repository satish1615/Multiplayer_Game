// Shared deterministic rules. Only the server advances the authoritative room.
export const CHARACTERS = [
  { id: 'iris', name: 'Iris', color: '#ef795d', bio: 'The curious explorer' },
  { id: 'orbit', name: 'Orbit', color: '#369ada', bio: 'Ready for lift-off' },
  { id: 'juno', name: 'Juno', color: '#9e75dc', bio: 'Small steps, big plans' },
  { id: 'comet', name: 'Comet', color: '#eda64a', bio: 'Quick on their paws' },
  { id: 'lumi', name: 'Lumi', color: '#74c8d6', bio: 'A gentle little giant' },
  { id: 'jet', name: 'Jet', color: '#df6554', bio: 'Always on the move' },
] as const;
export type Character = typeof CHARACTERS[number]['id'];
export const WORLD = { width: 960, height: 600, radius: 17, speed: 165, dashSpeed: 460, dashMs: 180, cooldown: 3000, carry: 3 };
export const WALLS = [
  { x: 285, y: 170, w: 96, h: 34 }, { x: 579, y: 170, w: 96, h: 34 },
  { x: 285, y: 396, w: 96, h: 34 }, { x: 579, y: 396, w: 96, h: 34 },
];
export const LASERS = [{ x: 472, y: 208, w: 16, h: 184 }, { x: 390, y: 292, w: 180, h: 16 }];
export type Point = { x: number; y: number };
export type Orb = Point & { id: number; value: 1 | 2; expires: number; blockedId?: string; unlockAt?: number };
export type Runner = Point & {
  id: string; name: string; character: Character; ready: boolean; isBot: boolean;
  joined: number; lastSeen: number; home: Point; vx: number; vy: number; facing: number;
  score: number; bag: (1 | 2)[]; cooldownUntil: number; dashUntil: number; shieldUntil: number;
  input: { x: number; y: number; seq: number; dash: number; at: number };
  target?: number; thinkAt?: number;
};
export type Room = {
  game: 'reactor-rush'; code: string; hostId: string; phase: 'lobby' | 'countdown' | 'playing' | 'finished';
  duration: number; players: Runner[]; createdAt: number; round: number; startedAt: number; endsAt: number;
  simAt: number; balls: Orb[]; respawns: number[]; nextRareAt: number; rareNoticeAt: number;
  seed: number; nextBall: number; processed: string[]; winners: string[]; notice: string;
  eventId: number; events: { id: number; at: number; playerId: string; kind: 'deposit' | 'drop' | 'rare'; value: number }[];
};
export type Action = {
  type: 'input' | 'ready' | 'character' | 'duration' | 'bots' | 'start' | 'rematch' | 'leave';
  requestId?: string; x?: number; y?: number; seq?: number; dash?: number;
  value?: number; character?: Character; ready?: boolean;
};
export class ReactorError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
function random(r: Room) { r.seed = (Math.imul(r.seed, 1664525) + 1013904223) >>> 0; return r.seed / 4294967296; }
export function blocked(x: number, y: number, radius = WORLD.radius) {
  if (((x - 480) / (428 - radius)) ** 2 + ((y - 285) / (244 - radius)) ** 2 > 1) return true;
  return WALLS.some(w => x > w.x - radius && x < w.x + w.w + radius && y > w.y - radius && y < w.y + w.h + radius);
}
export function move(p: Point, dx: number, dy: number) {
  if (!blocked(p.x + dx, p.y)) p.x += dx;
  if (!blocked(p.x, p.y + dy)) p.y += dy;
}
export function laserState(index: number, time: number, startedAt: number): 'off' | 'warning' | 'on' {
  if (!startedAt || time < startedAt + 5000) return 'off';
  const phase = (time - startedAt - 5000 + index * 4700) % 10000;
  return phase < 1300 ? 'warning' : phase < 2600 ? 'on' : 'off';
}
export function runner(id: string, name: string, character: Character, now: number, isBot = false): Runner {
  return { id, name, character, isBot, ready: isBot, joined: now, lastSeen: now, x: 480, y: 300, home: { x: 480, y: 300 }, vx: 0, vy: 0, facing: 1, score: 0, bag: [], cooldownUntil: 0, dashUntil: 0, shieldUntil: 0, input: { x: 0, y: 0, seq: -1, dash: 0, at: 0 } };
}
export function makeRoom(code: string, id: string, name: string, character: Character, now: number, solo: boolean): Room {
  const r: Room = { game: 'reactor-rush', code, hostId: id, phase: 'lobby', duration: 90, players: [runner(id, name, character, now)], createdAt: now, round: 0, startedAt: 0, endsAt: 0, simAt: now, balls: [], respawns: [], nextRareAt: 0, rareNoticeAt: 0, seed: crypto.getRandomValues(new Uint32Array(1))[0], nextBall: 0, processed: [], winners: [], notice: 'Choose your crew, ready up, and race for energy.', eventId: 0, events: [] };
  if (solo) { setBots(r, 2, now); r.players[0].ready = true; }
  placeHomes(r);
  return r;
}
function setBots(r: Room, count: number, now: number) {
  const humans = r.players.filter(p => !p.isBot);
  if (humans.length + count > 6) throw new ReactorError('There is room for six players, including bots.');
  r.players = humans;
  for (let i = 0; i < count; i++) {
    const char = CHARACTERS[(i + 3) % 6];
    r.players.push(runner(crypto.randomUUID(), char.name, char.id, now, true));
  }
  placeHomes(r);
}
export function placeHomes(r: Room) {
  const count = r.players.length;
  r.players.forEach((p, i) => {
    const angle = count === 2 ? Math.PI + i * Math.PI : -Math.PI / 2 + i * 2 * Math.PI / count;
    p.home = { x: Math.round(480 + Math.cos(angle) * 352), y: Math.round(300 + Math.sin(angle) * 202) };
    p.x = p.home.x; p.y = p.home.y; p.vx = 0; p.vy = 0;
  });
}
function spawn(r: Room, value: 1 | 2, now: number) {
  for (let i = 0; i < 120; i++) {
    const point = { x: 190 + random(r) * 580, y: 110 + random(r) * 380 };
    if (blocked(point.x, point.y, 32) || r.players.some(p => distance(p.home, point) < 85) || r.balls.some(b => distance(b, point) < 42)) continue;
    r.balls.push({ ...point, id: ++r.nextBall, value, expires: value === 2 ? now + 15000 : 0 }); return;
  }
}
function event(r: Room, p: Runner, kind: 'deposit' | 'drop' | 'rare', value: number, now: number) {
  r.events.push({ id: ++r.eventId, playerId: p.id, kind, value, at: now }); r.events = r.events.slice(-18);
}
function segmentClear(a: Point, b: Point) {
  const steps = Math.ceil(distance(a, b) / 12);
  for (let i = 1; i <= steps; i++) if (blocked(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps, 20)) return false;
  return true;
}
function steer(p: Point, goal: Point): Point {
  if (segmentClear(p, goal)) return goal;
  const points = WALLS.flatMap(w => [
    { x: w.x - 25, y: w.y - 25 }, { x: w.x + w.w + 25, y: w.y - 25 },
    { x: w.x - 25, y: w.y + w.h + 25 }, { x: w.x + w.w + 25, y: w.y + w.h + 25 },
  ]);
  let best: Point = p, score = Infinity;
  for (const a of points) {
    if (!segmentClear(p, a)) continue;
    if (segmentClear(a, goal)) {
      const d = distance(p, a) + distance(a, goal); if (d < score) { score = d; best = a; }
    } else for (const b of points) if (segmentClear(a, b) && segmentClear(b, goal)) {
      const d = distance(p, a) + distance(a, b) + distance(b, goal); if (d < score) { score = d; best = a; }
    }
  }
  return best;
}
function botInput(r: Room, p: Runner, now: number) {
  if ((p.thinkAt || 0) > now) return;
  p.thinkAt = now + 180 + random(r) * 180;
  let goal: Point = p.home;
  const remaining = r.endsAt - now;
  if (p.bag.length < 3 && !p.bag.includes(2) && !(p.bag.length && remaining < 6500)) {
    const candidates = r.balls.filter(b => !b.blockedId || b.blockedId !== p.id || (b.unlockAt || 0) < now);
    const target = candidates.sort((a, b) => distance(p, a) / a.value - distance(p, b) / b.value)[0];
    if (target) goal = target;
  }
  const next = steer(p, goal), d = distance(p, next);
  p.input = { ...p.input, x: d > 4 ? (next.x - p.x) / d : 0, y: d > 4 ? (next.y - p.y) / d : 0, at: now };
  if (d > 120 && now >= p.cooldownUntil && random(r) < .32) {
    p.dashUntil = now + WORLD.dashMs; p.cooldownUntil = now + WORLD.cooldown;
  }
}
function step(r: Room, now: number, dt: number) {
  for (const p of r.players) {
    if (p.isBot) botInput(r, p, now);
    const active = p.isBot || now - p.input.at < 700;
    const speed = now < p.dashUntil ? WORLD.dashSpeed : WORLD.speed;
    p.vx = active ? p.input.x * speed : 0; p.vy = active ? p.input.y * speed : 0;
    if (p.vx) p.facing = p.vx < 0 ? -1 : 1;
    move(p, p.vx * dt, p.vy * dt);
    if (p.bag.length && distance(p, p.home) < 37) {
      const value = p.bag.reduce<number>((sum, item) => sum + item, 0);
      p.score += value; p.bag = []; event(r, p, 'deposit', value, now);
    }
    if (now > p.shieldUntil && p.bag.length && LASERS.some((l, i) => laserState(i, now, r.startedAt) === 'on' && p.x > l.x - 13 && p.x < l.x + l.w + 13 && p.y > l.y - 13 && p.y < l.y + l.h + 13)) {
      const value = p.bag.pop()!;
      r.balls.push({ x: p.x, y: p.y, id: ++r.nextBall, value, expires: value === 2 ? now + 15000 : 0, blockedId: p.id, unlockAt: now + 1800 });
      p.shieldUntil = now + 2000; event(r, p, 'drop', value, now);
    }
    if (p.bag.length < WORLD.carry) {
      for (let i = r.balls.length - 1; i >= 0 && p.bag.length < WORLD.carry; i--) {
        const b = r.balls[i];
        if ((b.value === 2 && p.bag.includes(2)) || (b.blockedId === p.id && (b.unlockAt || 0) > now) || distance(p, b) > (b.value === 2 ? 30 : 27)) continue;
        p.bag.push(b.value); r.balls.splice(i, 1);
        if (b.value === 1) r.respawns.push(now + 4000); else event(r, p, 'rare', 2, now);
      }
    }
  }
  r.balls = r.balls.filter(b => !b.expires || b.expires > now);
  const due = r.respawns.filter(at => at <= now); r.respawns = r.respawns.filter(at => at > now);
  for (const _ of due) if (r.balls.filter(b => b.value === 1).length < Math.min(12, 6 + r.players.length)) spawn(r, 1, now);
  if (now >= r.nextRareAt && !r.balls.some(b => b.value === 2) && !r.players.some(p => p.bag.includes(2))) {
    spawn(r, 2, now); r.nextRareAt = now + 20000 + random(r) * 10000; r.rareNoticeAt = now;
  }
}
export function advance(r: Room, now: number) {
  const host = r.players.find(p => p.id === r.hostId);
  if (!host || (!host.isBot && now - host.lastSeen > 15000)) {
    const successor = r.players.find(p => !p.isBot && now - p.lastSeen < 6000);
    if (successor) r.hostId = successor.id;
  }
  if (r.phase !== 'playing' && r.phase !== 'countdown') { r.simAt = now; return; }
  if (r.phase === 'countdown' && now >= r.startedAt) { r.phase = 'playing'; r.simAt = r.startedAt; }
  if (r.phase === 'countdown') return;
  const end = Math.min(now, r.endsAt);
  // Inputs stop after 700ms without a heartbeat. Long abandoned matches finish
  // without simulating an unlimited backlog; nobody can gain offline points.
  if (end - r.simAt > 1600) {
    r.simAt = end - 1600;
    for (const p of r.players) { p.input.at = Math.min(p.input.at, r.simAt - 701); p.dashUntil = 0; }
  }
  while (r.simAt < end) {
    const next = Math.min(r.simAt + 25, end);
    step(r, next, (next - r.simAt) / 1000); r.simAt = next;
  }
  if (now >= r.endsAt) {
    r.phase = 'finished';
    const max = Math.max(...r.players.map(p => p.score));
    r.winners = r.players.filter(p => p.score === max).map(p => p.id);
    r.players.forEach(p => { p.vx = 0; p.vy = 0; p.input.x = 0; p.input.y = 0; });
    r.notice = r.winners.length > 1 ? 'A shared victory!' : 'Reactor charged. We have a winner!';
  }
}
export function apply(r: Room, id: string, action: Action, now: number) {
  const p = r.players.find(p => p.id === id);
  if (!p || p.isBot) throw new ReactorError('Your seat is no longer in this room. Join again.', 401);
  p.lastSeen = now;
  advance(r, now);
  if (action.requestId && r.processed.includes(action.requestId)) return;
  if (action.type === 'input') {
    if (r.phase !== 'playing' && r.phase !== 'countdown') return;
    if ((action.seq ?? -1) <= p.input.seq) return;
    let x = action.x || 0, y = action.y || 0;
    const length = Math.hypot(x, y); if (length > 1) { x /= length; y /= length; }
    const dash = action.dash || 0;
    if (r.phase === 'playing' && dash > p.input.dash && now >= p.cooldownUntil && length > .1) {
      p.dashUntil = now + WORLD.dashMs; p.cooldownUntil = now + WORLD.cooldown;
    }
    p.input = { x, y, seq: action.seq!, dash: Math.max(p.input.dash, dash), at: now };
    return;
  }
  if (action.type === 'leave') {
    r.players = r.players.filter(other => other.id !== id);
    if (r.hostId === id) r.hostId = r.players.find(other => !other.isBot)?.id || '';
    if (r.phase === 'lobby') placeHomes(r);
  } else if (action.type === 'rematch') {
    if (id !== r.hostId) throw new ReactorError('Only the host can return everyone to the lobby.', 403);
    if (r.phase !== 'finished') throw new ReactorError('Finish this match first.');
    r.phase = 'lobby'; r.balls = []; r.events = []; r.winners = [];
    r.players.forEach(other => { other.ready = other.isBot; other.bag = []; other.score = 0; }); placeHomes(r);
  } else {
    if (r.phase !== 'lobby') throw new ReactorError('Change this setting in the lobby.');
    if (action.type === 'ready') p.ready = action.ready ?? !p.ready;
    else if (action.type === 'character') { p.character = action.character!; p.ready = false; }
    else {
      if (id !== r.hostId) throw new ReactorError('Only the host can change this setting.', 403);
      if (action.type === 'duration') { r.duration = action.value!; r.players.forEach(other => { if (!other.isBot) other.ready = false; }); }
      if (action.type === 'bots') setBots(r, action.value!, now);
      if (action.type === 'start') {
        if (r.players.length < 2) throw new ReactorError('Invite another player or add a bot.');
        if (r.players.some(other => !other.ready || (!other.isBot && now - other.lastSeen > 6000))) throw new ReactorError('Everyone must be connected and ready.');
        placeHomes(r); r.round++; r.startedAt = now + 3000; r.endsAt = r.startedAt + r.duration * 1000; r.simAt = r.startedAt; r.phase = 'countdown'; r.balls = []; r.respawns = []; r.events = []; r.winners = []; r.nextRareAt = r.startedAt + 20000; r.rareNoticeAt = 0;
        r.players.forEach(other => { other.score = 0; other.bag = []; other.cooldownUntil = 0; other.dashUntil = 0; other.shieldUntil = 0; other.input = { x: 0, y: 0, seq: -1, dash: 0, at: now }; other.thinkAt = 0; });
        for (let i = 0; i < Math.min(12, 6 + r.players.length); i++) spawn(r, 1, r.startedAt);
      }
    }
  }
  if (action.requestId) { r.processed.push(action.requestId); r.processed = r.processed.slice(-80); }
}
export function project(r: Room, id: string, version: number, now: number) {
  return { code: r.code, hostId: r.hostId, phase: r.phase, duration: r.duration, round: r.round, startedAt: r.startedAt, endsAt: r.endsAt, simAt: r.simAt, serverTime: now, nextRareAt: r.nextRareAt, rareNoticeAt: r.rareNoticeAt, balls: r.balls, winners: r.winners, notice: r.notice, events: r.events, version, me: id,
    players: r.players.map(({ target: _target, thinkAt: _think, ...p }) => p) };
}
export type Snapshot = ReturnType<typeof project>;
export type Seat = { code: string; token: string; playerId: string };
