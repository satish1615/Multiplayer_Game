import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFile } from 'node:fs/promises';

const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const moduleUrl = js => 'data:text/javascript;base64,' + Buffer.from(js).toString('base64');
const engineUrl = moduleUrl(compile(await readFile('lib/reactor-engine.ts', 'utf8')));
const { makeRoom, apply, advance, project, WORLD, INPUT_LEASE_MS, move, blocked } = await import(engineUrl);
const motionSource = (await readFile('lib/reactor-motion.ts', 'utf8')).replace("'./reactor-engine'", JSON.stringify(engineUrl));
const { LocalMotion, CORRECTION_SPEED, moveFor, syncDelay } = await import(moduleUrl(compile(motionSource)));
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; };
const START = 100000;
const make = () => {
  const r = makeRoom('ABCDEF', 'host', 'Tester', 'iris', START, false);
  r.phase = 'playing'; r.round = 1; r.startedAt = START; r.endsAt = START + 90000; r.simAt = START;
  r.players[0].x = 400; r.players[0].y = 250;
  r.nextRareAt = START + 20000;
  return r;
};

// Deterministic network, real engine and the EXACT predictor used by canvas.
// No localhost-speed assumption: delay both request delivery and responses.
function simulate({ rtts, fps, changes, duration = 4000 }) {
  const r = make(), predictor = new LocalMotion(), points = [], events = [];
  let now = START, version = 0, seq = 0, cycle = 0, nextSend = START;
  let input = { x: 0, y: 0, dash: 0, dashUntil: 0 };
  let nextFrame = START, inFlight = false, changeIndex = 0, directionAt = 0;
  predictor.accept(structuredClone(project(r, 'host', version, START)), START, START);
  for (; now <= START + duration; now += 5) {
    while (changeIndex < changes.length && START + changes[changeIndex].at <= now) {
      const change = changes[changeIndex++];
      input = { ...input, x: change.x, y: change.y, ...(change.dash ? { dash: input.dash + 1, dashUntil: now + WORLD.dashMs } : {}) };
      predictor.record(input, now); directionAt = now;
    }
    for (let i = events.length - 1; i >= 0; i--) if (events[i].at <= now) {
      const event = events.splice(i, 1)[0];
      if (event.action) {
        apply(r, 'host', event.action, now);
        events.push({ at: now + event.down, snapshot: structuredClone(project(r, 'host', ++version, now)), sentAt: event.sentAt });
      } else {
        predictor.accept(event.snapshot, event.sentAt, now);
        inFlight = false;
        nextSend = now + syncDelay(now - event.sentAt, 200, directionAt > event.sentAt);
      }
    }
    if (!inFlight && now >= nextSend) {
      inFlight = true;
      const rtt = rtts[cycle++ % rtts.length], action = { type: 'input', x: input.x, y: input.y, seq: seq++, dash: input.dash };
      predictor.sending(action.seq, now);
      events.push({ at: now + rtt / 2, down: rtt / 2, action, sentAt: now });
    }
    if (now + .001 >= nextFrame) {
      const point = predictor.frame(now, now);
      points.push({ ...point, at: now });
      nextFrame += 1000 / fps;
    }
  }
  return { r, points, predictor };
}

check(syncDelay(800, 200) === 0, 'Slow responses are not followed by an extra idle delay');
check(syncDelay(20, 200) === 180, 'Fast connections keep five regular heartbeats per second');
check(syncDelay(20, 200, true) === 60, 'Input changes use a bounded 80ms send interval');

// Reproduce the old failure: at 20fps its 40ms cap alone loses 20% of movement.
const old = { x: 400, y: 250 };
for (let i = 0; i < 20; i++) move(old, WORLD.speed * .04, 0);
check(Math.abs(old.x - 400 - WORLD.speed) > 30, 'Baseline reproduces old slow-frame distance loss');
for (const fps of [20, 30, 60]) {
  for (const rtts of [[600], [900], [1200], [600, 1000, 800, 1200]]) {
    const { points } = simulate({ rtts, fps, changes: [{ at: 0, x: 1, y: 0 }], duration: 1600 });
    const end = points.at(-1), expected = 400 + WORLD.speed * (end.at - START) / 1000;
    check(Math.abs(end.x - expected) < 22, `${fps}fps / ${rtts}ms: steady held movement stays near intended distance (${(end.x - expected).toFixed(1)}px)`);
    check(points.every((p, i) => !i || p.x >= points[i - 1].x - .01), `${fps}fps / ${rtts}ms: late packets never pull steady movement backwards`);
    check(points.every((p, i) => !i || Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y) <= (WORLD.speed + CORRECTION_SPEED) * (p.at - points[i - 1].at) / 1000 + .01), `${fps}fps / ${rtts}ms: no unbounded position snaps`);
  }
}

for (const fps of [20, 60]) {
  const { points, r } = simulate({ rtts: [800, 600, 1200, 700], fps, duration: 5500,
    changes: [{ at: 0, x: 1, y: 0 }, { at: 500, x: -1, y: 0 }, { at: 900, x: 0, y: 1, dash: true }, { at: 1200, x: 0, y: 0 }] });
  const before = points.filter(p => p.at <= START + 500).at(-1), after = points.find(p => p.at >= START + 600);
  check(after.x < before.x, `${fps}fps: reversal responds before the next server response`);
  check(points.every(p => !blocked(p.x, p.y)), `${fps}fps: prediction and correction stay inside collision geometry`);
  check(points.every((p, i) => !i || Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y) <= (WORLD.dashSpeed + CORRECTION_SPEED) * (p.at - points[i - 1].at) / 1000 + .01), `${fps}fps: turns, stop and dash never teleport`);
  check(Math.hypot(points.at(-1).x - r.players[0].x, points.at(-1).y - r.players[0].y) < 2, `${fps}fps: after stopping, visual position converges to the authoritative position`);
}

const r = make(), p = r.players[0];
apply(r, 'host', { type: 'input', x: .2, y: 0, seq: 0, dash: 0 }, START);
advance(r, START + 1200);
check(Math.abs(p.x - 400 - 1200 / 1000 * WORLD.speed * .2) < .01, 'A 1200ms response gap does not expire valid movement');
advance(r, START + INPUT_LEASE_MS + 100); const stopped = { x: p.x, y: p.y };
advance(r, START + INPUT_LEASE_MS + 700);
check(p.x === stopped.x && p.y === stopped.y, 'Disconnected input still expires after the bounded lease');

const predictor = new LocalMotion();
predictor.accept(project(r, 'host', 3, START + 2700), START + 2600, START + 2800);
const refreshed = predictor.frame(START + 2800, START + 2800);
check(refreshed.x === p.x && refreshed.y === p.y, 'Refresh starts at the server position without replaying old keys');
const wall = { x: 260, y: 186 };
moveFor(wall, { x: 1, y: 0, dashUntil: START + 180 }, START, START + 250);
check(wall.x <= 268 && !blocked(wall.x, wall.y), 'A slow dash frame cannot tunnel through a wall');
console.log(`Passed ${checks} motion checks: 20/30/60fps, 600–1200ms delays, jitter, turns, dash, stop, disconnect and refresh.`);
