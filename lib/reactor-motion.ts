import { INPUT_LEASE_MS, WORLD, move, type Point, type Snapshot } from './reactor-engine';

export type MotionInput = { x: number; y: number; dashUntil: number };
type Sample = MotionInput & { at: number };
type SentInput = { seq: number; at: number };
const STILL: MotionInput = { x: 0, y: 0, dashUntil: 0 };
const HISTORY_MS = 8000;
// Corrections must not turn a late packet into a visible teleport. The server
// still owns collisions, pickups, hazards and scores; this only draws a runner.
export const CORRECTION_SPEED = 55;

export function moveFor(point: Point, input: MotionInput, from: number, to: number) {
  while (from < to) {
    const end = Math.min(to, from + 25, input.dashUntil > from ? input.dashUntil : Infinity);
    const speed = from < input.dashUntil ? WORLD.dashSpeed : WORLD.speed;
    move(point, input.x * speed * (end - from) / 1000, input.y * speed * (end - from) / 1000);
    from = end;
  }
}

// One sequential request is enough: never add another idle 80ms after a slow
// response. Fast connections remain bounded to five heartbeats per second.
export function syncDelay(elapsed: number, interval: number, urgent = false) {
  return Math.max(0, (urgent ? 80 : interval) - elapsed);
}

export class LocalMotion {
  private history: Sample[] = [];
  private sent: SentInput[] = [];
  private room: Snapshot | null = null;
  private scope = '';
  private origin: Point = { x: 0, y: 0 };
  private originAt = 0;
  private input: MotionInput = { ...STILL };
  private receivedAt = 0;
  private frameAt = 0;
  private position: Point = { x: 0, y: 0 };
  private acknowledged = false;

  record(input: MotionInput, at: number) {
    this.input = { ...input };
    this.history.push({ ...input, at });
    // Keep the input spanning the beginning of the retained interval.
    while (this.history.length > 1 && this.history[1].at < at - HISTORY_MS) this.history.shift();
  }

  sending(seq: number, at: number) {
    this.sent.push({ seq, at });
    this.sent = this.sent.filter(command => command.at >= at - HISTORY_MS);
  }

  accept(room: Snapshot, sentAt: number, now: number) {
    const me = room.players.find(p => p.id === room.me);
    if (!me) return;
    const scope = `${room.code}/${room.me}/${room.round}`;
    if (scope !== this.scope) {
      this.scope = scope; this.history = [{ ...this.input, at: now }]; this.sent = [];
      this.position = { x: me.x, y: me.y }; this.frameAt = now;
    }
    this.room = room; this.receivedAt = now;
    this.origin = { x: me.x, y: me.y };
    const ack = this.sent.find(command => command.seq === me.input.seq);
    this.acknowledged = !!ack;
    // apply() advances old input before acknowledging a new command. Replay
    // from that command's send time, not from an arbitrary 220ms packet age.
    this.originAt = ack ? ack.at + Math.max(0, room.simAt - me.input.at) : now;
    if (room.phase === 'lobby' || room.phase === 'countdown') {
      this.position = { ...this.origin }; this.frameAt = now;
    }
  }

  private replay(point: Point, from: number, to: number) {
    if (from >= to) return;
    let input: MotionInput = STILL;
    for (const sample of this.history) {
      if (sample.at <= from) input = sample;
      else if (sample.at < to) {
        moveFor(point, input, from, sample.at); from = sample.at; input = sample;
      } else break;
    }
    moveFor(point, input, from, to);
  }

  frame(now: number, serverNow: number): Point {
    const room = this.room;
    if (!room) return this.position;
    const active = room.phase === 'playing' && serverNow < room.endsAt;
    // A suspended tab does not replay minutes of held keys. Ordinary 20/30fps
    // frames retain ALL elapsed time and use collision-safe 25ms substeps.
    const from = Math.max(this.frameAt, now - 250);
    const dt = Math.max(0, now - from) / 1000;
    this.frameAt = now;
    if (room.phase === 'countdown' || room.phase === 'lobby') return this.position;
    const until = Math.min(now, this.receivedAt + INPUT_LEASE_MS);
    if (active) this.replay(this.position, from, until);
    const target = { ...this.origin };
    // A refreshed tab has no acknowledged input history. Do not extrapolate
    // another tab's keys; start from its committed position instead.
    if (active && this.acknowledged) this.replay(target, this.originAt, until);
    if (active && !this.acknowledged) return { ...this.position };
    const dx = target.x - this.position.x, dy = target.y - this.position.y;
    const distance = Math.hypot(dx, dy);
    // A tiny dead zone prevents collision rounding from buzzing the sprite.
    if (distance > .5) {
      const amount = Math.min(distance * (1 - Math.exp(-6 * dt)), CORRECTION_SPEED * dt);
      const correction = { x: dx / distance, y: dy / distance, dashUntil: 0 };
      // Substeps prevent a correction crossing a thin wall on a slow frame.
      moveFor(this.position, correction, 0, amount / WORLD.speed * 1000);
    }
    return { ...this.position };
  }
}
