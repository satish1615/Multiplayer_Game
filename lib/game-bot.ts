import { applyAction, projectRoom, type Action } from "./game-engine";
import { PORTS, SYMBOLS, type RoomState } from "./game-types";

// Nova makes decisions from the same private projection a human seat receives.
// Only its conversational memory and the puzzle's chat boundary are read directly.
// It never reads another seat's target, wiring table, or the full solution.
export function tickBot(room: RoomState, now: number, seen: Record<string, number>): boolean {
  const player = room.players.find(p => p.isBot);
  if (!player || !room.players.some(p => !p.isBot && now - (seen[p.id] || 0) < 30000)) return false;
  if (room.bot && now < room.bot.nextAt) return false;
  const view = projectRoom(room, player.id, 0, seen, now), role = view.role;
  const key = view.phase + ":" + (role?.puzzleId || "lobby");
  let changed = false;
  const act = (type: string, extra: Partial<Action> = {}) => {
    const current = projectRoom(room, player.id, 0, seen, now);
    applyAction(room, player.id, { type, requestId: crypto.randomUUID(), puzzleId: current.role?.puzzleId, configRevision: current.role?.configRevision, ...extra }, now, seen);
    changed = true;
  };
  const say = (text: string) => act("chat", { text: text.slice(0, 200) });
  const finish = () => { if (changed && room.bot) room.bot.nextAt = now + 1200; return changed; };
  const hint = () => {
    if (view.phase === "lobby") return "Choose Mission or Practice, press I'm ready, then start. We'll each control one station.";
    if (view.phase === "between") return "Press Continue to next repair. We'll swap stations and get fresh clues.";
    if (view.phase !== "playing" || !role) return "We can try a new mission with Play again. Practice has no countdown.";
    if (role.kind === "power") return `We need ${SYMBOLS[role.target!]}. Send that row using the button below your table, route your dial to its required exit, then lock in.`;
    const target = room.bot?.target;
    if (target === undefined) return "You have the private target. Press Share my target with the crew, or type STAR, MOON, or TRIANGLE.";
    const rule = role.powerRules![target];
    return `For ${SYMBOLS[target]}, choose channel ${PORTS[rule.channel]}, strength ${rule.strength}. I'll set my relay. Check your receiving symbol, then lock in.`;
  };

  if (!room.bot || room.bot.key !== key) {
    room.bot = { key, nextAt: now, strikes: view.strikes, cursor: view.phase === "playing" ? room.puzzle?.chatStart : view.chat.at(-1)?.id };
    changed = true;
    if (view.phase === "lobby") { say("Hi, I'm Nova, your bot teammate. I'll trade clues and operate my own station. Choose a mode, ready up, and start when you like."); act("ready"); }
    else if (view.phase === "playing") {
      say(role?.kind === "power" ? `My turn on Power. We need ${SYMBOLS[role.target!]}. What channel and strength does your ${SYMBOLS[role.target!]} row show?` : "You're on Power; I'm on Relay 1. What target do you see? Press Share my target with the crew, or type the symbol here.");
    } else if (view.phase === "between") { say("Nice teamwork! Repair complete. I'm ready to swap roles. Press Continue when you're ready."); act("ready"); }
    else if (view.phase === "won") say("Rescue signal received. We did it! Want another mission? Play again gives us fresh clues.");
    else say("Let's try again. Practice gives us time to learn each station without a countdown.");
    return finish();
  }

  const memory = room.bot;
  const cursorIndex = view.chat.findIndex(m => m.id === memory.cursor);
  const unread = view.chat.slice(cursorIndex + 1).filter(m => m.playerId !== player.id);
  if (view.chat.at(-1)?.id !== memory.cursor && unread.length) { memory.cursor = view.chat.at(-1)?.id; changed = true; }
  let response: string | undefined;
  for (const message of unread) {
    const text = message.text.toUpperCase().replace(/[’']/g, "");
    const target = SYMBOLS.findIndex(s => new RegExp("\\b" + s + "\\b").test(text));
    const settings = text.match(/\b(?:CHANNEL\s*)?([ABC])\s*[,/ -]?\s*(?:(?:STRENGTH|POWER|LEVEL)\s*)?([123])\b/);
    if (/\b(WAIT|HOLD ON|PAUSE)\b/.test(text)) { memory.waiting = true; response = "Take your time. Send I'm set when you're ready for me to continue."; }
    else if (view.phase === "playing" && role?.kind === "relay" && target >= 0) {
      memory.target = target; memory.waiting = false; memory.reported = undefined;
      response = hint();
    } else if (view.phase === "playing" && role?.kind === "power" && settings) {
      if (target >= 0 && target !== role.target) response = `Our target is ${SYMBOLS[role.target!]}. Please send that row from your table.`;
      else { memory.channel = PORTS.indexOf(settings[1] as typeof PORTS[number]); memory.strength = Number(settings[2]); memory.waiting = false; memory.reported = undefined; }
    } else if (/\b(IM SET|READY|CONTINUE|GO AHEAD)\b/.test(text)) { memory.waiting = false; response = "On it. Let's check our readouts and lock in."; }
    else if (/\b(HI|HELLO|HEY)\b/.test(text)) response = "Hi, teammate! " + hint();
    else if (/\b(THANK|THANKS|NICE|GREAT)\b/.test(text)) response = "That's teamwork. " + hint();
    else response = hint();
  }
  if (response) { say(response.slice(0, 200)); return finish(); }
  if (view.phase === "lobby" || view.phase === "between") { if (!player.ready) act("ready"); return finish(); }
  if (view.phase !== "playing" || !role || memory.waiting) return finish();
  if (view.strikes > memory.strikes) {
    memory.strikes = view.strikes;
    if (role.kind === "power") { memory.channel = undefined; memory.strength = undefined; }
    say("That check didn't connect. " + hint()); return finish();
  }
  if (role.kind === "relay" && memory.target !== undefined) {
    const exit = role.exits![memory.target], dial = role.shifts!.findIndex(s => (role.incoming! + s) % 3 === exit);
    if (dial !== role.selected) { act("set", { field: "relay", value: dial }); return finish(); }
    if (!player.ready) {
      const rule = role.powerRules![memory.target];
      say(`My relay is at exit ${PORTS[exit]} and I'm locking in. For ${SYMBOLS[memory.target]}, verify channel ${PORTS[rule.channel]}, strength ${rule.strength}, then lock in on your screen.`);
      act("lock");
    }
  } else if (role.kind === "power" && memory.channel !== undefined && memory.strength !== undefined) {
    if (role.channel !== memory.channel || role.strength !== memory.strength) {
      act("set", { field: "channel", value: memory.channel });
      act("set", { field: "strength", value: memory.strength });
      say(`Power set to ${PORTS[memory.channel]}, strength ${memory.strength}. Route your relay to the ${SYMBOLS[role.target!]} row's required exit, then lock in.`);
      return finish();
    }
    if (memory.reported === undefined) { say(`Power is at ${PORTS[memory.channel]}, strength ${memory.strength}. Set your relay for ${SYMBOLS[role.target!]} and lock in; I'll check the receiver.`); memory.reported = role.configRevision; return finish(); }
    if (view.players.filter(p => !p.isBot).every(p => p.ready)) {
      if (role.receiving === role.target) { say("The receiving symbol matches. Locking in with you."); act("lock"); }
      else if (memory.reported !== role.configRevision + 1000000) {
        say(`I'm receiving ${SYMBOLS[role.receiving!]}, but we need ${SYMBOLS[role.target!]}. Check your required exit and change your dial, then lock again.`);
        memory.reported = role.configRevision + 1000000;
      }
    }
  }
  return finish();
}
