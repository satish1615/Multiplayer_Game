import { z } from 'zod';
import { body, characterSchema, codeSchema, failure, json, limitGuest, nameSchema } from '@/lib/reactor-api';
import { join } from '@/lib/reactor-store';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const data = z.object({ name: nameSchema, code: codeSchema, character: characterSchema }).strict().parse(await body(request));
    await limitGuest(request, 'reactor-join', 60, 60000);
    return json(await join(data.code, data.name, data.character));
  } catch (e) { return failure(e); }
}
