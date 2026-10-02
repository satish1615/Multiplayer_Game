'use client';

import { useEffect, useRef, useState } from 'react';
import { readGameResponse } from './client-response';
import { requestId } from './request-id';
import type { Action, Character, Seat, Snapshot } from './reactor-engine';

export type Controls = { x: number; y: number; dash: number; dashUntil: number; changedAt: number };
class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
const KEY = 'reactor-rush-seat-v1';
export const LIVE_URL = 'https://split-signal-satish.satishofficial016.chatgpt.site';

async function request<T>(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(7000) });
  const value = await readGameResponse<T & { error?: string }>(response);
  if (!response.ok || value.error) throw new ApiError(value.error || 'The room is unavailable.', response.status);
  return value;
}

export function useReactor() {
  const [seat, setSeat] = useState<Seat | null>(null);
  const [room, setRoom] = useState<Snapshot | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [seatLost, setSeatLost] = useState(false);
  const [connection, setConnection] = useState<'connecting' | 'online' | 'reconnecting'>('connecting');
  const [latency, setLatency] = useState(0);
  const latest = useRef<Snapshot | null>(null);
  const offset = useRef(0);
  const received = useRef(0);
  const controls = useRef<Controls>({ x: 0, y: 0, dash: 0, dashUntil: 0, changedAt: 0 });
  const seq = useRef(0), round = useRef(-1), queue = useRef<Action[]>([]);
  const wake = useRef(() => {});

  function accept(next: Snapshot, sent: number) {
    if (latest.current && next.code === latest.current.code && next.version < latest.current.version) return;
    if (!next.players || typeof next.version !== 'number') throw new Error('The room sent an incomplete update. Trying again.');
    const now = Date.now(), me = next.players.find(p => p.id === next.me);
    offset.current = next.serverTime - (sent + now) / 2;
    received.current = now;
    if (round.current !== next.round) {
      round.current = next.round; controls.current.dash = me?.input.dash || 0; controls.current.dashUntil = 0;
    }
    seq.current = Math.max(seq.current, (me?.input.seq ?? -1) + 1);
    controls.current.dash = Math.max(controls.current.dash, me?.input.dash || 0);
    setSeatLost(false); latest.current = next; setRoom(next); setConnection('online'); setLatency(now - sent);
  }
  function forget() {
    try { sessionStorage.removeItem(KEY); } catch { /* session still works in memory */ }
    latest.current = null; queue.current = []; setSeat(null); setRoom(null); setBusy(false); setError(''); setSeatLost(false);
    controls.current.x = 0; controls.current.y = 0;
  }
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (saved && /^[A-Z2-9]{6}$/.test(saved.code) && /^[a-f0-9]{64}$/.test(saved.token) && typeof saved.playerId === 'string') setSeat(saved);
    } catch { /* no saved seat */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!seat) return;
    let cancelled = false, inFlight = false, timer: ReturnType<typeof setTimeout>, failures = 0, dueAt = 0;
    const tick = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      const sent = Date.now(), state = latest.current, command = queue.current.shift();
      const playing = state?.phase === 'playing' || state?.phase === 'countdown';
      const action = command || (playing ? {
        type: 'input', x: document.hidden ? 0 : controls.current.x, y: document.hidden ? 0 : controls.current.y,
        seq: seq.current++, dash: controls.current.dash,
      } : undefined);
      try {
        const result = await request<Snapshot & { left?: boolean }>(`/api/reactor/${seat.code}`, {
          method: action ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${seat.token}` },
          ...(action ? { body: JSON.stringify(action) } : {}),
        });
        if (cancelled) return;
        if (result.left) { forget(); return; }
        accept(result, sent); failures = 0;
        if (!command) setError(previous => previous.startsWith('Connection:') ? '' : previous);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && [401, 404].includes(e.status)) setSeatLost(true);
        if (command) setError(e instanceof Error ? e.message : 'Could not apply that action. Try again.');
        else {
          failures++; setConnection('reconnecting');
          setError('Connection: ' + (e instanceof Error ? e.message : 'Trying to reconnect. Your seat is saved.'));
        }
      } finally {
        inFlight = false;
        if (command) setBusy(queue.current.length > 0);
        if (!cancelled) {
          const active = latest.current?.phase === 'playing' || latest.current?.phase === 'countdown';
          const interval = failures ? Math.min(3000, 600 * failures) : document.hidden ? 1500 : active ? 200 : 1000;
          const delay = queue.current.length ? 80 : Math.max(80, interval - (Date.now() - sent));
          dueAt = Date.now() + delay; timer = setTimeout(tick, delay);
        }
      }
    };
    wake.current = () => { if (!inFlight && Date.now() + 80 < dueAt) { clearTimeout(timer); dueAt = Date.now() + 80; timer = setTimeout(tick, 80); } };
    tick();
    const resume = () => { controls.current.x = 0; controls.current.y = 0; wake.current(); };
    window.addEventListener('blur', resume); document.addEventListener('visibilitychange', resume);
    return () => { cancelled = true; clearTimeout(timer); wake.current = () => {}; window.removeEventListener('blur', resume); document.removeEventListener('visibilitychange', resume); };
  // A seat owns one sequential request loop. Snapshot changes do not restart it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seat]);

  async function enter(name: string, character: Character, mode: 'create' | 'join' | 'solo', code: string) {
    setBusy(true); setError('');
    try {
      const sent = Date.now();
      const result = await request<{ session: Seat; room: Snapshot }>(mode === 'join' ? '/api/reactor/join' : '/api/reactor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'join' ? { name, character, code } : { name, character, solo: mode === 'solo' }),
      });
      try { sessionStorage.setItem(KEY, JSON.stringify(result.session)); } catch { /* memory only */ }
      latest.current = null; accept(result.room, sent); setSeat(result.session);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not enter the room.'); }
    finally { setBusy(false); }
  }
  function action(value: Action) {
    if (!seat || queue.current.length > 3) return;
    const id = requestId();
    setBusy(true); setError(''); queue.current.push({ ...value, requestId: id }); wake.current();
  }
  function direction(x: number, y: number) {
    const d = Math.max(1, Math.hypot(x, y)); x /= d; y /= d;
    const changed = Math.abs(controls.current.x - x) + Math.abs(controls.current.y - y) > .08;
    controls.current.x = x; controls.current.y = y;
    if (changed) { controls.current.changedAt = Date.now(); wake.current(); }
  }
  function dash() {
    const r = latest.current, p = r?.players.find(p => p.id === r.me), now = Date.now() + offset.current;
    if (r?.phase !== 'playing' || !p || now < p.cooldownUntil || Date.now() < controls.current.dashUntil || Math.hypot(controls.current.x, controls.current.y) < .1) return;
    controls.current.dash++; controls.current.dashUntil = Date.now() + 180; wake.current();
  }
  return { seat, room, loaded, busy, error, setError, seatLost, connection, latency, latest, offset, received, controls, enter, action, forget, direction, dash };
}
