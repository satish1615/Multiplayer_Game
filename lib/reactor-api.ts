import { z } from 'zod';
import { body, json, nameSchema, codeSchema, limitGuest } from './api';
import { ReactorError } from './reactor-engine';
export { body, json, nameSchema, codeSchema, limitGuest };
export const characterSchema = z.enum(['iris', 'orbit', 'juno', 'comet', 'lumi', 'jet']);
export const actionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('input'), x: z.number().finite().min(-1).max(1), y: z.number().finite().min(-1).max(1), seq: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER), dash: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER) }).strict(),
  z.object({ type: z.literal('ready'), requestId: z.string().uuid(), ready: z.boolean() }).strict(),
  z.object({ type: z.literal('character'), requestId: z.string().uuid(), character: characterSchema }).strict(),
  z.object({ type: z.literal('duration'), requestId: z.string().uuid(), value: z.number().int().min(30).max(600) }).strict(),
  z.object({ type: z.literal('bots'), requestId: z.string().uuid(), value: z.number().int().min(0).max(5) }).strict(),
  ...(['start', 'rematch', 'leave'] as const).map(type => z.object({ type: z.literal(type), requestId: z.string().uuid() }).strict()),
]);
export function failure(error: unknown) {
  if (error instanceof ReactorError) return json({ error: error.message }, error.status);
  if (error instanceof z.ZodError) return json({ error: error.issues[0]?.message || 'Check your input.' }, 400);
  if (error instanceof Error && 'status' in error) return json({ error: error.message }, Number(error.status) || 400);
  console.error('Reactor room request failed', error);
  return json({ error: 'The room connection is unavailable. Your seat is saved; try again.' }, 503);
}
