# Project Status

Updated: October 2, 2026 (Asia/Kolkata).

## Reactor Rush implementation is authorized and in progress

At 12:52 IST the owner said **"now start"**. This supersedes every older discussion-only / do-not-build instruction in the historical record below. Build and publish Reactor Rush using the locked Sky Lab theme, six characters, blue D Cyan Spark glass balls and golden glass rare ball. INR 0 additional spend. Reuse the existing Site and URL. Never re-create the project or purchase services.

### Completed in this work session

- Opened existing Site through its managed source workflow. Current public release is still Split Signal version 2; Reactor Rush has NOT been deployed yet.
- Added first server-owned Reactor Rush simulation: movement, walls, dash cooldown, 3-slot carrying, automatic deposits at own reactor, normal respawns, random rare ball, warning lasers, bots, shared timer, ties, rematch, and host takeover.
- Added authenticated create/join/sync API using existing D1 rooms/members tables with version compare-and-swap. Browser cannot set position, score, inventory or deadlines. Old and new room types are isolated.
- Implemented the complete first UI: start screen, six-character selector, room creation/joining, lobby, 60/90/custom timer, bots, readiness, game canvas, keyboard/touch controls, cargo, leaderboard, finish/replay, reconnect, and front-page Rules using **Deposit energy**.
- Integrated all three generated production assets in public/reactor/. Character and energy sprites have true transparency; the arena is opaque. Total artwork is approximately 6.1 MiB, not a sub-1-MB asset bundle.
- TypeScript passed after the UI patch. `node tests/reactor-rules.mjs` passed 36 rule checks including complete 2/3/6-participant bot simulations. This is simulated rule validation, not independent multiplayer API/browser proof.
- Opened the supervised preview and visually inspected the actual start screen. Room joining, actual movement/scoring and phone behavior still need browser verification.

### In progress and exact next actions

1. This WIP checkpoint saves all client/server code, production artwork and progress before further testing.
2. Inspect room creation, lobby and gameplay in the supervised preview; resolve any runtime/control issue.
3. Build the Worker and test 2/3/6 independent clients, concurrent updates, permissions, actual scoring and input timeout. Test separate browser seats and phone layout. Multiplayer responsiveness remains unverified until these checks pass. Review inactive lobby seats so a disconnected player cannot block a room forever.
4. Fix observed issues, publish on the SAME Site, confirm native deployment status, update GitHub with exact source and results.
5. Owner checks signed-out production gameplay in normal/incognito and separate devices. Do not submit the contest entry.

### Playtest defaults announced before implementation

Open arena; 2–6 players including ordinary-code bots; 60/90/custom 30–600 seconds; 3-second dash cooldown; dash is movement only; warning lasers drop one carried ball; highest deposited score wins, ties share victory. Blue is one point, gold two; max three balls and one gold. Gold is visually 20% larger as an initial playtest default. Rare spawns after about 20 seconds, then at random 20–30 second intervals when no rare exists, with a warning; a ground rare expires after 15 seconds. These are editable implementation defaults, not prior user selections. No paid AI service is used.

### Deployment and recovery

Site ID: `appgprj_6abbb87ccbac81919d299c5a9403c352`.
Public URL: https://split-signal-satish.satishofficial016.chatgpt.site
Checkout: `/workspace/sites/split-signal`.
Current deployed source: `abd0d0deee3989f9fb5e743f95a4eaeb355338e5` (Split Signal v2).
Current GitHub design checkpoint before implementation: `b53fb865c4b32c32cccdbe83193688dee79b985b`.
No new D1 schema/migration is required. Never reapply the initial migration to an existing database. Never save tokens or credentials.

The prior embedded ChatGPT room-creation failure is unconfirmed in a direct browser. Preserve safe JSON handling and the external browser link. Native hosting security restrictions must never be bypassed. A successful deployment alone does not verify production gameplay.

---

## Historical checkpoint (superseded by implementation authorization above)

# Project Status

Updated: October 1, 2026 (Asia/Kolkata).

## Current focus: Reactor Rush design discussion

The owner requested discussion before building a more interactive game and chose Reactor Rush. No Reactor Rush gameplay is implemented or deployed. Continue from [the design checkpoint](docs/REACTOR_RUSH_DESIGN.md); do not restart or treat proposals as already approved.

