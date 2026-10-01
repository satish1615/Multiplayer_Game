import { z } from 'zod';
import { body, characterSchema, failure, json, limitGuest, nameSchema } from '@/lib/reactor-api';
import { create } from '@/lib/reactor-store';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const data = z.object({ name: nameSchema, character: characterSchema, solo: z.boolean().default(false) }).strict().parse(await body(request));
    await limitGuest(request, 'reactor-create', 30, 3600000);
    return json(await create(data.name, data.character, data.solo), 201);
  } catch (e) { return failure(e); }
}
