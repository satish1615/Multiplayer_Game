'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Atom, BookOpen, Check, Copy, Crown, ExternalLink, Gamepad2, Keyboard, LoaderCircle, LogOut, Radio, RotateCcw, ShieldAlert, Sparkles, Timer, Trophy, Users, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CHARACTERS, type Character, type Snapshot } from '@/lib/reactor-engine';
import { LIVE_URL, useReactor } from '@/lib/reactor-client';
import ReactorArena, { SEAT_COLORS } from './reactor-arena';

function Avatar({ character, className = '' }: { character: Character; className?: string }) {
  const index = Math.max(0, CHARACTERS.findIndex(c => c.id === character));
  return <span aria-hidden="true" className={`rr-avatar ${className}`} style={{ backgroundPosition: `${index % 3 * 50}% ${Math.floor(index / 3) * 100}%` }} />;
}
function Orb({ gold = false, className = '' }: { gold?: boolean; className?: string }) {
  return <span aria-hidden="true" className={`rr-orb ${gold ? 'gold' : ''} ${className}`} />;
}
function CharacterPicker({ value, onChange, disabled = false }: { value: Character; onChange: (c: Character) => void; disabled?: boolean }) {
  return <RadioGroup className="rr-character-grid" value={value} onValueChange={v => onChange(v as Character)} disabled={disabled} aria-label="Choose your character">
    {CHARACTERS.map(c => <label key={c.id} className={`rr-character ${value === c.id ? 'selected' : ''}`} style={{ '--character': c.color } as CSSProperties}>
      <RadioGroupItem value={c.id} className="rr-character-radio" aria-label={c.name} />
      <Avatar character={c.id} /><span>{c.name}</span>{value === c.id && <Check className="rr-chosen" size={14} />}
    </label>)}
  </RadioGroup>;
}
function Rules({ compact = false }: { compact?: boolean }) {
  return <div className={`rr-rules ${compact ? 'compact' : ''}`}>
    <div className="rr-rule"><span className="rr-rule-number">01</span><div><h3>Collect energy</h3><p>Touch a ball to pick it up. Carry up to <b>3 balls</b>, including at most one golden ball.</p><div className="rr-orb-values"><span><Orb /> Blue <b>+1</b></span><span><Orb gold /> Golden <b>+2</b></span></div></div></div>
    <div className="rr-rule"><span className="rr-rule-number">02</span><div><h3>Deposit energy</h3><p>Return to <b>your labelled reactor</b> to add the energy to your score. Carrying it alone earns no points.</p><p className="rr-example">2 blue + 1 golden = <b>4 points</b></p></div></div>
    <div className="rr-rule"><span className="rr-rule-number">03</span><div><h3>Move fast. Watch the lasers.</h3><p>Use <b>WASD / arrow keys</b> or the touch joystick. <b>Space / Dash</b> gives a burst every 3 seconds. Move before you dash.</p><p className="rr-rule-detail">Yellow means a laser is about to fire. A red laser makes you drop one ball.</p></div></div>
    <div className="rr-rule"><span className="rr-rule-number">04</span><div><h3>Charge the most to win</h3><p>The highest <b>deposited score</b> when time ends wins. Ties share the victory. Undeposited energy doesn’t count.</p><p className="rr-rule-detail">Choose 60s, 90s or a custom 30–600s round. Play again in the same room.</p></div></div>
    {compact && <div className="rr-extra-rules"><h3>A few useful details</h3><p>Blue balls keep respawning. A rare golden ball appears at a random reachable spot about every 20–30 seconds when no other gold is in play. Everyone gets the same notice. Pick it up within 15 seconds.</p><p>Your reactor’s colour matches your player ring. The small map and return arrow help on phones. Dash boosts movement; it does not knock down rivals.</p><p>Everyone must be ready before the host starts. Bots are labelled BOT and follow the same movement and scoring rules. Refresh the same tab to reconnect. If the host leaves or stays offline for 15 seconds, another connected player becomes host.</p></div>}
  </div>;
}
function RulesDialog({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return <Dialog onOpenChange={onOpenChange}><DialogTrigger asChild><Button variant="ghost" className="rr-help"><BookOpen size={17} /> <span>Rules</span></Button></DialogTrigger><DialogContent className="rr-dialog"><DialogTitle>How to play Reactor Rush</DialogTitle><DialogDescription>Collect, return, deposit. The most energy wins.</DialogDescription><Rules compact /></DialogContent></Dialog>;
}
function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (active.current !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y), max = rect.width * .33;
    if (distance > max) { x *= max / distance; y *= max / distance; }
    setKnob({ x, y }); onMove(distance < 7 ? 0 : x / max, distance < 7 ? 0 : y / max);
  };
  const stop = () => { active.current = null; setKnob({ x: 0, y: 0 }); onMove(0, 0); };
  return <div className="rr-joystick" aria-label="Touch joystick. Drag to move." role="group" onPointerDown={e => { active.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); move(e); }} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
    <span className="rr-joystick-cross">+</span><span className="rr-joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} /><span className="rr-joystick-label">MOVE</span>
  </div>;
}

