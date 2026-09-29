"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, ArrowRightLeft, BookOpen, Check, CheckCircle2, Clock3, Copy, Crown, DoorOpen, Headphones, HelpCircle, LockKeyhole, MessageSquare, Moon, Radio, RadioTower, RefreshCw, Send, ShieldCheck, Sparkles, Star, Triangle, Users, X, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { PORTS, SYMBOLS, SYSTEMS, type Mode, type RoomView, type Session } from "@/lib/game-types";

const SESSION_KEY = "split-signal-seat-v1";
const NAME_KEY = "split-signal-name";
type Payload = Record<string, unknown>;
function SymbolIcon({ value, size = 32 }: { value: number; size?: number }) {
  const Icon = [Star, Moon, Triangle][value] || Radio;
  return <Icon size={size} strokeWidth={1.4} className={"symbol symbol-" + value} aria-hidden="true" />;
}
function Brand() { return <div className="brand"><span className="brand-mark"><ArrowRightLeft size={23} /></span><span>SPLIT<span className="brand-separator">/</span>SIGNAL</span></div>; }
function Chip({ children, tone = "" }: { children: ReactNode; tone?: string }) { return <span className={"chip " + tone}>{children}</span>; }
function formatTime(seconds: number) { const n = Math.max(0, Math.floor(seconds)); return String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0"); }
function Options({ label, value, options, disabled, onChange }: { label: string; value: number; options: { text: string; sub?: string }[]; disabled?: boolean; onChange: (value: number) => void }) {
  return <fieldset className="control-group"><legend>{label}</legend><RadioGroup aria-label={label} className="control-options" value={String(value)} onValueChange={v => onChange(Number(v))} disabled={disabled}>
    {options.map((option, index) => <label key={index} className="setting-option">
      <RadioGroupItem value={String(index)} aria-label={label + " " + option.text} className="control-radio" />
      <span>{option.text}</span>{option.sub && <small>{option.sub}</small>}
    </label>)}
  </RadioGroup></fieldset>;
}

function Rules({ open, onOpenChange, onTutorial, inMission }: { open: boolean; onOpenChange: (v: boolean) => void; onTutorial: () => void; inMission: boolean }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="rules-dialog"><DialogHeader>
    <span className="eyebrow mint">CREW FIELD GUIDE</span><DialogTitle>One mission. Different information.</DialogTitle>
    <DialogDescription>Work together to restore three systems and send the rescue signal.</DialogDescription>
  </DialogHeader>
  <div className="rules-body">
    <div className="rules-summary"><Chip><Users size={15} /> 2–6 players</Chip><Chip><Clock3 size={15} /> 5 minutes</Chip><Chip><Zap size={15} /> 3 failed checks</Chip></div>
    <ol className="rule-steps">
      <li><span>01</span><div><h3>Join the same room</h3><p>Enter a nickname. One person creates a room and shares its code. Everyone joins, reads the rules, and presses Ready. The host starts.</p></div></li>
      <li><span>02</span><div><h3>Share what only you can see</h3><p>Power tells everyone the target symbol. Relay 1 looks up that symbol and tells Power which channel and strength to choose. Use room chat or the quick messages.</p></div></li>
      <li><span>03</span><div><h3>Set your own controls</h3><p>Power selects the channel and strength. Each relay operator finds the target's required exit in their own table, then selects a dial that sends the incoming signal to that exit.</p><p>Upstream changes affect downstream readouts. Work along the chain: Power, Relay 1, Relay 2, and so on.</p></div></li>
      <li><span>04</span><div><h3>Check together, then lock in</h3><p>Power checks the receiving symbol. Each relay checks its required exit. Everyone presses Lock in. The game checks the entire setup only when all players are locked.</p></div></li>
    </ol>
    <div className="rule-role-grid">
      <article><Zap size={23} /><h3>Power</h3><p><b>You know:</b> the target and receiving symbol.</p><p><b>You control:</b> channel and strength.</p><p><b>You say:</b> “We need STAR.”</p></article>
      <article><ArrowRightLeft size={23} /><h3>Relay operator</h3><p><b>You know:</b> your wiring table and live signal.</p><p><b>You control:</b> your relay dial.</p><p><b>You say:</b> “My exit is set.” Relay 1 also shares the power settings.</p></article>
    </div>
    <div className="worked-example"><span className="eyebrow amber">A TWO-PLAYER EXAMPLE</span><p><b>Power:</b> “We need STAR.”</p><p><b>Relay 1:</b> “Use B, strength 2.”</p><p>Power presses B and 2. The relay's STAR row says exit A, so the operator chooses the dial currently sending to A. Power sees STAR. Both lock in.</p><small>Clues and dial positions change every repair. This example is not a fixed answer.</small></div>
    <h3>What counts as a mistake?</h3><p>Changing a setting is free. One incorrect shared check costs one fuse. Any setting change clears everyone's locks, so check the new readout before locking again. A matching final symbol alone is not enough: every relay and the power settings must match their clues.</p>
    <h3>How do we win?</h3><p>Complete three repairs before five minutes or three failed checks. Roles rotate after each repair. Press Continue when everyone is ready. The timer keeps running between repairs and while the rules are open.</p>
    <h3>Want a slower start?</h3><p>The host can select Practice in the lobby. It uses the same multiplayer puzzles with no timer and unlimited checks. A separate solo tutorial lets you try both roles first.</p>
    <h3>Connection dropped?</h3><p>Refresh or reopen this game in the same browser to recover your seat. Keep that browser's stored data. The mission timer continues while you reconnect. If the host is offline for 45 seconds, another player can take over. Leaving a room returns the remaining crew to the lobby. Rooms expire after 24 hours without game activity.</p>
    <p className="muted"><Headphones size={16} className="inline-icon" /> A voice call is optional. Room chat is enough to play from different locations.</p>
    {inMission ? <div className="inline-note amber"><Clock3 size={17} /> Your mission continues while you read.</div> : <button className="btn secondary full" onClick={onTutorial}><BookOpen size={18} /> Try the solo tutorial</button>}
  </div></DialogContent></Dialog>;
}

function Tutorial({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState(0), [channel, setChannel] = useState(0), [strength, setStrength] = useState(0), [dial, setDial] = useState(0);
  useEffect(() => { if (open) { setStep(0); setChannel(0); setStrength(0); setDial(0); } }, [open]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="tutorial-dialog"><DialogHeader>
    <span className="eyebrow mint">SOLO TUTORIAL · {Math.min(step + 1, 5)} / 5</span><DialogTitle>{["Tell your teammate the target", "Choose the power settings", "Try your teammate's relay", "Check and lock in", "You're ready for a crew"][step]}</DialogTitle>
    <DialogDescription>This guided example lets you try both roles. Real missions need at least two people.</DialogDescription>
  </DialogHeader><Progress value={(step + 1) * 20} className="tutorial-progress" />
    {step === 0 && <><div className="tutorial-target"><SymbolIcon value={0} size={65} /><span>Your private target</span><b>STAR</b></div><p>Your teammate cannot see this. Send them a clue.</p><button className="btn primary full" onClick={() => setStep(1)}><MessageSquare size={18} /> Send “We need STAR”</button></>}
    {step === 1 && <><div className="tutorial-reply"><span className="eyebrow">TUTORIAL PARTNER</span><p>“My STAR row says channel B, strength 2.”</p></div><Options label="Channel" value={channel} options={PORTS.map(text => ({ text }))} onChange={setChannel} /><Options label="Strength" value={strength} options={[1, 2, 3].map(n => ({ text: String(n) }))} onChange={setStrength} /><p className="muted">Select B and 2, then continue.</p><button className="btn primary full" disabled={channel !== 1 || strength !== 1} onClick={() => setStep(2)}>Settings selected</button></>}
    {step === 2 && <><div className="tutorial-reply"><p><b>Incoming signal: B</b></p><p>Your relay's STAR row requires <b>exit A</b>. Choose the dial that sends to A.</p></div><Options label="Relay dial" value={dial} options={[{ text: "Dial 1", sub: "Exit B" }, { text: "Dial 2", sub: "Exit C" }, { text: "Dial 3", sub: "Exit A" }]} onChange={setDial} /><button className="btn primary full" disabled={dial !== 2} onClick={() => setStep(3)}>Relay connected</button></>}
    {step === 3 && <><div className="tutorial-target"><SymbolIcon value={0} size={65} /><span>Receiving</span><b>STAR</b><Chip tone="mint"><Check size={15} /> Target matched</Chip></div><p>The power settings and relay exit match. In a real game, every player presses Lock in on their own screen.</p><button className="btn primary full" onClick={() => setStep(4)}><LockKeyhole size={18} /> Lock in</button></>}
    {step === 4 && <><div className="tutorial-target"><CheckCircle2 size={66} className="mint" /><b>Repair complete</b></div><p>Now create a room and invite a friend. Choose Practice for untimed puzzles. Keep your clues on your own screen and share them through chat.</p><button className="btn primary full" onClick={() => onOpenChange(false)}>Back to the game</button></>}
  </DialogContent></Dialog>;
}

export default function Game() {
  const [session, setSession] = useState<Session | null>(null), [room, setRoom] = useState<RoomView | null>(null);
  const [name, setName] = useState(""), [code, setCode] = useState(""), [entryTab, setEntryTab] = useState("create");
  const [rules, setRules] = useState(false), [tutorial, setTutorial] = useState(false), [confirm, setConfirm] = useState<"leave" | "reset" | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [toast, setToast] = useState("");
  const [connected, setConnected] = useState(true), [loaded, setLoaded] = useState(false), [now, setNow] = useState(Date.now()), [offset, setOffset] = useState(0);
  const [message, setMessage] = useState("");
  const lastView = useRef<RoomView | null>(null), chatEnd = useRef<HTMLDivElement>(null);
  const accept = useCallback((view: RoomView) => {
    if (!lastView.current || lastView.current.code !== view.code || view.version >= lastView.current.version) {
      lastView.current = view; setRoom(view); setOffset(view.serverTime - Date.now());
    }
    setConnected(true);
  }, []);
  const clearSeat = useCallback(() => { try { localStorage.removeItem(SESSION_KEY); } catch {} setSession(null); setRoom(null); lastView.current = null; setConnected(true); }, []);
  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) || "");
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) { const seat = JSON.parse(stored); if (seat.code && seat.token && seat.playerId) setSession(seat); }
      const invite = new URLSearchParams(window.location.search).get("room");
      if (invite) { setCode(invite.toUpperCase().slice(0, 6)); setEntryTab("join"); }
    } catch { /* Unavailable browser storage is reported when saving a new seat. */ }
    setLoaded(true);
  }, []);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); }, [toast]);
  useEffect(() => {
    if (!session) return;
    let stopped = false, timer: ReturnType<typeof setTimeout>, controller: AbortController;
    const poll = async () => {
      controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch("/api/rooms/" + session.code, { headers: { Authorization: "Bearer " + session.token }, cache: "no-store", signal: controller.signal });
        const value = await response.json() as RoomView & { error: string };
        if (stopped) return;
        if (!response.ok) {
          if (response.status === 401 || response.status === 404) { clearSeat(); setError(value.error); return; }
          throw new Error(value.error);
        }
        accept(value);
      } catch { if (!stopped) setConnected(false); }
      finally { clearTimeout(timeout); if (!stopped) timer = setTimeout(poll, document.hidden ? 6000 : 1500); }
    };
    void poll(); return () => { stopped = true; clearTimeout(timer); controller?.abort(); };
  }, [session, accept, clearSeat]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: "nearest" }); }, [room?.chat.length]);

  async function createOrJoin(kind: "create" | "join", overrides?: { name?: string; code?: string; mode?: Mode }) {
    const nickname = (overrides?.name ?? name).trim(), roomCode = (overrides?.code ?? code).trim().toUpperCase();
    if (!nickname) { setError("Enter your nickname first."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(kind === "create" ? "/api/rooms" : "/api/rooms/join", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nickname, code: roomCode, mode: overrides?.mode || "mission" }),
        signal: AbortSignal.timeout(12000),
      });
      const value = await response.json() as { error: string; session: Session; room: RoomView };
      if (!response.ok) throw new Error(value.error);
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(value.session)); localStorage.setItem(NAME_KEY, nickname); } catch { setToast("Keep this tab open. Your browser could not save this seat."); }
      setSession(value.session); accept(value.room); setName(nickname);
      window.history.replaceState(null, "", "/?room=" + value.session.code);
      return { code: value.session.code, playerId: value.session.playerId };
    } catch (e) { setError(e instanceof Error ? e.message : "Could not connect. Please try again."); throw e; }
    finally { setBusy(false); }
  }
  async function act(type: string, extra: Payload = {}) {
    if (!session) return;
    setBusy(true); setError("");
    const view = lastView.current;
    const payload = { type, requestId: crypto.randomUUID(), puzzleId: view?.role?.puzzleId, configRevision: view?.role?.configRevision, ...extra };
    try {
      let response: Response | undefined;
      // A network retry reuses the operation ID; the server applies it at most once.
      for (let attempt = 0; attempt < 2; attempt++) {
        try { response = await fetch("/api/rooms/" + session.code, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.token }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000) }); break; }
        catch (e) { if (attempt === 1) throw e; }
      }
      const value = await response!.json() as RoomView & { error: string; left?: boolean };
      if (!response!.ok) throw new Error(value.error);
      if (value.left) { clearSeat(); window.history.replaceState(null, "", "/"); }
      else accept(value);
      return value;
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save that action. Please try again."); return null; }
    finally { setBusy(false); }
  }
  const actionRef = useRef({ act, createOrJoin, room, setRules });
  actionRef.current = { act, createOrJoin, room, setRules };
  useEffect(() => {
    type Tool = { name: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean }; execute: (input: unknown) => unknown };
    const context = (document as unknown as { modelContext?: { registerTool: (tool: Tool, options: { signal: AbortSignal }) => Promise<void> | void } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools: Tool[] = [
      { name: "read_split_signal_room", description: "Read your current room and your own private role only. Does not reveal teammates' clues or credentials.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: () => actionRef.current.room ? { ...actionRef.current.room } : { phase: "entry" } },
      { name: "open_split_signal_rules", description: "Open the game's rules and role instructions.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false }, execute: () => { actionRef.current.setRules(true); return { rulesOpen: true }; } },
      { name: "create_split_signal_room", description: "Create a real multiplayer room and take the host seat. Needs a nickname.", inputSchema: { type: "object", properties: { name: { type: "string", minLength: 1, maxLength: 20 }, mode: { type: "string", enum: ["mission", "practice"] } }, required: ["name"], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: async input => {
        const data = input as { name?: unknown; mode?: unknown };
        if (typeof data?.name !== "string" || !data.name.trim() || data.name.length > 20 || (data.mode !== undefined && !["mission", "practice"].includes(String(data.mode)))) throw new Error("Provide a valid nickname and mode.");
        if (actionRef.current.room) throw new Error("Leave the current room first.");
        return actionRef.current.createOrJoin("create", { name: data.name, mode: data.mode as Mode | undefined });
      } },
    ];
    for (const tool of tools) { try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Unsupported registry */ } }
    return () => lifecycle.abort();
  }, []);

  const self = room?.players.find(p => p.id === room.selfId), host = room?.players.find(p => p.id === room.hostId);
  const isHost = room?.hostId === room?.selfId, role = room?.role;
  const timed = room?.mode === "mission" && room.deadline;
  const remaining = timed ? Math.max(0, Math.ceil((room.deadline! - now - offset) / 1000)) : 0;
  const inMission = room?.phase === "playing" || room?.phase === "between";
  const canClaim = !!room && host && now + offset - host.lastSeen > 45000 && !isHost;
  const offlinePlayers = room?.players.some(p => now + offset - p.lastSeen > 45000);
  const send = async (text: string) => { const result = await act("chat", { text }); if (result) setMessage(""); };
  const copy = async (invite = false) => {
    const text = invite ? new URL("/?room=" + room!.code, window.location.origin).href : room!.code;
    try { await navigator.clipboard.writeText(text); setToast(invite ? "Invite link copied." : "Room code copied."); } catch { setToast("Your room code is " + room!.code); }
  };
  const tutorialOpen = () => { setRules(false); setTutorial(true); };
  const displayError = error && <div className="error-banner" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={18} /></button></div>;
  const safeCreate = (kind: "create" | "join") => { void createOrJoin(kind).catch(() => {}); };

  return <div className={"game-shell " + (room ? "in-room" : "at-entry")}>
    <div className="scene" aria-hidden="true" />
    <header className="site-header"><a href="/" aria-label="Split Signal home" onClick={e => { if (session) { e.preventDefault(); setConfirm("leave"); } }}><Brand /></a>
      <div className="header-actions">{room && <button className="room-code-small" onClick={() => void copy()}><span>ROOM</span> {room.code}<Copy size={14} /></button>}<button className="text-button" onClick={() => setRules(true)}><BookOpen size={17} /><span>Rules & how to play</span></button></div>
    </header>
    {toast && <div className="toast" role="status"><Check size={18} />{toast}</div>}
    <main>
    {!loaded ? <div className="reconnect-screen"><Radio size={40} /><h1>Opening the station…</h1></div> : session && !room ? <div className="reconnect-screen"><Radio size={40} /><h1>Reconnecting to your crew</h1><p>Restoring room {session.code}.</p>{!connected && <><p className="amber">The connection is taking longer than expected. Retrying automatically.</p><button className="btn secondary" onClick={() => { clearSeat(); }}>Return to start</button></>}</div> : !room ? <>
      <section className="entry">
        <div className="entry-story"><div className="mission-label"><span className="small-line" /> COOPERATIVE RESCUE MISSION <span className="mission-id">001</span></div>
          <h1>SPLIT<br /><span>SIGNAL</span><i>.</i></h1>
          <p className="entry-lead">Your screen holds half the story.<br />Your crew holds the rest.</p>
          <p className="entry-description">Trade private clues, connect the relays, and bring a silent station back online. Every player has a part to play.</p>
          <div className="entry-facts"><span><Users size={17} />2–6 players</span><span><Clock3 size={17} />5 minutes</span><span><ShieldCheck size={17} />No sign-up</span></div>
        </div>
        <div className="entry-console"><div className="console-top"><span className="eyebrow mint">CREW ACCESS</span><Radio size={21} /></div><h2>Make the connection.</h2><p>Gather your crew. Pick a call sign.</p>
          <label className="field-label" htmlFor="nickname">Your nickname</label><input id="nickname" autoComplete="nickname" maxLength={20} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Satish" className="text-input" />
          <Tabs value={entryTab} onValueChange={setEntryTab} className="entry-tabs"><TabsList className="entry-tab-list"><TabsTrigger value="create">Create a room</TabsTrigger><TabsTrigger value="join">Join a room</TabsTrigger></TabsList>
            <TabsContent value="create"><p className="tab-help">You'll get a room code to share with your friends.</p><button className="btn primary full" disabled={busy} onClick={() => safeCreate("create")}><RadioTower size={19} />{busy ? "Connecting…" : "Create room"}</button></TabsContent>
            <TabsContent value="join"><label className="field-label" htmlFor="room-code">Room code</label><input id="room-code" className="text-input code-input" autoComplete="off" spellCheck={false} maxLength={6} value={code} placeholder="ABC123" onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} onKeyDown={e => { if (e.key === "Enter") safeCreate("join"); }} /><button className="btn primary full" disabled={busy || code.length !== 6} onClick={() => safeCreate("join")}><Users size={19} />{busy ? "Connecting…" : "Join crew"}</button></TabsContent>
          </Tabs>{displayError}<div className="tutorial-link"><span>First time aboard?</span><button onClick={tutorialOpen}>Try the solo tutorial</button></div><p className="console-footnote">Play on your phone or laptop. No downloads.</p>
        </div>
      </section>
      <section className="entry-bottom" aria-label="How the game works"><article><span className="step-n">01</span><div><h3>Read your clue</h3><p>Each screen reveals something different.</p></div></article><article><span className="step-n">02</span><div><h3>Talk to your crew</h3><p>Share clues through built-in room chat.</p></div></article><article><span className="step-n">03</span><div><h3>Restore the signal</h3><p>Set your controls. Check. Lock in together.</p></div></article></section>
    </> : <div className="room-shell">
      <div className="room-heading"><div><span className="eyebrow">{room.phase === "lobby" ? "PRE-FLIGHT CHECK" : "LIVE MISSION"}</span><h1>{room.phase === "lobby" ? "Assemble your crew." : room.phase === "won" ? "Mission accomplished." : room.phase === "lost" ? "The crew needs another shot." : SYSTEMS[Math.min(room.round, 2)]}</h1></div>
        <div className="mission-metrics">{room.phase !== "lobby" && <><div className={"timer " + (remaining < 45 && timed && inMission ? "urgent" : "")}><Clock3 size={19} /><b>{room.mode === "practice" ? "UNTIMED" : formatTime((room.finishedAt ? room.deadline! - room.finishedAt : room.deadline! - now - offset) / 1000)}</b><small>{room.mode === "practice" ? "practice" : "remaining"}</small></div><div className="fuses"><span>{room.mode === "practice" ? "UNLIMITED CHECKS" : "FUSES"}</span><div>{[0, 1, 2].map(i => <Zap key={i} size={20} className={room.mode === "practice" || i < 3 - room.strikes ? "fuse-on" : "fuse-off"} />)}</div></div></>}<button className="icon-button" title="Leave room" aria-label="Leave room" onClick={() => setConfirm("leave")}><DoorOpen size={19} /></button></div>
      </div>
      {!connected && <div className="connection-banner" role="status"><RefreshCw size={17} /> Reconnecting. Keep this tab open. Controls will return when the connection recovers.</div>}
      {displayError}
      <div className="room-grid"><div className="main-console">
        {room.phase === "lobby" ? <section className="panel lobby-panel">
          <div className="panel-heading"><span className="eyebrow mint">SHARED ROOM</span><Chip>{room.players.length} / 6 aboard</Chip></div>
          <div className="invite-block"><p>Your crew's room code</p><button className="big-code" onClick={() => void copy()} aria-label={"Copy room code " + room.code}>{room.code}<Copy size={24} /></button><button className="text-button mint" onClick={() => void copy(true)}>Copy invite link</button><small>Send the code or link to your friends. Everyone uses their own screen.</small></div>
          <div className="mode-section"><h3>Choose your mission</h3><RadioGroup value={room.mode} onValueChange={mode => void act("mode", { mode })} disabled={!isHost || busy} className="mode-options">
            <label className="mode-card"><RadioGroupItem value="mission" /><Clock3 size={22} /><div><b>Mission</b><span>5 minutes · 3 fuses · 3 repairs</span></div></label>
            <label className="mode-card"><RadioGroupItem value="practice" /><BookOpen size={22} /><div><b>Practice</b><span>No timer · Unlimited checks</span></div></label>
          </RadioGroup>{!isHost && <small className="muted">The host chooses the mode.</small>}</div>
          <div className="lobby-brief"><HelpCircle size={22} /><div><b>Everyone gives clues. Everyone has controls.</b><p>Power shares the target. Relay operators read the wiring and connect the signal. Your role is assigned when the mission starts.</p><button onClick={() => setRules(true)}>Read the rules</button></div></div>
          <div className="lobby-actions"><button className={"btn " + (self?.ready ? "ready-btn" : "secondary")} disabled={busy || self?.ready || !connected} onClick={() => void act("ready")}><Check size={18} />{self?.ready ? "You're ready" : "I'm ready"}</button>
            {isHost ? <button className="btn primary" disabled={busy || !connected || room.players.length < 2 || !room.players.every(p => p.ready && p.online)} onClick={() => void act("start")}><RadioTower size={18} />Start {room.mode === "practice" ? "practice" : "mission"}</button> : <span className="muted">Waiting for {host?.name || "the host"} to start.</span>}
          </div><p className="small-help">{room.players.length < 2 ? "At least one teammate needs to join before you can start." : "All players must be ready before the host can start."}</p>
        </section> : <>
          <div className="repair-track" aria-label={room.repairs + " of 3 repairs complete"}>{SYSTEMS.map((system, i) => <div key={system} className={i < room.repairs ? "complete" : i === room.round ? "active" : ""}><span>{i < room.repairs ? <Check size={14} /> : "0" + (i + 1)}</span><p>{system}</p></div>)}</div>
          {room.phase === "playing" && role && <section className={"panel role-panel role-" + role.kind}>
            <div className="panel-heading"><span className="eyebrow"><LockKeyhole size={14} /> YOUR PRIVATE CONSOLE</span><Chip tone={role.kind === "power" ? "amber" : "mint"}>{role.kind === "power" ? <Zap size={14} /> : <ArrowRightLeft size={14} />}{role.label}</Chip></div>
            <div className="role-title"><h2>{role.kind === "power" ? "Give the signal a destination." : "Find the right connection."}</h2><p>{role.kind === "power" ? "Only you see the target. Tell your crew, then ask Relay 1 for your settings." : "Ask Power for the target symbol. Use that row in your wiring table."}</p></div>
            {role.kind === "power" ? <>
              <div className="signal-cards"><div className="signal-card target-card"><span className="eyebrow">YOUR TARGET</span><SymbolIcon value={role.target!} size={70} /><b>{SYMBOLS[role.target!]}</b></div><div className={"signal-card " + (role.receiving === role.target ? "signal-matched" : "")}><span className="eyebrow">RECEIVING</span><SymbolIcon value={role.receiving!} size={70} /><b>{SYMBOLS[role.receiving!]}</b><small>{role.receiving === role.target ? "Symbol matches. Verify all settings." : "Your crew is adjusting the route."}</small></div></div>
              <button className="share-clue" disabled={busy || !connected} onClick={() => void send("We need " + SYMBOLS[role.target!] + ". Relay 1, what channel and strength?")}><MessageSquare size={17} />Share my target with the crew</button>
              <div className="power-controls"><Options label="Channel" value={role.channel!} options={PORTS.map(text => ({ text }))} disabled={busy || !connected} onChange={value => void act("set", { field: "channel", value })} /><Options label="Strength" value={role.strength! - 1} options={[1, 2, 3].map(n => ({ text: String(n), sub: n === 1 ? "unit" : "units" }))} disabled={busy || !connected} onChange={value => void act("set", { field: "strength", value: value + 1 })} /></div>
              <div className="role-tip"><span>YOUR CHECK</span><p>Use Relay 1's channel and strength. The receiving symbol must match your target. Ask every relay to confirm its exit before locking in.</p></div>
            </> : <>
              <div className="wiring-table"><Table><TableHeader><TableRow><TableHead>Target from Power</TableHead>{role.powerRules && <><TableHead>Channel</TableHead><TableHead>Strength</TableHead></>}<TableHead>Your required exit</TableHead></TableRow></TableHeader><TableBody>{SYMBOLS.map((symbol, i) => <TableRow key={symbol}><TableCell><span className="table-symbol"><SymbolIcon value={i} size={20} />{symbol}</span></TableCell>{role.powerRules && <><TableCell>{PORTS[role.powerRules[i].channel]}</TableCell><TableCell>{role.powerRules[i].strength}</TableCell></>}<TableCell><b className="exit-badge">{PORTS[role.exits![i]]}</b></TableCell></TableRow>)}</TableBody></Table></div>
              {role.powerRules && <div className="quick-clues"><span>Read back a row to Power:</span><div>{SYMBOLS.map((symbol, i) => <button key={symbol} disabled={busy || !connected} onClick={() => void send("For " + symbol + ": choose channel " + PORTS[role.powerRules![i].channel] + ", strength " + role.powerRules![i].strength + ".")}><Send size={13} />{symbol}</button>)}</div></div>}
              <div className="relay-readout"><div><span className="eyebrow">INCOMING</span><b>{PORTS[role.incoming!]}</b><small>from {role.upstreamName}</small></div><Activity size={38} className="mint" /><div><span className="eyebrow">YOUR LIVE EXIT</span><b className="mint">{PORTS[role.outgoing!]}</b><small>check your target's row</small></div></div>
              <Options label="Relay dial" value={role.selected!} disabled={busy || !connected} options={role.shifts!.map((shift, i) => ({ text: "Dial " + (i + 1), sub: "Exit " + PORTS[(role.incoming! + shift) % 3] }))} onChange={value => void act("set", { field: "relay", value })} />
              <div className="role-tip"><span>YOUR CHECK</span><p>Select the dial whose exit matches the target's row. If {role.upstreamName} changes their control, your exits change too. Recheck before locking in.</p></div>
            </>}
            <div className="lock-area"><button className={"btn full " + (self?.ready ? "ready-btn" : "primary")} disabled={busy || !connected || self?.ready} onClick={() => void act("lock")}><LockKeyhole size={18} />{self?.ready ? "Locked in · waiting for crew" : "Lock in my settings"}</button><small>{room.players.filter(p => p.ready).length} of {room.players.length} locked · A control change clears all locks.</small></div>
          </section>}
          {room.phase === "between" && <section className="panel outcome-panel"><div className="success-ring"><CheckCircle2 size={54} /></div><span className="eyebrow mint">REPAIR {room.repairs} COMPLETE</span><h2>{room.repairs === 1 ? "Power is back." : "Antenna aligned."}</h2><p>{room.repairs === 1 ? "The station is waking up. Next, align the antenna." : "The signal has a path. One repair left to reach rescue."}</p><div className="role-rotation"><ArrowRightLeft size={21} /><span>Roles rotate for the next repair. Read your new console.</span></div><button className="btn primary" disabled={busy || !connected || self?.ready} onClick={() => void act("ready")}>{self?.ready ? "Waiting for your crew…" : "Continue to next repair"}</button><small>{room.players.filter(p => p.ready).length} of {room.players.length} ready{room.mode === "mission" ? " · The timer is still running." : ""}</small></section>}
          {(room.phase === "won" || room.phase === "lost") && <section className={"panel outcome-panel final-outcome " + room.phase}>
            <div className="success-ring">{room.phase === "won" ? <RadioTower size={58} /> : <Radio size={58} />}</div><span className={"eyebrow " + (room.phase === "won" ? "mint" : "amber")}>{room.mode === "practice" ? "PRACTICE COMPLETE" : "MISSION DEBRIEF"}</span><h2>{room.phase === "won" ? "SIGNAL RESTORED" : "SIGNAL LOST"}</h2><p>{room.notice}</p>
            <div className="result-stats"><div><b>{room.repairs}/3</b><span>repairs</span></div><div><b>{formatTime((room.finishedAt! - room.startedAt!) / 1000)}</b><span>elapsed</span></div><div><b>{room.strikes}</b><span>failed checks</span></div></div>
            <p className="result-note">{room.phase === "won" ? "A rescue message is on its way. That took the whole crew." : "Try Practice to learn the roles without a countdown."}</p>
            {isHost ? <button className="btn primary" disabled={busy || !connected} onClick={() => void act("lobby")}><RefreshCw size={18} />Play again</button> : <p className="muted">Your host can return everyone to the lobby for another mission.</p>}
          </section>}
          <div className="mission-notice" role="status"><Radio size={17} /><span>{room.notice}</span></div>
        </>}
      </div>
      <aside className="crew-sidebar"><section className="panel crew-panel"><div className="panel-heading"><h2><Users size={18} />Your crew</h2><span className="small-help">{room.players.filter(p => p.online).length} connected</span></div>
        <ul className="crew-list">{room.players.map((p, i) => <li key={p.id}><span className={"avatar avatar-" + i}>{p.name.slice(0, 2).toUpperCase()}</span><div><b>{p.name}{p.id === room.selfId && <small> (you)</small>}{p.id === room.hostId && <Crown size={13} className="amber" />}</b><span>{!p.online ? "Reconnecting…" : p.ready ? (room.phase === "playing" ? "Locked in" : "Ready") : p.role}</span></div>{p.ready ? <CheckCircle2 size={18} className="mint" /> : <span className={"presence " + (p.online ? "online" : "")} aria-label={p.online ? "Online" : "Offline"} />}</li>)}</ul>
        {canClaim && <button className="btn secondary full small" disabled={busy} onClick={() => void act("claim")}>Take over as host</button>}
        {isHost && offlinePlayers && <button className="text-button amber" onClick={() => setConfirm("reset")}>Reset room without offline players</button>}
      </section>
      <section className="panel chat-panel"><div className="panel-heading"><h2><MessageSquare size={18} />Room chat</h2><span className="eyebrow">CREW ONLY</span></div><div className="chat-messages" aria-label="Room messages" role="log" aria-live="polite">{room.chat.length ? room.chat.map(m => <div key={m.id} className={"chat-message " + (m.playerId === room.selfId ? "mine" : "")}><span>{m.name}<small>{new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></span><p>{m.text}</p></div>) : <div className="chat-empty"><MessageSquare size={26} /><p>Your clues belong here.</p><span>Say hello, then share what your screen shows.</span></div>}<div ref={chatEnd} /></div>
        {room.phase === "playing" && <div className="chat-quick"><button disabled={busy} onClick={() => void send("What is our target?")}>Target?</button><button disabled={busy} onClick={() => void send("My settings are ready. Check yours, then lock in.")}>I'm set</button><button disabled={busy} onClick={() => void send("Please wait. I'm adjusting my control.")}>Wait</button></div>}
        <form className="chat-form" onSubmit={e => { e.preventDefault(); if (message.trim()) void send(message); }}><input aria-label="Message your crew" maxLength={200} value={message} onChange={e => setMessage(e.target.value)} placeholder="Message your crew…" /><button aria-label="Send message" disabled={busy || !connected || !message.trim()}><Send size={18} /></button></form><span className="chat-count">{message.length}/200</span>
      </section><div className="sidebar-help"><ShieldCheck size={18} /><p>Your clues stay on your screen until you share them. Keep talking.</p></div></aside>
      </div>
    </div>}
    </main>
    <footer className="site-footer"><span>BUILT FOR SHARED MOMENTS.</span><button onClick={() => setRules(true)}>How to play</button><span>Split Signal · by Satish Singh</span></footer>
    <Rules open={rules} onOpenChange={setRules} onTutorial={tutorialOpen} inMission={!!inMission} /><Tutorial open={tutorial} onOpenChange={setTutorial} />
    <AlertDialog open={!!confirm} onOpenChange={open => { if (!open) setConfirm(null); }}><AlertDialogContent className="confirm-dialog"><AlertDialogHeader><AlertDialogTitle>{confirm === "leave" ? "Leave your crew?" : "Restart with the connected crew?"}</AlertDialogTitle><AlertDialogDescription>{confirm === "leave" ? "Your seat will be released. The remaining players return to the lobby, and a new host is chosen if needed." : "The current mission will end and offline seats will be removed. Connected players stay in the lobby."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Stay here</AlertDialogCancel><AlertDialogAction onClick={() => { void act(confirm === "leave" ? "leave" : "lobby"); setConfirm(null); }}>{confirm === "leave" ? "Leave room" : "Return to lobby"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
