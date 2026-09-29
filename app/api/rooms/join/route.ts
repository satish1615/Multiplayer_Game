import { z } from "zod";
import { body, codeSchema, failure, json, limitGuest, nameSchema } from "@/lib/api";
import { joinRoom } from "@/lib/room-store";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const input = z.object({ name: nameSchema, code: codeSchema }).parse(await body(request));
    await limitGuest(request, "join", 60, 60000);
    return json(await joinRoom(input.code, input.name));
  } catch (e) { return failure(e); }
}