Selected characters: **Iris, Orbit, Juno, Comet, Lumi, Jet**. Iris and Lumi replace Lyra and Echo; Orbit's helmet has been removed. The owner selected **option 2, Juno**, to replace Nova, then supplied a colour reference at 18:40 IST. Juno's outfit now uses plum purple, cream and amber-orange with dark navy equipment; her lavender hair and identity are retained. The current assembled concept reference is docs/concepts/reactor-rush-selected-lineup.png. Older lineup/options boards are preserved as design history; their Nova and original Juno outfit colours are superseded. Character selection and host choices of 60 seconds, 90 seconds, or custom time are recorded in the design notes. Rival bumping, tie handling and several balancing details remain undecided. Responsive multiplayer feasibility within included hosting is unverified; the old polling architecture must not be assumed adequate.

Latest checkpoint changes documentation and concept art only. It does not modify the live game, run a migration or repeat gameplay tests. The INR 0 additional-spend constraint and normal GitHub checkpoint workflow still apply.

**Front-page Rules required, October 1 at 12:28 IST:** The owner explicitly requested a rules section on the front page and asked for theme choices. Keep a visible Rules section directly below the play controls, accessible before joining a room, covering controls, collecting/depositing, carrying limits, scoring and winning. Include blue = one deposited energy, gold = two, three carrying slots and at most one rare ball. Final rule text must reflect the finished decisions; do not invent unresolved combat, hazard or tie rules. This is recorded for Reactor Rush's design, not an implemented change to the currently published Split Signal game.

**Rules wording approved, October 1 at 12:50 IST:** Use **"Deposit energy"** instead of "Bank points". The owner asked what the older phrase meant, then approved the clearer label. Explain that returning collected balls to the player's reactor adds their energy value to the score; two blue balls plus one golden ball add four points on deposit. Existing concept images still show the older heading, but the current text specification overrides that label. This is a wording update only; no scoring rule, artwork or live application was changed.

**SKY LAB THEME LOCKED, October 1 at 12:42 IST:** The owner selected "2. Sky Lab" from the original theme board. The authoritative reference is option 2 in the top-right of [docs/concepts/reactor-rush-theme-selection.png](docs/concepts/reactor-rush-theme-selection.png): a bright futuristic laboratory above the clouds, white and sky-blue surfaces, soft periwinkle accents and rounded architecture. Keep the visible front-page Rules section below Create Room, Join Room and Solo + Bots. Avoid returning to the punchy purple/cyan/pink Neon Station combination the owner rejected. This is Sky Lab, not option 7 Pearl Blue or any of palettes 5–8. The selected characters and ball designs remain locked. Theme approval does not settle map geometry, spawn positions or authorize implementation/publication.

**GOLDEN RARE BALL LOCKED, October 1 at 01:19 IST:** The owner approved the latest transparent glass concept with "Great fix this". The authoritative image is [docs/concepts/reactor-rush-golden-rare-ball-selected.png](docs/concepts/reactor-rush-golden-rare-ball-selected.png). Keep its smooth glossy glass surface, irregular golden energy inside, scattered motes and no separate small core ball. Do not return to the exposed cloud or evenly spaced glowing-line designs. Rare is golden, worth two deposited energy and one carrying slot; normal is blue, worth one. This locks the concept art only, not gameplay implementation or publication.

**NORMAL BLUE BALL LOCKED, October 1 at 01:26 IST:** The owner selected **D, Cyan Spark**. Preserve its smooth transparent blue glass sphere, cyan rim and scattered bright round cyan motes inside with a light haze. The exact selected appearance is D in the lower centre of [docs/concepts/reactor-rush-normal-ball-selection.png](docs/concepts/reactor-rush-normal-ball-selection.png). The full comparison board is retained unchanged so the approved image is recoverable; A, B and C remain unselected. Normal balls bank one energy and use one carrying slot. This is a locked concept reference, not a production sprite or implemented gameplay.

**Size proposal remains pending:** At 01:23 IST the owner asked whether gold should be a little larger. Recommended rare-ball diameter is about 20% larger than normal, for example 30 versus 25 pixels at a given display scale. Selecting D chooses its appearance, not this exact size ratio. The ratio is proposed and untested; both ball types still take one carrying slot and scoring remains one for blue and two for gold.

**Rare ball approved at 23:31 IST:** The owner chose a randomly appearing rare energy ball worth two points when deposited. It uses one carrying slot, with at most one rare ball carried per player. Two normal balls plus one rare ball occupy three slots and bank four energy. Everyone gets a short warning and sees the spawn; it appears at reachable locations away from bases. Roughly 20–30 seconds between appearances is the initial balancing proposal. Dash-count/hit missions are not required. No gameplay code has been changed. Map layout remains undecided: open arena was recommended, with a narrow-corridor maze as the alternative.

**Latest colour direction, 23:42 IST:** After seeing six golden-ball designs, the owner proposed gold for the rare ball and blue for normal balls. Carry this direction into discussion: normal blue = one deposited energy; rare gold = two deposited energy. This swaps only their colours, not scoring or carrying limits. No exact ball design has been selected. Option 2, Bolt Core, was an assistant recommendation, not an owner selection; the six candidates are listed in the design notes.

