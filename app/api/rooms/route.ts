import { z } from "zod";
import { body, failure, json, limitGuest, nameSchema } from "@/lib/api";
import { createRoom } from "@/lib/room-store";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const input = z.object({ name: nameSchema, mode: z.enum(["mission", "practice"]).default("mission"), solo: z.boolean().default(false) }).parse(await body(request));
    await limitGuest(request, "create", 30, 3600000);
    return json(await createRoom(input.name, input.mode, input.solo), 201);
  } catch (e) { return failure(e); }
}
