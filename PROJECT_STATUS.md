# Reactor Rush: resume here

Updated: October 3, 2026 (Asia/Kolkata).

## Current state

The Reactor Rush implementation and browser playtest are complete enough for final build validation. Publication is pending; the public URL still serves Split Signal v2. Building, publishing and GitHub checkpoints are authorized. Do not restart design or ask to publish again.

## Locked requirements

- INR 0 additional spend beyond existing ChatGPT access. No paid APIs, credits, upgrades, domains or overages. Use existing included Sites/D1 resources; capacity is not unlimited.
- Preserve Site `appgprj_6abbb87ccbac81919d299c5a9403c352` and URL https://split-signal-satish.satishofficial016.chatgpt.site .
- Sky Lab theme; Iris, helmet-free Orbit, Juno, Comet, Lumi and Jet; approved blue and golden glass energy designs.
- 2–6 players, room codes, no player accounts, solo bots, keyboard/touch, 60/90/custom time, front-page Rules, Deposit energy wording.
- No contest submission on the owner's behalf.

## Implemented and checked

Full create/join/lobby/match/results/replay UI and authoritative game engine. Three carrying slots; max one golden ball; blue +1, gold +2 on deposit. Bots use ordinary code. Server validates movement, inventory, scoring, cooldowns, hazards, rare spawning, timer, host privileges and replay. D1 conditional updates prevent competing requests overwriting a newer state.

Browser checks: two independent human seats plus two bots joined, changed timer, readied and started; same match appeared on desktop and a 390×844 phone frame. Bots moved and deposited; guest joystick moved and collected energy; released knob returned to centre. Refresh recovered the same host seat. Rules opened and closed during play. Fixed HTTP UUID compatibility and scrolling to the top on phase transitions. The temporary phone test page has been removed. Actual gameplay screenshot: docs/screenshots/reactor-rush-gameplay.jpg.

Validation already passed: TypeScript; 36 engine checks; an earlier production Worker/D1 run with 73 assertions plus HTTP validations for 2/3/6 independent players. Latest offline-player removal coverage requires the final rebuild/test below. Results/replay are API-tested; browser results/replay and physical-device production play remain manual checks.

## Exact next actions

1. Run final TypeScript, build and tests/reactor-integration.mjs (includes offline removal). No schema changes. NEVER reapply the initial migration to existing D1.
2. Use the opened Site source result, package and publish the exact built source with Sites; verify terminal deployment success.
3. Update this status, README and docs/PLAYTEST.md with actual final results and release IDs; sync GitHub and verify main.
4. Stop only this Site's preview. Ask owner to play in normal/incognito and on a second physical device outside ChatGPT.

Active checkout: `/workspace/scratch/a9c9e0935281/reactor-rush-work`.
Managed source base/live v2: `abd0d0deee3989f9fb5e743f95a4eaeb355338e5`.
GitHub checkpoint before this update: `7a96592127b3d1614af3b4444f086cb2ff04b34a`.
Artwork is already durably stored on GitHub; do not regenerate it.

## Known limits

Local latency is not internet latency. No large-scale load claim or physical-phone pass has been made. Prior production room creation inside ChatGPT hit an upstream HTML/security error. Safe response handling and direct-browser guidance remain. A successful publish cannot by itself establish the original production issue is fixed; owner must retest. Never bypass hosting security.

Previous decisions and release records: [PROJECT_HISTORY.md](docs/PROJECT_HISTORY.md). That document is historical; this file and current user instructions take precedence.