**Golden-ball art revision, 23:45 IST:** The owner rejected all six initial golden-ball designs and requested more. A new concept board offers 7 Sunburst, 8 Honey Core, 9 Starheart, 10 Mercury Gold, 11 Pearl Spark and 12 Comet Seed. No replacement has been selected yet. Do not revive options 1–6 or treat an assistant recommendation as an owner selection.

**Latest energy-art direction, 23:47 IST:** The owner requested more options and clarified that energy should visibly generate from a central core and spread everywhere. The new board offers 13 Radiant Pulse (outward rays and sparks), 14 Plasma Burst (branching electricity), 15 Solar Flow (flowing plasma streams), and 16 Ripple Core (expanding waves). The rare collectible remains golden and normal balls blue. No option is selected; these are static concept images, with no gameplay or animation implemented.

**Current rare-ball choice, 23:50 IST:** The owner chose option 14, Plasma Burst, as the starting design and requested removal of the small central ball and the lines. A revised single-ball concept removes the distinct inner sphere and softens the sharp lightning branches into flowing golden plasma and outward sparks. Interpreting "lines" as lightning branches was stated to the owner; the revised appearance still awaits feedback and is not a final locked asset. Keep normal balls blue and rare balls golden; scoring is unchanged.

**Latest art correction, 23:53 IST:** The owner clarified that the glow still looked like evenly spaced lines. The second revision replaces the regular streaks with broad, irregular clouds of golden light, varied spacing and round sparks. Keep the separate inner ball removed. The owner wants the glow itself to avoid a line-like appearance; merely softening lightning is insufficient. The new draft remains unapproved concept art, not gameplay or animation.

**Glass-ball revision, October 1 at 01:15 IST:** The owner said the cloud version looked like a stone and requested a glass ball. The new concept has a smooth, glossy transparent sphere containing irregular golden light and scattered motes, with visible reflections and clear areas. It supersedes the exposed cloud exterior and was approved at 01:19 IST; see the locked image above. Rare remains golden and normal remains blue; no gameplay or production asset has changed.

**Character approval is final:** At 18:44 IST on September 30, the owner said "Lock these 6 characters" for the current image. Keep Iris, helmet-free Orbit, Juno in plum/cream/amber, Comet, Lumi and Jet exactly as selected. Do not repeat character ideation without a new request. Continue design discussion; this is not approval to start implementation.

## Current outcome

**Version 2 is publicly deployed:** https://split-signal-satish.satishofficial016.chatgpt.site

Version 2 returned `succeeded` at 10:05:43 UTC on September 30, 2026. Access remains public. It adds safe response handling and a direct-browser play link after the owner reported a room-creation failure inside ChatGPT. The original live room-creation issue still needs a direct-browser user check. No contest entry has been submitted.

## Current live bug report (September 30, 15:23 IST)

Owner supplied a screenshot of Solo + bot failing with an HTML-as-JSON parse error and confirmed they were playing **inside ChatGPT**. The screenshot was recovered from its authorized attachment ID after the initial local path was missing.

Native production logs showed successful root-page loads and no matching room API invocations or Worker errors. A direct terminal diagnostic request was denied by hosting security (Cloudflare 1010); no attempts were made to evade the restriction. This does not establish the exact reason for the user's embedded-preview failure. The reported room-creation failure is **not yet confirmed fixed** in the owner's browser.

Version 2 contains a small client patch: offer the verified public URL in a separate browser tab when embedded; recognize HTML, malformed JSON and non-game upstream error responses before parsing/accepting room state; preserve saved seats during those failures; show a clear error with HTTP status. Final TypeScript validation, production build, and all 13 targeted response tests passed. Publication succeeded. Next: the owner opens the public URL in a separate Chrome tab, outside ChatGPT, and retries Solo + bot. If it fails, record the clearer HTTP error and recheck native logs. Do not describe this diagnostic/recovery patch as a verified fix for the hosting rejection.

## Authorization and budget

Building, clear rules, public publishing, and GitHub checkpoints are authorized. The owner requested a solo bot on September 30. INR 0 additional spend. Use included Sites/D1 allowances only; no billed AI API, purchases, credits, upgrades, domains, or paid overages. Hosting capacity is subject to included allowances, not an unlimited or permanent-free guarantee.

Latest scope: the owner explicitly requested discussion before the Reactor Rush redesign. Character concepts and design checkpoints are authorized; do not start gameplay implementation until the owner says to proceed.

## Implemented

