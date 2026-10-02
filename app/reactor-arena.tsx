'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { CHARACTERS, LASERS, WALLS, WORLD, laserState, move, type Snapshot, type Point } from '@/lib/reactor-engine';
import type { Controls } from '@/lib/reactor-client';

export const SEAT_COLORS = ['#5bc8ff', '#ffa974', '#c3a1ff', '#8ee1b2', '#ffd86e', '#ff9cc5'];
type Props = {
  latest: RefObject<Snapshot | null>; offset: RefObject<number>; received: RefObject<number>;
  controls: RefObject<Controls>; muted: boolean;
};
const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); };
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color = '#fff', size = 13) {
  ctx.font = `700 ${size}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 4; ctx.strokeStyle = '#16334d'; ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y);
}

export default function ReactorArena({ latest, offset, received, controls }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current!, ctx = element.getContext('2d'); if (!ctx) return;
    const art = new Image(), orbs = new Image(), crew = new Image();
    art.src = '/reactor/arena.png'; orbs.src = '/reactor/energy.png'; crew.src = '/reactor/characters.png';
    const positions = new Map<string, Point>();
    let frame = 0, before = performance.now(), previousVersion = -1, previousRound = -1, width = 960, height = 600, dpr = 1;
    let local: Point | null = null, correction = { x: 0, y: 0 }, camera = { x: 480, y: 300 };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = new ResizeObserver(entries => {
      width = entries[0].contentRect.width; height = entries[0].contentRect.height;
      dpr = Math.min(2, window.devicePixelRatio || 1); element.width = Math.round(width * dpr); element.height = Math.round(height * dpr);
    }); resize.observe(element);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const dt = Math.min(.04, (now - before) / 1000); before = now;
      const r = latest.current; if (!r || !width || !height) return;
      const time = Date.now() + offset.current, active = r.phase === 'playing' && time < r.endsAt;
      const me = r.players.find(p => p.id === r.me); if (!me) return;
      const fresh = Date.now() - received.current < 900;
      const age = Math.max(0, Math.min(220, time - r.simAt)) / 1000;
      if (previousRound !== r.round || !local) { positions.clear(); local = { x: me.x, y: me.y }; previousRound = r.round; camera = { ...local }; }
      if (previousVersion !== r.version) {
        const target = { x: me.x, y: me.y };
        if (active && time - me.input.at < 700) {
          const speed = time < me.dashUntil ? WORLD.dashSpeed : WORLD.speed;
          move(target, me.input.x * speed * age, me.input.y * speed * age);
        }
        correction = { x: target.x - local.x, y: target.y - local.y };
        if (Math.hypot(correction.x, correction.y) > 140 || !active) { local = target; correction = { x: 0, y: 0 }; }
        previousVersion = r.version;
      }
      if (active && fresh) {
        const speed = Date.now() < controls.current.dashUntil ? WORLD.dashSpeed : WORLD.speed;
        move(local, controls.current.x * speed * dt, controls.current.y * speed * dt);
      }
      const blend = Math.min(1, dt * 10);
      local.x += correction.x * blend; local.y += correction.y * blend;
      correction.x *= 1 - blend; correction.y *= 1 - blend;
      const compact = width < 650;
      const scale = compact ? Math.max(.7, Math.min(.95, height / 480)) : Math.min(width / WORLD.width, height / WORLD.height);
      const viewW = width / scale, viewH = height / scale;
      const targetX = compact ? Math.max(viewW / 2, Math.min(960 - viewW / 2, local.x)) : 480;
      const targetY = compact ? Math.max(viewH / 2, Math.min(600 - viewH / 2, local.y)) : 300;
      camera.x += (targetX - camera.x) * Math.min(1, dt * 8); camera.y += (targetY - camera.y) * Math.min(1, dt * 8);
      if (!compact) camera = { x: 480, y: 300 };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#badff1'; ctx.fillRect(0, 0, width, height);
      ctx.save(); ctx.translate(width / 2, height / 2); ctx.scale(scale, scale); ctx.translate(-camera.x, -camera.y);
      if (art.complete && art.naturalWidth) ctx.drawImage(art, 0, 0, 960, 600);
      else { ctx.fillStyle = '#304d70'; ctx.beginPath(); ctx.ellipse(480, 285, 428, 244, 0, 0, Math.PI * 2); ctx.fill(); }
      // Functional collision geometry is deliberately separate from the artwork.
      WALLS.forEach(w => {
        ctx.shadowBlur = 0; ctx.fillStyle = '#13294488'; roundRect(ctx, w.x + 3, w.y + 7, w.w, w.h, 10); ctx.fill();
        const fill = ctx.createLinearGradient(0, w.y, 0, w.y + w.h); fill.addColorStop(0, '#f1faff'); fill.addColorStop(1, '#abc8e0');
        ctx.fillStyle = fill; roundRect(ctx, w.x, w.y, w.w, w.h, 9); ctx.fill(); ctx.strokeStyle = '#83accc'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#57cfff'; roundRect(ctx, w.x + 13, w.y + 8, w.w - 26, 4, 2); ctx.fill();
      });
      r.players.forEach((p, i) => {
        const mine = p.id === r.me, color = SEAT_COLORS[i % 6];
        ctx.fillStyle = '#102b49b8'; ctx.beginPath(); ctx.ellipse(p.home.x, p.home.y, 37, 29, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = mine ? 4 : 2; ctx.stroke();
        ctx.globalAlpha = .32 + (mine && me.bag.length ? .15 * Math.sin(now / 180) : 0);
        ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(p.home.x, p.home.y, 29, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = '#effcff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.home.x, p.home.y - 9); ctx.lineTo(p.home.x, p.home.y + 4); ctx.moveTo(p.home.x - 6, p.home.y); ctx.lineTo(p.home.x, p.home.y + 6); ctx.lineTo(p.home.x + 6, p.home.y); ctx.stroke();
        label(ctx, mine ? 'YOUR REACTOR' : p.name.slice(0, 14) + (p.isBot ? ' · BOT' : ''), p.home.x, p.home.y + 42, mine ? '#c6eeff' : '#dce7f4', 11);
      });
      LASERS.forEach((l, i) => {
        const state = active ? laserState(i, time, r.startedAt) : 'off';
        ctx.fillStyle = '#112a43aa'; roundRect(ctx, l.x, l.y, l.w, l.h, 5); ctx.fill();
        if (state === 'off') { ctx.strokeStyle = '#7790b077'; ctx.setLineDash([4, 7]); ctx.stroke(); ctx.setLineDash([]); }
        else {
          ctx.globalAlpha = state === 'warning' ? .3 + .25 * (Math.sin(now / 90) + 1) : .9;
          ctx.shadowColor = state === 'warning' ? '#ffd580' : '#ff727e'; ctx.shadowBlur = state === 'on' ? 18 : 0; ctx.fillStyle = ctx.shadowColor; ctx.fill(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
          if (state === 'warning') label(ctx, '!', l.x + l.w / 2, l.y + l.h / 2, '#fff4c3', 17);
        }
      });
      const drawOrb = (value: number, x: number, y: number, diameter: number) => {
        if (orbs.complete && orbs.naturalWidth) { const s = orbs.naturalWidth / 2; ctx.drawImage(orbs, value === 2 ? s : 0, 0, s, orbs.naturalHeight, x - diameter / 2, y - diameter / 2, diameter, diameter); }
        else { ctx.fillStyle = value === 2 ? '#ffd268' : '#60d4ff'; ctx.beginPath(); ctx.arc(x, y, diameter / 2, 0, Math.PI * 2); ctx.fill(); }
      };
      r.balls.forEach(b => {
        const bob = reduced ? 0 : Math.sin(now / 330 + b.id) * 2;
        ctx.fillStyle = '#091b3f66'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 8, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
        if (b.value === 2) { ctx.strokeStyle = '#ffe39b99'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(b.x, b.y + 5, 24, 12, 0, 0, Math.PI * 2); ctx.stroke(); label(ctx, '+2', b.x, b.y - 27, '#ffe7a7', 12); }
        drawOrb(b.value, b.x, b.y + bob - 4, b.value === 2 ? 36 : 30);
      });
      const sorted = [...r.players].sort((a, b) => a.y - b.y);
      sorted.forEach(p => {
        const mine = p.id === r.me, target = { x: p.x, y: p.y };
        if (active && fresh) move(target, p.vx * age, p.vy * age);
        let at = positions.get(p.id) || target;
        at = mine ? local! : { x: at.x + (target.x - at.x) * Math.min(1, dt * 16), y: at.y + (target.y - at.y) * Math.min(1, dt * 16) }; positions.set(p.id, at);
        const i = r.players.findIndex(other => other.id === p.id), color = SEAT_COLORS[i % 6];
        ctx.fillStyle = '#10213e6b'; ctx.beginPath(); ctx.ellipse(at.x, at.y + 3, 22, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = mine ? 3 : 1.8; ctx.beginPath(); ctx.ellipse(at.x, at.y + 3, 21, 10, 0, 0, Math.PI * 2); ctx.stroke();
        const moving = active && (mine ? Math.hypot(controls.current.x, controls.current.y) : Math.hypot(p.vx, p.vy)) > .1;
        const bounce = moving && !reduced ? Math.abs(Math.sin(now / 85)) * 3 : 0;
        const ci = Math.max(0, CHARACTERS.findIndex(c => c.id === p.character));
        if (crew.complete && crew.naturalWidth) {
          ctx.save(); ctx.translate(at.x, at.y - 30 - bounce); if ((mine ? controls.current.x : p.vx) < -.1) ctx.scale(-1, 1);
          ctx.drawImage(crew, (ci % 3) * 512, Math.floor(ci / 3) * 512, 512, 512, -35, -35, 70, 70); ctx.restore();
        } else { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(at.x, at.y - 15, 18, 0, Math.PI * 2); ctx.fill(); }
        if (time < p.shieldUntil) { ctx.strokeStyle = '#fff9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(at.x, at.y - 22, 33, 0, Math.PI * 2); ctx.stroke(); }
        label(ctx, mine ? 'YOU' : p.name.slice(0, 12) + (p.isBot ? ' · BOT' : ''), at.x, at.y - 74 - bounce, mine ? '#c2efff' : '#fff', 11);
        p.bag.forEach((value, k) => drawOrb(value, at.x + (k - (p.bag.length - 1) / 2) * 16, at.y + 17, 14));
      });
      if (active && me.bag.length && compact) {
        const dist = Math.hypot(me.home.x - local.x, me.home.y - local.y);
        if (dist > 80) {
          const angle = Math.atan2(me.home.y - local.y, me.home.x - local.x), x = local.x + Math.cos(angle) * 64, y = local.y + Math.sin(angle) * 64;
          ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = '#b9edff'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-6, -6); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill(); ctx.restore();
        }
      }
      r.events.forEach(e => {
        const elapsed = time - e.at; if (elapsed < 0 || elapsed > 1000 || e.kind === 'rare') return;
        const p = r.players.find(p => p.id === e.playerId); if (!p) return;
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 1000);
        const at = e.kind === 'deposit' ? p.home : p;
        label(ctx, e.kind === 'deposit' ? `+${e.value} ENERGY` : 'DROPPED!', at.x, at.y - 25 - elapsed / 28, e.kind === 'deposit' ? '#bcffe0' : '#ffbac6', 15);
        if (!reduced && e.kind === 'deposit') for (let j = 0; j < 8; j++) { ctx.fillStyle = '#b5fbea'; ctx.beginPath(); ctx.arc(at.x + Math.cos(j) * elapsed / 18, at.y + Math.sin(j) * elapsed / 24, 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1;
      });
      ctx.restore();
      if (compact) {
        const mw = 112, mh = 70, mx = width - mw - 10, my = 12;
        ctx.fillStyle = '#122a48d9'; roundRect(ctx, mx, my, mw, mh, 9); ctx.fill();
        r.players.forEach((p, i) => {
          const x = mx + p.home.x / 960 * mw, y = my + p.home.y / 600 * mh;
          ctx.strokeStyle = SEAT_COLORS[i % 6]; ctx.lineWidth = 1; ctx.strokeRect(x - 3, y - 3, 6, 6);
          ctx.fillStyle = SEAT_COLORS[i % 6]; ctx.beginPath(); ctx.arc(mx + (p.id === r.me ? local!.x : p.x) / 960 * mw, my + (p.id === r.me ? local!.y : p.y) / 600 * mh, p.id === r.me ? 3.5 : 2, 0, Math.PI * 2); ctx.fill();
        });
        ctx.font = '600 9px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#e1efff'; ctx.fillText('SKY LAB', mx + 7, my + mh - 6);
      }
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, [latest, offset, received, controls]);
  return <canvas ref={canvas} className="rr-canvas" aria-label="Sky Lab arena. Move with WASD, arrow keys or the touch joystick. Collect energy and return to your labelled reactor." role="img" />;
}
