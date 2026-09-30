# Project Status

Updated: September 30, 2026 (Asia/Kolkata).

## Current focus: Reactor Rush design discussion

The owner requested discussion before building a more interactive game and chose Reactor Rush. No Reactor Rush gameplay is implemented or deployed. Continue from [the design checkpoint](docs/REACTOR_RUSH_DESIGN.md); do not restart or treat proposals as already approved.

Selected characters: **Iris, Orbit, Juno, Comet, Lumi, Jet**. Iris and Lumi replace Lyra and Echo; Orbit's helmet has been removed. The owner selected **option 2, Juno**, to replace Nova, then supplied a colour reference at 18:40 IST. Juno's outfit now uses plum purple, cream and amber-orange with dark navy equipment; her lavender hair and identity are retained. The current assembled concept reference is docs/concepts/reactor-rush-selected-lineup.png. Older lineup/options boards are preserved as design history; their Nova and original Juno outfit colours are superseded. Character selection and host choices of 60 seconds, 90 seconds, or custom time are recorded in the design notes. Rival bumping, tie handling and several balancing details remain undecided. Responsive multiplayer feasibility within included hosting is unverified; the old polling architecture must not be assumed adequate.

Latest checkpoint changes documentation and concept art only. It does not modify the live game, run a migration or repeat gameplay tests. The INR 0 additional-spend constraint and normal GitHub checkpoint workflow still apply.

**Rare ball approved at 23:31 IST:** The owner chose a randomly appearing rare energy ball worth two points when deposited. It uses one carrying slot, with at most one rare ball carried per player. Two normal balls plus one rare ball occupy three slots and bank four energy. Everyone gets a short warning and sees the spawn; it appears at reachable locations away from bases. Roughly 20–30 seconds between appearances is the initial balancing proposal. Dash-count/hit missions are not required. No gameplay code has been changed. Map layout remains undecided: open arena was recommended, with a narrow-corridor maze as the alternative.

**Latest colour direction, 23:42 IST:** After seeing six golden-ball designs, the owner proposed gold for the rare ball and blue for normal balls. Carry this direction into discussion: normal blue = one deposited energy; rare gold = two deposited energy. This swaps only their colours, not scoring or carrying limits. No exact ball design has been selected. Option 2, Bolt Core, was an assistant recommendation, not an owner selection; the six candidates are listed in the design notes.

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

1. Resume Reactor Rush discussion from docs/REACTOR_RUSH_DESIGN.md and the selected roster: Iris, helmet-free Orbit, Juno, Comet, Lumi and Jet. Do not repeat character selection unless the owner asks for changes.
2. Continue the map layout discussion, keeping the approved rare ball. Resolve remaining rules and verify real-time networking and zero-extra-cost hosting feasibility before agreeing on a concrete build plan.
3. Implement the redesign only when the owner asks to proceed. Preserve current source, Site identity, deployment history and the unresolved live issue below.

## Deferred Split Signal playtest actions

1. Owner opens the public URL in a separate Chrome tab, outside ChatGPT, and retries Solo + bot. The live room-creation issue is unresolved until that succeeds. If it fails, send the new HTTP error message; inspect native logs without bypassing hosting security. Then test signed-out normal/incognito sessions using different nicknames.
2. Play on a phone and laptop, ideally separate connections. Check all three repairs and replay. Follow docs/PLAYTEST.md.
3. Collect concrete issues: action, expected result, actual result, device/window, and screenshot when useful.
4. Apply small fixes, verify affected behavior, publish a new version, and checkpoint the source/status here.
5. After the live playtest, choose an actual key-screen image and prepare the final title and description within 500 characters. The owner completes contest submission.

## Resume instructions

Read AGENTS.md, README.md, and this file before editing. Preserve existing code. If scratch is gone, restore this GitHub repository or the exact Sites source. Inspect current Site and GitHub status before repeating interrupted operations. Do not re-register the Site, rebuild from scratch, repeat successful migrations, or buy extra usage. Checkpoints identify completed work and the remaining manual tests.