- Anonymous nickname and room-code create/join, 2–6-player lobby, readiness, Mission and Practice modes.
- Server-owned private Power/Relay clues, channel/strength and relay controls, shared deadlines, three repairs, three Mission fuses, locks, and rotating roles.
- Chat and quick clue messages, refresh recovery, replay, offline host takeover, and departure cleanup.
- Nova (bot), using only its own role projection and shared chat. Shares clues, operates its controls, responds to basic game requests, locks in, and rotates roles. One human plus one bot; switch to friends in the lobby.
- Clear rules, worked example, five-step interactive tutorial, readable phone layout, station artwork, and custom icon.
- Mobile teammate message beside the controls, bounded chat scrolling, labelled rules control, and scrollable rules dialog.

## Verified

- Version 1 publication: TypeScript check, production Worker build, and all 140 integration assertions passed. Version 2: TypeScript, production build, and 13 targeted client-response checks passed; the unchanged server suite was not repeated.
- Tests use the actual built Worker and isolated D1. Complete 2/3/6-player missions, concurrency, idempotency, clue privacy, readiness, rotation, reconnect, replay, fuses/deadline, bot in both roles, offline takeover, seat removal, and bot departure cleanup.
- Actual browser: complete three-repair solo Practice mission, both roles, zero failed checks; refreshed seat recovery; rules and all tutorial steps.
- Phone layout at 390×844 in a browser frame. This is not a physical-device test.
- Actual screenshot: docs/screenshots/solo-mission-complete.jpg.
- Public deployment confirmed through Sites native status. Signed-out production gameplay remains a manual user check.
- Optional WebMCP validation was unavailable in the HTTP preview because modelContext was absent. Gameplay does not depend on it.

## Deployment and source provenance

- Existing Site ID: `appgprj_6abbb87ccbac81919d299c5a9403c352`. Reuse it; never create another.
- Saved version ID: `appgprj_6abbb87ccbac81919d299c5a9403c352~appgver_d9c6b526299081919b25a127ef88868e` (version 2).
- Deployment ID: `appgdep_6abcdedd93f4819189688ccde6af88e1`, succeeded.
- Exact deployed Sites source commit: `abd0d0deee3989f9fb5e743f95a4eaeb355338e5`.
- Public GitHub source checkpoint for this patch: `5083e8bf48bfa9d0168ca3e1e65472ef199f9b5f`. Later documentation adds deployment results without changing the application.
- Checkout: `/workspace/sites/split-signal`. Source was pushed by the Sites workflow; this GitHub repository is the owner's recoverable source/progress copy.
- Deployment archive was built from the pushed source. Do not persist or print short-lived source credentials.
- D1 initial migration was generated, inspected, and applied locally once. Do not blindly replay it. Deployment provisioning is managed by Sites.

## Exact next actions

1. Resume Reactor Rush discussion from docs/REACTOR_RUSH_DESIGN.md, the locked golden glass rare ball, D Cyan Spark normal ball and the selected roster: Iris, helmet-free Orbit, Juno, Comet, Lumi and Jet. Do not repeat these art selections unless the owner asks for changes. The proposed 20% larger rare-ball diameter remains a separate pending detail.
2. Continue map layout discussion within the locked Sky Lab theme and retain the front-page Rules section and approved ball designs. Resolve remaining rules and verify real-time networking and zero-extra-cost hosting feasibility before agreeing on a concrete build plan. Do not reopen theme selection unless the owner asks for changes.
3. Implement the redesign only when the owner asks to proceed. Preserve current source, Site identity, deployment history and the unresolved live issue below.

## Deferred Split Signal playtest actions

1. Owner opens the public URL in a separate Chrome tab, outside ChatGPT, and retries Solo + bot. The live room-creation issue is unresolved until that succeeds. If it fails, send the new HTTP error message; inspect native logs without bypassing hosting security. Then test signed-out normal/incognito sessions using different nicknames.
2. Play on a phone and laptop, ideally separate connections. Check all three repairs and replay. Follow docs/PLAYTEST.md.
3. Collect concrete issues: action, expected result, actual result, device/window, and screenshot when useful.
4. Apply small fixes, verify affected behavior, publish a new version, and checkpoint the source/status here.
5. After the live playtest, choose an actual key-screen image and prepare the final title and description within 500 characters. The owner completes contest submission.

## Resume instructions

Read AGENTS.md, README.md, and this file before editing. Preserve existing code. If scratch is gone, restore this GitHub repository or the exact Sites source. Inspect current Site and GitHub status before repeating interrupted operations. Do not re-register the Site, rebuild from scratch, repeat successful migrations, or buy extra usage. Checkpoints identify completed work and the remaining manual tests.
