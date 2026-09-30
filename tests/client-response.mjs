import assert from "node:assert/strict";
import { readGameResponse, RoomServiceError } from "../lib/client-response.ts";

let checks = 0;
for (const status of [200, 401, 403, 404, 503]) {
  await assert.rejects(
    readGameResponse(new Response("<!DOCTYPE html><html>Hosting page</html>", { status, headers: { "Content-Type": "text/html" } })),
    error => error instanceof RoomServiceError && error.status === status && !error.message.includes("Unexpected token") && !error.message.includes("<!DOCTYPE"),
  );
  checks++;
}
for (const body of ["<html>Bad upstream</html>", "null", "[]", "3"]) {
  await assert.rejects(readGameResponse(new Response(body, { headers: { "Content-Type": "application/json" } })), RoomServiceError);
  checks++;
}
await assert.rejects(readGameResponse(Response.json({ title: "Access denied", detail: "Blocked upstream" }, { status: 403 })), /Room access was blocked/);
checks++;
const invalidSeat = await readGameResponse(Response.json({ error: "Rejoin this room to get a seat." }, { status: 401 }));
assert.equal(invalidSeat.error, "Rejoin this room to get a seat."); checks++;
const room = { code: "ABC234", players: [{ name: "Pilot" }] };
assert.deepEqual(await readGameResponse(Response.json(room)), room); checks++;
assert.deepEqual(await readGameResponse(new Response(JSON.stringify(room), { headers: { "Content-Type": "application/json; charset=utf-8" } })), room); checks++;
console.log(`PASS ${checks} client response assertions: HTML errors, invalid JSON, upstream denial, seat errors, valid room data`);
