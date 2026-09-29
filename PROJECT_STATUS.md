# Project Status

Updated: September 29, 2026 (Asia/Kolkata).

## Authorization

The owner explicitly said: "Build this and make sure to include rules sections so that players can understand it easily that how they have to play." The Split Signal build is authorized. Do not ask for the same approval again. Public publishing and GitHub checkpoints were already requested. Budget remains INR 0 additional spend.

## In progress

Building Split Signal in `/workspace/sites/split-signal` using the Sites Vinext starter and D1 for authoritative multiplayer state. Site registered as `appgprj_6abbb87ccbac81919d299c5a9403c352`; not deployed yet. Source repository is Sites-managed; this GitHub repository remains the user's source/checkpoint copy. Initial setup and dependency installation succeeded. Generated a standalone orbital station background. The first complete server/API/UI implementation is written. TypeScript validation and the first Worker build passed. Three-table schema migration generated and inspected. Next: apply local migration and run integration/browser tests. The application is not yet verified or published.

## Build scope

2–6 anonymous players, six-character rooms, host lobby, private Power and Relay views, shared timer, three repairs, three failed-check limit, unlimited untimed practice, role rotation, quick messages and room chat, refresh recovery, disconnected-host takeover, replay, mobile layout, and clear rules available before and during play. See docs/GAME_SPEC.md.

## Remaining

- Complete server game engine, API, and UI.
- Generate and inspect schema migration.
- Verify private data, concurrency, timers, full rounds, 2/3/6 players, reconnect and replay.
- Verify layout and interactions using permitted browser QA when available.
- Save source to this GitHub repo and Sites source remote.
- Publish with public access using included Sites hosting. No paid APIs or purchases.
- Verify deployment success. User playtests normal/incognito, then phone/laptop.
- Capture an actual game screen and prepare submission materials after playtesting.

## Exact next action

Continue the incomplete implementation in the existing checkout. Read AGENTS.md and docs/GAME_SPEC.md. Do not register a second Site. Inspect actual local files and running jobs before repeating setup or deployment.

## Known limitations at this checkpoint

No game URL is live. No tests passed yet. Only successfully pushed source is recoverable from GitHub; local changes after this checkpoint may need recovery. Native Sites registration succeeded without a billing or purchase step; use included access only.

## Recent history

- September 29: Build authorized; starter installed; Site registered; implementation started.
- September 27: Three stage previews and a clearer worked-example image produced. Owner's feedback was that caller/control ownership was unclear.
- September 26: Official contest rules, all mission sections, zero-cost constraint, and checkpoint instructions recorded.

