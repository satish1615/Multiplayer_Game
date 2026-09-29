import { z } from "zod";
import { GameError } from "./game-engine";
import { hash, rateLimit } from "./room-store";
export const nameSchema = z.string().trim().min(1, "Enter a nickname.").max(20, "Use a nickname of 20 characters or fewer.").regex(/^[\p{L}\p{N} _.-]+$/u, "Use letters, numbers, spaces, or . _ - in your nickname.");
export const codeSchema = z.string().trim().toUpperCase().regex(/^[A-Z2-9]{6}$/, "Enter the six-character room code.");
export const actionSchema = z.object({
  type: z.enum(["chat", "mode", "ready", "start", "set", "lock", "lobby", "claim", "leave"]),
  requestId: z.string().uuid(), puzzleId: z.string().uuid().optional(), configRevision: z.number().int().nonnegative().optional(),
  value: z.number().int().optional(), field: z.enum(["channel", "strength", "relay"]).optional(),
  text: z.string().max(200).optional(), mode: z.enum(["mission", "practice"]).optional(),
});
export async function body(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new GameError("Open the game in its own tab and try again.", 403);
  const text = await request.text();
  if (text.length > 8192) throw new GameError("This request is too large.");
  try { return JSON.parse(text); } catch { throw new GameError("Send a valid game action."); }
}
export async function limitGuest(request: Request, action: string, maximum: number, window: number) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "anonymous";
  await rateLimit(action + ":" + await hash(ip), maximum, window);
}
export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store, max-age=0", "Vary": "Authorization", "X-Content-Type-Options": "nosniff" } });
}
export function failure(error: unknown) {
  if (error instanceof GameError) return json({ error: error.message }, error.status);
  if (error instanceof z.ZodError) return json({ error: error.issues[0]?.message || "Check your input." }, 400);
  console.error("Game request failed", error);
  return json({ error: "The station connection is unavailable. Your input is safe; please try again." }, 503);
}
