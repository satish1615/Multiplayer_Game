# Reactor Rush validation

Updated October 3, 2026 (Asia/Kolkata). Publication pending.

## Completed

- TypeScript compilation passed after the UUID/recovery/offline-seat patches and the phone scroll correction.
- `node tests/reactor-rules.mjs`: 36 checks passed. Includes full 90-second bot simulations with 2/3/6 participants, carrying/scoring, laser protection, rare expiry, dash cooldown, disconnected input, ties and rematch.
- Previous actual built Worker test: 73 assertions plus HTTP validation passed with 2/3/6 independent players. Concurrent conflicts: 0. Local request median 3 ms, p95 15 ms. These local figures do not predict internet latency or hosted capacity.
- Browser: independent host and guest with separate tab seats joined the same room plus two bots. Tested character selection, 90-to-60-second setting synchronization, readiness, start, live bot movement/scoring, keyboard control wiring, a 390×844 phone layout, joystick movement/pickup and centred release, same-seat refresh recovery, Rules dialog and front-page rules.
- Fixed browser-discovered HTTP crypto.randomUUID compatibility issue. Added secure random UUID fallback. Fixed mobile scroll position when entering a round. Removed temporary phone QA route.
- Actual screenshot: [gameplay](screenshots/reactor-rush-gameplay.jpg).

## Final validation pending

Rebuild and run `node tests/reactor-integration.mjs` after adding offline-player removal. Then publish the exact validated build and record deployment status. The new checks reject removing online players and non-host removal, and invalidate removed seat access.

## Owner's live playtest

1. Open the public URL in a regular browser, outside ChatGPT. Enter a nickname, select a character and create a room.
2. In incognito or a second device, join the room with another nickname. Verify both players and the chosen duration appear in both windows.
3. Ready both and start. Collect energy with WASD/arrows or joystick, return to your own reactor, and confirm both scoreboards agree. Try Dash while moving.
4. Try a golden ball and cross an active laser while carrying energy. Confirm three-slot/max-one-gold limits and the drop rule.
5. Refresh one tab during play. Confirm it reconnects with the same score. Leave a tab inactive and verify controls stop rather than moving forever.
6. Finish and compare the winner and all final scores. Choose Play again; ready both and start a new round.
7. Play Solo + bots and check bot rivals move and deposit without input.
8. On a real phone, test simultaneous joystick + Dash, portrait/landscape, and a weak connection. Browser frame tests do not replace this.

Results/replay are covered by server integration tests; their final browser confirmation and real signed-out production play are still manual. The prior embedded hosting error is not proven fixed by a deployment alone. If a request fails, record the exact message/status and approximate time; inspect native Site logs rather than bypassing security.

Describe bugs as: “In [host/guest/device], I did [action], expected [result], and saw [actual result].”

Historical Split Signal evidence is preserved in SPLIT_SIGNAL_PLAYTEST.md.