export default function ReactorRush() {
  const game = useReactor();
  const [name, setName] = useState(''), [character, setCharacter] = useState<Character>('iris');
  const [code, setCode] = useState(''), [joinOpen, setJoinOpen] = useState(false);
  const [custom, setCustom] = useState(false), [customTime, setCustomTime] = useState('120');
  const [copied, setCopied] = useState(''), [clock, setClock] = useState(0), [muted, setMuted] = useState(true);
  const [touch, setTouch] = useState(false), [rulesOpen, setRulesOpen] = useState(false), [embedded, setEmbedded] = useState(false);
  const sound = useRef<AudioContext | null>(null), lastEvent = useRef(0);
  const controlsApi = useRef(game); controlsApi.current = game;
  const room = game.room, me = room?.players.find(p => p.id === room.me), host = room?.hostId === me?.id;
  const active = room?.phase === 'playing' || room?.phase === 'countdown';
  const now = clock + game.offset.current;
  const remaining = room ? Math.max(0, Math.ceil((room.endsAt - now) / 1000)) : 0;
  const cooldown = me ? Math.max(0, (me.cooldownUntil - now) / 1000) : 0;
  const goldVisible = room?.balls.some(b => b.value === 2);
  const goldSoon = active && room && !goldVisible && !room.players.some(p => p.bag.includes(2)) && room.nextRareAt - now < 3000 && room.nextRareAt > now;
  const leaderboard = room ? [...room.players].sort((a, b) => b.score - a.score || a.joined - b.joined) : [];

  useEffect(() => {
    const invite = new URLSearchParams(location.search).get('room');
    if (invite && /^[a-z2-9]{6}$/i.test(invite)) { setCode(invite.toUpperCase()); setJoinOpen(true); }
    setTouch(matchMedia('(pointer: coarse)').matches); setEmbedded(window.self !== window.top);
    const t = setInterval(() => setClock(Date.now()), 100); return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!active || rulesOpen) { game.direction(0, 0); return; }
    const keys = new Set<string>();
    const update = () => controlsApi.current.direction((keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0), (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0));
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.matches('input,textarea,select') || e.target.isContentEditable)) return;
      const key = e.key.toLowerCase();
      if (!['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', ' '].includes(key)) return;
      e.preventDefault(); if (key === ' ') { if (!e.repeat) controlsApi.current.dash(); return; } keys.add(key); update();
    };
    const up = (e: KeyboardEvent) => { keys.delete(e.key.toLowerCase()); update(); };
    const clear = () => { keys.clear(); controlsApi.current.direction(0, 0); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear); document.addEventListener('visibilitychange', clear);
    return () => { clear(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear); document.removeEventListener('visibilitychange', clear); };
  // Control handlers use a ref; a snapshot must not release held keys.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, rulesOpen]);
  useEffect(() => {
    const events = room?.events || [];
    const latest = events[events.length - 1]?.id || 0;
    if (!muted && sound.current && events.some(e => e.id > lastEvent.current && e.playerId === me?.id && e.kind === 'deposit')) {
      const audio = sound.current;
      [660, 880, 1100].forEach((frequency, i) => {
        const oscillator = audio.createOscillator(), gain = audio.createGain(), start = audio.currentTime + i * .075;
        oscillator.frequency.value = frequency; oscillator.type = 'sine'; gain.gain.setValueAtTime(.035, start); gain.gain.exponentialRampToValueAtTime(.001, start + .16);
        oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(start); oscillator.stop(start + .17);
      });
    }
    lastEvent.current = latest;
  }, [room?.events, muted, me?.id]);
  async function copy(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 2200); }
    catch { game.setError('Copy is unavailable here. Select the room code and share it with your friends.'); }
  }
  function toggleSound() {
    if (muted) { try { sound.current ||= new AudioContext(); void sound.current.resume(); } catch { return; } }
    setMuted(!muted);
  }
  function submit(mode: 'create' | 'join' | 'solo') {
    if (!name.trim()) { document.getElementById('player-name')?.focus(); game.setError('Enter a nickname first.'); return; }
    void game.enter(name.trim(), character, mode, code.trim());
  }

  return <div className={`rr-app ${room ? 'rr-in-room' : ''} ${active ? 'rr-in-match' : ''}`}>
    <header className="rr-header"><a href={room ? undefined : '/'} className="rr-brand" aria-label="Reactor Rush home"><span className="rr-brand-icon"><Atom size={23} /></span><span>REACTOR<span className="rr-brand-rush">RUSH</span></span></a><div className="rr-header-right">{room && <span className={`rr-connection ${game.connection !== 'online' ? 'waiting' : ''}`} title={game.connection === 'online' ? `${game.latency}ms round trip` : 'Your seat is saved'}><Radio size={15} />{game.connection === 'online' ? 'Connected' : 'Reconnecting'}</span>}<RulesDialog onOpenChange={setRulesOpen} />{room && <Button variant="ghost" className="rr-icon-button" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Mute sound'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</Button>}</div></header>
    {embedded && <div className="rr-browser-note">For the best controls, <a href={LIVE_URL} target="_blank" rel="noreferrer">open in your browser <ExternalLink size={13} /></a>.</div>}
    {game.error && <div className="rr-error" role="alert"><ShieldAlert size={19} /><span>{game.error}</span>{game.seatLost && <Button className="rr-button rr-secondary" onClick={game.forget}>Return home</Button>}<button onClick={() => game.setError('')} aria-label="Dismiss message"><X size={18} /></button></div>}

    {!game.seat && <main className="rr-home">
      <section className="rr-start">
        <div className="rr-intro"><span className="rr-eyebrow"><span /> SKY LAB · 2–6 PLAYERS</span><h1>REACTOR<br /><em>RUSH</em><span className="rr-title-dot">.</span></h1><p>Grab the energy. Dodge the lasers.<br />Get back to your reactor before time runs out.</p><div className="rr-home-art" aria-hidden="true"><div className="rr-stage-image" /><Avatar character={character} className="rr-hero-character" /><Orb className="rr-hero-orb blue" /><Orb gold className="rr-hero-orb rare" /><span className="rr-art-caption">{CHARACTERS.find(c => c.id === character)?.name} is ready to run</span></div><div className="rr-home-facts"><span><Gamepad2 size={16} /> Phone & keyboard</span><span><Users size={16} /> Friends or bots</span><span>No login needed</span></div></div>
        <section className="rr-play-panel" aria-labelledby="play-heading"><div className="rr-panel-heading"><div><span className="rr-overline">YOUR NEXT ROUND</span><h2 id="play-heading">Let’s play.</h2></div><span className="rr-lab-chip">SKY LAB</span></div><label htmlFor="player-name" className="rr-field-label">Your nickname</label><Input id="player-name" className="rr-input" placeholder="What should we call you?" maxLength={20} autoComplete="nickname" value={name} onChange={e => setName(e.target.value)} disabled={game.busy} /><div className="rr-picker-heading"><span>Pick your character</span><small>Same stats. Your style.</small></div><CharacterPicker value={character} onChange={setCharacter} disabled={game.busy} /><div className="rr-entry-actions"><Button className="rr-button rr-primary" disabled={game.busy || !game.loaded} onClick={() => submit('create')}>{game.busy ? <LoaderCircle className="rr-spin" /> : <Users />} Create room</Button><Button className="rr-button rr-secondary" disabled={game.busy} onClick={() => setJoinOpen(!joinOpen)} aria-expanded={joinOpen}>Join room</Button><Button className="rr-button rr-solo" disabled={game.busy || !game.loaded} onClick={() => submit('solo')}><Gamepad2 /> Solo + bots</Button></div>{joinOpen && <form className="rr-join-form" onSubmit={e => { e.preventDefault(); submit('join'); }}><label className="sr-only" htmlFor="room-code">Room code</label><Input id="room-code" className="rr-input rr-code-input" placeholder="6-letter code" value={code} maxLength={6} onChange={e => setCode(e.target.value.toUpperCase())} autoComplete="off" /><Button type="submit" className="rr-button rr-primary" disabled={game.busy || code.length !== 6}>Join</Button></form>}<p className="rr-panel-note">Create a room and send the code to your friends.<br />Solo starts with two bot rivals.</p></section>
      </section>
      <section className="rr-front-rules" id="rules"><div className="rr-section-heading"><div><span className="rr-overline">FIRST TIME HERE?</span><h2>Rules in a minute.</h2></div><span className="rr-rule-tag"><BookOpen size={17} /> Read. Ready. Rush.</span></div><Rules /></section>
    </main>}

    {game.seat && !room && <main className="rr-recover"><LoaderCircle className="rr-spin" size={30} /><h1>Reconnecting to your room</h1><p>Your character and score are saved with your seat.</p><Button className="rr-button rr-secondary" onClick={game.forget}>Return home</Button></main>}

    {room?.phase === 'lobby' && me && <main className="rr-lobby">
      <section className="rr-lobby-top"><div><span className="rr-eyebrow">SKY LAB · ROUND {room.round + 1}</span><h1>Assemble your crew.</h1><p>Pick a character, ready up, and race for energy.</p></div><div className="rr-room-invite"><span className="rr-overline">ROOM CODE</span><button className="rr-large-code" onClick={() => copy(room.code, 'code')} aria-label={`Copy room code ${room.code}`}>{room.code}<Copy size={19} /></button><button className="rr-copy-link" onClick={() => copy(`${location.origin}/?room=${room.code}`, 'invite')}>{copied ? 'Copied!' : 'Copy invite link'}</button></div></section>
      <div className="rr-lobby-grid"><section className="rr-crew-panel"><div className="rr-section-heading"><h2>Your crew <span className="rr-count">{room.players.length}/6</span></h2><span className="rr-muted">{room.players.filter(p => p.ready).length} ready</span></div><div className="rr-crew-grid">{room.players.map((p, index) => <article key={p.id} className={`rr-crew-card ${p.id === me.id ? 'mine' : ''}`} style={{ '--seat': SEAT_COLORS[index] } as CSSProperties}><div className="rr-crew-top"><span>{p.id === me.id ? 'YOU' : p.isBot ? 'BOT' : 'PLAYER'}</span>{p.id === room.hostId && <Crown size={15} aria-label="Host" />}</div><Avatar character={p.character} /><h3>{p.name}</h3><p>{CHARACTERS.find(c => c.id === p.character)?.name}{p.isBot && ' · Bot'}</p><span className={`rr-ready-state ${p.ready ? 'yes' : ''}`}>{!p.isBot && now - p.lastSeen > 6500 ? 'Reconnecting' : p.ready ? <><Check size={13} /> Ready</> : 'Choosing character'}</span>{host && !p.isBot && p.id !== me.id && now - p.lastSeen >= 15000 && <Button className="rr-remove-player" variant="ghost" disabled={game.busy} onClick={() => game.action({ type: 'remove', targetId: p.id })}>Remove offline player</Button>}</article>)}{Array.from({ length: 6 - room.players.length }, (_, i) => <div className="rr-empty-seat" key={i}><Users size={24} /><span>Open seat</span></div>)}</div><div className="rr-crew-bottom"><Dialog><DialogTrigger asChild><Button className="rr-button rr-secondary" disabled={game.busy}>Change character</Button></DialogTrigger><DialogContent className="rr-dialog rr-character-dialog"><DialogTitle>Choose your character</DialogTitle><DialogDescription>All six have the same speed, dash and carrying capacity. Changing your character clears your ready status.</DialogDescription><CharacterPicker value={me.character} onChange={v => game.action({ type: 'character', character: v })} disabled={game.busy} /></DialogContent></Dialog><span>Everyone plays by the same rules.</span></div></section>
      <aside className="rr-settings"><span className="rr-overline">MATCH SETTINGS</span><h2>Make it your round.</h2><p>{host ? 'You’re the host. Choose the time and crew.' : 'Your host chooses the time and bot count.'}</p><label className="rr-field-label">Round time</label><RadioGroup className="rr-duration" value={custom ? 'custom' : [60, 90].includes(room.duration) ? String(room.duration) : 'custom'} disabled={!host || game.busy} onValueChange={v => { setCustom(v === 'custom'); if (v !== 'custom') game.action({ type: 'duration', value: Number(v) }); }}>{[['60', '60 sec'], ['90', '90 sec'], ['custom', 'Custom']].map(([v, text]) => <label key={v}><RadioGroupItem value={v} className="sr-only" /><span>{text}</span></label>)}</RadioGroup>{(custom || ![60, 90].includes(room.duration)) && host && <form className="rr-custom-time" onSubmit={e => { e.preventDefault(); const value = Number(customTime); if (Number.isInteger(value) && value >= 30 && value <= 600) game.action({ type: 'duration', value }); else game.setError('Use a whole number from 30 to 600 seconds.'); }}><Input type="number" aria-label="Custom round time in seconds" min={30} max={600} value={customTime} onChange={e => setCustomTime(e.target.value)} className="rr-input" /><span>sec</span><Button type="submit" className="rr-button rr-secondary" disabled={game.busy}>Set</Button></form>}<p className="rr-setting-help">Current round: {room.duration} seconds</p><label className="rr-field-label" htmlFor="bot-count">Bot rivals</label><Select value={String(room.players.filter(p => p.isBot).length)} onValueChange={v => game.action({ type: 'bots', value: Number(v) })} disabled={!host || game.busy}><SelectTrigger id="bot-count" className="rr-select"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: 7 - room.players.filter(p => !p.isBot).length }, (_, n) => <SelectItem key={n} value={String(n)}>{n === 0 ? 'No bots' : `${n} bot${n > 1 ? 's' : ''}`}</SelectItem>)}</SelectContent></Select><p className="rr-setting-help">Bots fill empty seats and play on their own.</p><div className="rr-ready-actions"><Button className={`rr-button ${me.ready ? 'rr-ready-button' : 'rr-primary'}`} disabled={game.busy} onClick={() => game.action({ type: 'ready', ready: !me.ready })}>{me.ready ? <><Check /> You’re ready</> : 'I’m ready'}</Button>{host ? <Button className="rr-button rr-start-button" disabled={game.busy || room.players.length < 2 || room.players.some(p => !p.ready || !p.isBot && now - p.lastSeen > 6500)} onClick={() => game.action({ type: 'start' })}><Zap /> Start round</Button> : <p className="rr-waiting">The host starts when everyone is ready.</p>}</div><p className="rr-start-hint">{room.players.length < 2 ? 'Invite a friend or add a bot to start.' : room.players.some(p => !p.ready) ? 'Waiting for everyone to ready up.' : 'All set. Your reactors are waiting.'}</p></aside></div>
      <div className="rr-lobby-footer"><Button variant="ghost" className="rr-leave" disabled={game.busy} onClick={() => game.action({ type: 'leave' })}><LogOut size={16} /> Leave room</Button><span>Collect blue +1 or golden +2. Deposit at your reactor to score.</span></div>
    </main>}

    {active && room && me && <main className="rr-match">
      <div className="rr-match-top"><div className="rr-match-title"><span className="rr-overline">SKY LAB</span><h1>Energy race <span>#{room.round}</span></h1></div><div className={`rr-timer ${remaining <= 10 ? 'urgent' : ''}`}><Timer size={23} /><span>{room.phase === 'countdown' ? `${room.duration}` : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}</span><small>{room.phase === 'countdown' ? 'SECONDS' : 'TIME LEFT'}</small></div><div className="rr-my-score"><small>YOUR SCORE</small><strong>{me.score}<Zap size={19} /></strong></div></div>
      <div className="rr-game-layout"><section className="rr-arena-panel"><div className="rr-arena-topline"><span><span className="rr-seat-dot" style={{ background: SEAT_COLORS[room.players.findIndex(p => p.id === me.id)] }} /> Your reactor matches your ring</span><span>{room.code}</span></div><div className="rr-arena-wrap"><ReactorArena latest={game.latest} offset={game.offset} received={game.received} controls={game.controls} muted={muted} />{room.phase === 'countdown' && <div className="rr-countdown"><span>Find your reactor</span><strong>{Math.max(1, Math.ceil((room.startedAt - now) / 1000))}</strong><p>Collect. Return. Deposit.</p></div>}{room.phase === 'playing' && (goldVisible || goldSoon) && <div className={`rr-rare-notice ${goldVisible ? '' : 'soon'}`}><Orb gold /><span>{goldVisible ? 'Golden energy is in play!' : 'Golden energy arriving…'}</span><b>+2</b></div>}{game.connection === 'reconnecting' && <div className="rr-reconnecting"><Radio size={18} /> Reconnecting. Movement will catch up.</div>}</div><div className="rr-cargo-bar"><div><span className="rr-overline">CARRYING</span><div className="rr-cargo">{[0, 1, 2].map(i => <span key={i} className={`rr-cargo-slot ${me.bag[i] ? 'filled' : ''}`}>{me.bag[i] ? <Orb gold={me.bag[i] === 2} /> : <span />}</span>)}</div></div><p>{me.bag.length ? <><b>{me.bag.reduce<number>((a, b) => a + b, 0)} energy</b><span>Return to your reactor to deposit.</span></> : <><b>Go get some energy.</b><span>Touch a blue or golden ball to collect it.</span></>}</p><Button className="rr-dash-desktop" disabled={room.phase !== 'playing' || cooldown > 0} onClick={game.dash}><Zap size={19} />{cooldown > 0 ? `${cooldown.toFixed(1)}s` : 'DASH'}<kbd>SPACE</kbd></Button></div><div className={`rr-touch-controls ${touch ? 'visible' : ''}`}><Joystick onMove={game.direction} /><p>Drag to move.<br />Hold a direction<br />and tap Dash.</p><button className={`rr-dash-touch ${cooldown > 0 ? 'cooling' : ''}`} onPointerDown={e => { e.preventDefault(); game.dash(); }} disabled={room.phase !== 'playing' || cooldown > 0} aria-label="Dash"><Zap size={26} /><b>{cooldown > 0 ? `${cooldown.toFixed(1)}s` : 'DASH'}</b></button></div><div className="rr-controls-note"><span><Keyboard size={15} /> WASD / arrows to move · Space to dash</span><button onClick={() => { setTouch(!touch); game.direction(0, 0); }}>{touch ? 'Hide touch controls' : 'Show touch controls'}</button></div></section>
      <aside className="rr-scoreboard"><div className="rr-section-heading"><h2>Live scores</h2><Trophy size={19} /></div><p>Deposited energy counts.</p><ol>{leaderboard.map((p, i) => <li key={p.id} className={p.id === me.id ? 'mine' : ''}><span className="rr-rank">{i + 1}</span><Avatar character={p.character} /><div><b>{p.name}</b><span>{p.id === me.id ? 'You' : p.isBot ? 'Bot rival' : 'Player'}</span></div><strong>{p.score}</strong></li>)}</ol><div className="rr-score-tip"><Orb gold /><p>One golden ball.<br /><b>Twice the energy.</b></p></div><p className="rr-score-hint">See a yellow laser? Change your route before it turns red.</p></aside></div>
      <div className="rr-match-footer"><Dialog onOpenChange={open => { if (open) game.direction(0, 0); }}><DialogTrigger asChild><Button variant="ghost" className="rr-leave"><LogOut size={15} /> Leave round</Button></DialogTrigger><DialogContent className="rr-dialog rr-small-dialog"><DialogTitle>Leave this round?</DialogTitle><DialogDescription>The others can keep playing. You can join a new round from the home screen.</DialogDescription><Button className="rr-button rr-primary" onClick={() => game.action({ type: 'leave' })} disabled={game.busy}>Leave room</Button></DialogContent></Dialog><span>Most deposited energy wins. Ties share victory.</span></div>
    </main>}

    {room?.phase === 'finished' && me && <main className="rr-finish"><div className="rr-finish-heading"><span className="rr-eyebrow">ROUND {room.round} · COMPLETE</span><Trophy className="rr-trophy" size={42} /><h1>{room.winners.length > 1 ? 'A shared victory!' : room.winners.includes(me.id) ? 'Your reactor wins!' : `${room.players.find(p => p.id === room.winners[0])?.name || 'The crew'} wins!`}</h1><p>{room.winners.includes(me.id) ? 'That was a good run. Ready to do it again?' : 'One more round? There’s more energy to chase.'}</p></div><div className="rr-podium">{leaderboard.slice(0, 3).map((p, i) => <div key={p.id} className={`rr-podium-player place-${i + 1}`}><Avatar character={p.character} /><div className="rr-podium-base"><span>{i === 0 ? <Crown size={24} /> : i + 1}</span><h2>{p.name}{p.id === me.id && <small>YOU</small>}{p.isBot && <small>BOT</small>}</h2><strong>{p.score}<small>ENERGY</small></strong></div></div>)}</div><div className="rr-final-table"><div className="rr-final-head"><span>FINAL STANDINGS</span><span>DEPOSITED</span></div>{leaderboard.map((p, i) => <div key={p.id} className={p.id === me.id ? 'mine' : ''}><span>{i + 1}</span><Avatar character={p.character} /><b>{p.name}</b><small>{p.id === me.id ? 'YOU' : p.isBot ? 'BOT' : ''}</small><strong>{p.score}</strong></div>)}</div><div className="rr-finish-actions">{host ? <Button className="rr-button rr-primary" disabled={game.busy} onClick={() => game.action({ type: 'rematch' })}><RotateCcw /> Play again</Button> : <p>Waiting for the host to start another round.</p>}<Button className="rr-button rr-secondary" disabled={game.busy} onClick={() => game.action({ type: 'leave' })}>Leave room</Button></div><p className="rr-finish-note">Room {room.code} stays together for the next round.<br />Only deposited energy counts toward your final score.</p></main>}
    {!active && <footer className="rr-footer"><span>REACTOR RUSH <span>·</span> A game by Satish Singh</span><span>Built for a good game night.</span></footer>}
  </div>;
}
