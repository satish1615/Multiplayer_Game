export const SYMBOLS = ["STAR", "MOON", "TRIANGLE"] as const;
export const PORTS = ["A", "B", "C"] as const;
export const SYSTEMS = ["Restore power", "Align the antenna", "Send the rescue signal"];
export type Mode = "mission" | "practice";
export type Phase = "lobby" | "playing" | "between" | "won" | "lost";
export type Player = { id: string; name: string; ready: boolean; joined: number };
export type PowerRule = { channel: number; strength: number };
export type Relay = { playerId: string; exits: number[]; shifts: number[]; selected: number };
export type Puzzle = { id: string; target: number; powerId: string; powerRules: PowerRule[]; channel: number; strength: number; relays: Relay[]; configRevision: number };
export type ChatMessage = { id: string; playerId: string; name: string; text: string; at: number };
export type RoomState = {
  code: string; hostId: string; mode: Mode; phase: Phase; players: Player[]; puzzle: Puzzle | null;
  round: number; repairs: number; strikes: number; startedAt: number | null; deadline: number | null;
  finishedAt: number | null; notice: string; chat: ChatMessage[]; processed: string[]; createdAt: number;
};
export type RoleView = {
  kind: "power" | "relay"; label: string; puzzleId: string; configRevision: number; target?: number;
  receiving?: number; channel?: number; strength?: number; relayIndex?: number; incoming?: number;
  outgoing?: number; exits?: number[]; shifts?: number[]; selected?: number; powerRules?: PowerRule[]; upstreamName?: string;
};
export type RoomView = {
  code: string; hostId: string; mode: Mode; phase: Phase;
  players: (Player & { online: boolean; lastSeen: number; role: string })[];
  selfId: string; role: RoleView | null; round: number; repairs: number; strikes: number;
  deadline: number | null; startedAt: number | null; finishedAt: number | null; serverTime: number;
  notice: string; chat: ChatMessage[]; version: number;
};
export type Session = { code: string; token: string; playerId: string };
