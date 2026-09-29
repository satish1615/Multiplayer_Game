import { actionSchema, body, codeSchema, failure, json } from "@/lib/api";
import { authenticate, mutateRoom, readRoom } from "@/lib/room-store";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ code: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const code = codeSchema.parse((await context.params).code);
    return json(await readRoom(code, await authenticate(code, request)));
  } catch (e) { return failure(e); }
}
export async function POST(request: Request, context: Context) {
  try {
    const code = codeSchema.parse((await context.params).code), input = actionSchema.parse(await body(request));
    return json(await mutateRoom(code, await authenticate(code, request), input));
  } catch (e) { return failure(e); }
}
