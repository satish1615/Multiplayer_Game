import { actionSchema, body, codeSchema, failure, json } from '@/lib/reactor-api';
import { sync } from '@/lib/reactor-store';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ code: string }> };
export async function GET(request: Request, context: Context) {
  try { return json(await sync(codeSchema.parse((await context.params).code), request)); }
  catch (e) { return failure(e); }
}
export async function POST(request: Request, context: Context) {
  try { return json(await sync(codeSchema.parse((await context.params).code), request, actionSchema.parse(await body(request)))); }
  catch (e) { return failure(e); }
}
