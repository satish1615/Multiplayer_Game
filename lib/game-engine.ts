import { type Puzzle, type RoomState, type RoomView } from "./game-types";
export class GameError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const random = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % max;
const shuffle = () => { const a = [0, 1, 2]; for (let i = 2; i > 0; i--) { const j = random(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function newPuzzle(room: RoomState): Puzzle {
  const players = room.players, powerIndex = room.round % players.length;
  const order = Array.from({ length: players.length }, (_, i) => players[(powerIndex + i) % players.length]);
  return {
    id: crypto.randomUUID(), target: random(3), powerId: order[0].id,
    powerRules: shuffle().map(channel => ({ channel, strength: random(3) + 1 })),
    channel: random(3), strength: 1, configRevision: 0,
    relays: order.slice(1).map((p, i, all) => ({ playerId: p.id, exits: i === all.length - 1 ? [0, 1, 2] : shuffle(), shifts: shuffle(), selected: 0 })),
  };
}
export function signal(puzzle: Puzzle) {
  let input = puzzle.channel;
  return puzzle.relays.map(r => { const incoming = input; input = (input + r.shifts[r.selected]) % 3; return { incoming, outgoing: input }; });
}
export function isSolved(p: Puzzle) {
  const rule = p.powerRules[p.target], path = signal(p);
  return p.channel === rule.channel && p.strength === rule.strength && p.relays.every((r, i) => path[i].outgoing === r.exits[p.target]);
}
export function expire(room: RoomState, now: number) {
  if ((room.phase === "playing" || room.phase === "between") && room.deadline !== null && now >= room.deadline) {
    room.phase = "lost"; room.finishedAt = room.deadline; room.notice = "Time ran out. Your crew can try again."; return true;
  }
  return false;
}
function resetReady(room: RoomState) { room.players.forEach(p => { p.ready = false; }); }
function assertHost(room: RoomState, id: string) { if (room.hostId !== id) throw new GameError("Only the host can do that.", 403); }
export type Action = { type: string; requestId: string; puzzleId?: string; configRevision?: number; value?: number; field?: string; text?: string; mode?: string };
export function applyAction(room: RoomState, id: string, action: Action, now: number, seen: Record<string, number>) {
  const player = room.players.find(p => p.id === id);
  if (!player) throw new GameError("Your seat is no longer in this room. Join again.", 401);
  const key = id + ":" + action.requestId;
  if (room.processed.includes(key)) return;
  expire(room, now);
  switch (action.type) {
    case "chat": {
      const message = action.text?.trim();
      if (!message || message.length > 200) throw new GameError("Messages must contain 1–200 characters.");
      room.chat.push({ id: crypto.randomUUID(), playerId: id, name: player.name, text: message, at: now });
      room.chat = room.chat.slice(-50); break;
    }
    case "mode":
      assertHost(room, id);
      if (room.phase !== "lobby" || !["mission", "practice"].includes(action.mode || "")) throw new GameError("Choose a mode in the lobby.");
      room.mode = action.mode as "mission" | "practice"; resetReady(room); break;
    case "ready":
      if (room.phase !== "lobby" && room.phase !== "between") throw new GameError("This screen has changed. Try again.", 409);
      player.ready = true;
      if (room.phase === "between" && room.players.every(p => p.ready)) {
        room.round++; room.puzzle = newPuzzle(room); room.phase = "playing"; resetReady(room);
        room.notice = "New repair. Roles have rotated. Check your new instructions.";
      }
      break;
    case "start":
      assertHost(room, id);
      if (room.phase !== "lobby") throw new GameError("The mission already started.", 409);
      if (room.players.length < 2 || !room.players.every(p => p.ready)) throw new GameError("You need at least two players, and everyone must be ready.");
      if (room.players.some(p => now - (seen[p.id] || 0) > 30000)) throw new GameError("Wait for all players to reconnect.");
      room.phase = "playing"; room.round = 0; room.repairs = 0; room.strikes = 0;
      room.startedAt = now; room.deadline = room.mode === "mission" ? now + 300000 : null; room.finishedAt = null;
      room.puzzle = newPuzzle(room); resetReady(room); room.notice = "Power: share your target. Relay 1: share the channel and strength."; break;
    case "set": {
      if (room.phase !== "playing" || !room.puzzle || action.puzzleId !== room.puzzle.id) throw new GameError("This repair has changed. Use the updated controls.", 409);
      const p = room.puzzle;
      if (!Number.isInteger(action.value)) throw new GameError("Choose one of the available settings.");
      const value = action.value as number;
      if (action.field === "channel" || action.field === "strength") {
        if (p.powerId !== id) throw new GameError("Only Power can change that control.", 403);
        const min = action.field === "channel" ? 0 : 1, max = action.field === "channel" ? 2 : 3;
        if (value < min || value > max) throw new GameError("That setting is not available.");
        if (p[action.field] === value) break;
        p[action.field] = value;
      } else if (action.field === "relay") {
        const relay = p.relays.find(r => r.playerId === id);
        if (!relay) throw new GameError("Only a relay operator can change a relay.", 403);
        if (value < 0 || value > 2) throw new GameError("Choose dial 1, 2, or 3.");
        if (relay.selected === value) break;
        relay.selected = value;
      } else throw new GameError("Unknown control.");
      p.configRevision++; resetReady(room); room.notice = "Settings changed. Check your readout, then everyone locks in."; break;
    }
    case "lock": {
      if (room.phase !== "playing" || !room.puzzle || action.puzzleId !== room.puzzle.id) throw new GameError("This repair has changed. Check your new role.", 409);
      if (action.configRevision !== room.puzzle.configRevision) throw new GameError("A teammate changed a setting. Check the new readout and lock again.", 409);
      player.ready = true;
      if (room.players.every(p => p.ready)) {
        if (isSolved(room.puzzle)) {
          room.repairs++;
          if (room.repairs === 3) { room.phase = "won"; room.finishedAt = now; room.notice = "Rescue signal received. Your crew is safe."; }
          else { room.phase = "between"; room.notice = "Repair complete. Everyone continues when ready; roles rotate next."; }
        } else {
          room.strikes++; room.puzzle.configRevision++;
          room.notice = "Signal mismatch. Recheck the target, power settings, and every relay's exit.";
          if (room.mode === "mission" && room.strikes >= 3) { room.phase = "lost"; room.finishedAt = now; room.notice = "Three failed checks. The signal was lost. Try a fresh mission."; }
        }
        resetReady(room);
      }
      break;
    }
    case "lobby":
      assertHost(room, id);
      if (room.phase === "playing" || room.phase === "between") {
        if (!room.players.some(p => now - (seen[p.id] || 0) > 45000)) throw new GameError("A live mission is in progress.");
        room.players = room.players.filter(p => p.id === id || now - (seen[p.id] || 0) <= 45000);
      }
      room.phase = "lobby"; room.puzzle = null; room.deadline = null; room.startedAt = null; room.finishedAt = null;
      room.repairs = 0; room.strikes = 0; room.round = 0; resetReady(room);
      room.notice = "Ready for another mission. New clues are generated each time."; break;
    case "claim":
      if (now - (seen[room.hostId] || 0) <= 45000) throw new GameError("The host is still connected.");
      room.hostId = id; room.notice = player.name + " is now the host."; break;
    case "leave":
      room.players = room.players.filter(p => p.id !== id);
      if (room.hostId === id) room.hostId = room.players[0]?.id || "";
      room.phase = "lobby"; room.puzzle = null; room.deadline = null; room.startedAt = null; room.finishedAt = null;
      room.repairs = 0; room.strikes = 0; room.round = 0;
      resetReady(room); room.notice = player.name + " left. Ready up to start with the remaining crew."; break;
    default: throw new GameError("Unknown action.");
  }
  room.processed = [...room.processed, key].slice(-80);
}
export function projectRoom(room: RoomState, selfId: string, version: number, seen: Record<string, number>, now: number): RoomView {
  const p = room.puzzle, path = p ? signal(p) : [];
  let role: RoomView["role"] = null;
  if (p && room.phase !== "lobby") {
    const base = { puzzleId: p.id, configRevision: p.configRevision };
    if (p.powerId === selfId) role = { ...base, kind: "power", label: "Power", target: p.target, receiving: path.at(-1)?.outgoing, channel: p.channel, strength: p.strength };
    else {
      const i = p.relays.findIndex(r => r.playerId === selfId);
      if (i >= 0) {
        const r = p.relays[i];
        role = { ...base, kind: "relay", label: "Relay " + (i + 1), relayIndex: i, incoming: path[i].incoming, outgoing: path[i].outgoing, exits: r.exits, shifts: r.shifts, selected: r.selected, upstreamName: room.players.find(x => x.id === (i === 0 ? p.powerId : p.relays[i - 1].playerId))?.name };
        if (i === 0) role.powerRules = p.powerRules;
      }
    }
  }
  return {
    code: room.code, hostId: room.hostId, mode: room.mode, phase: room.phase,
    players: room.players.map(member => ({ ...member, lastSeen: seen[member.id] || 0, online: now - (seen[member.id] || 0) < 30000, role: p ? (p.powerId === member.id ? "Power" : "Relay " + (p.relays.findIndex(r => r.playerId === member.id) + 1)) : "Crew" })),
    selfId, role, round: room.round, repairs: room.repairs, strikes: room.strikes, deadline: room.deadline,
    startedAt: room.startedAt, finishedAt: room.finishedAt, serverTime: now, notice: room.notice, chat: room.chat, version,
  };
}
