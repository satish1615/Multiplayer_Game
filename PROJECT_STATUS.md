# Project Status

Updated: September 30, 2026 (Asia/Kolkata).

## Current outcome

**Version 1 is publicly deployed:** https://split-signal-satish.satishofficial016.chatgpt.site

Sites returned `succeeded` at 08:25:37 UTC on September 30, 2026. Access is public. The first version supports real 2–6-player rooms and solo play with Nova (bot). Next: the owner's live playtest and small feedback-driven fixes. No contest entry has been submitted.

## Current live bug report (September 30, 15:23 IST)

Owner supplied a screenshot of Solo + bot failing with an HTML-as-JSON parse error and confirmed they were playing **inside ChatGPT**. The screenshot was recovered from its authorized attachment ID after the initial local path was missing.

Native production logs showed successful root-page loads and no matching room API invocations or Worker errors. A direct terminal diagnostic request was denied by hosting security (Cloudflare 1010); no attempts were made to evade the restriction. This does not establish the exact reason for the user's embedded-preview failure. The reported room-creation failure is **not yet confirmed fixed** in the owner's browser.

A small client patch is being prepared: offer the verified public URL in a separate browser tab when embedded; recognize HTML, malformed JSON and non-game upstream error responses before parsing/accepting room state; preserve saved seats during those failures; show a clear error with HTTP status. 13 response tests passed, and TypeScript passed before the final link-only change. Next: checkpoint, build/publish, then ask the owner to retry the direct public link. Do not describe this diagnostic/recovery patch as a verified fix for the hosting rejection.

## Authorization and budget

Building, clear rules, public publishing, and GitHub checkpoints are authorized. The owner requested a solo bot on September 30. INR 0 additional spend. Use included Sites/D1 allowances only; no billed AI API, purchases, credits, upgrades, domains, or paid overages. Hosting capacity is subject to included allowances, not an unlimited or permanent-free guarantee.

## Implemented

- Anonymous nickname and room-code create/join, 2–6-player lobby, readiness, Mission and Practice modes.
- Server-owned private Power/Relay clues, channel/strength and relay controls, shared deadlines, three repairs, three Mission fuses, locks, and rotating roles.
- Chat and quick clue messages, refresh recovery, replay, offline host takeover, and departure cleanup.
- Nova (bot), using only its own role projection and shared chat. Shares clues, operates its controls, responds to basic game requests, locks in, and rotates roles. One human plus one bot; switch to friends in the lobby.
- Clear rules, worked example, five-step interactive tutorial, readable phone layout, station artwork, and custom icon.
- Mobile teammate message beside the controls, bounded chat scrolling, labelled rules control, and scrollable rules dialog.

## Verified

- Final publication workflow: TypeScript check, production Worker build, and all 140 integration assertions passed.
- Tests use the actual built Worker and isolated D1. Complete 2/3/6-player missions, concurrency, idempotency, clue privacy, readiness, rotation, reconnect, replay, fuses/deadline, bot in both roles, offline takeover, seat removal, and bot departure cleanup.
- Actual browser: complete three-repair solo Practice mission, both roles, zero failed checks; refreshed seat recovery; rules and all tutorial steps.
- Phone layout at 390×844 in a browser frame. This is not a physical-device test.
- Actual screenshot: docs/screenshots/solo-mission-complete.jpg.
- Public deployment confirmed through Sites native status. Signed-out production gameplay remains a manual user check.
- Optional WebMCP validation was unavailable in the HTTP preview because modelContext was absent. Gameplay does not depend on it.

## Deployment and source provenance

- Existing Site ID: `appgprj_6abbb87ccbac81919d299c5a9403c352`. Reuse it; never create another.
- Saved version ID: `appgprj_6abbb87ccbac81919d299c5a9403c352~appgver_714c8ddd56488191a5020e95c2ebd9bf` (version 1).
- Deployment ID: `appgdep_6abcc740a6448191907f2ef313ae19e5`, succeeded.
- Exact deployed Sites source commit: `167bbafdeaf2dbaf35b5f1082f9d138332e04d14`.
- Public GitHub source checkpoint before publishing: `2b2ff2cfcfa7d5456919b177059972c3bc070e6a`. Later documentation adds deployment results without changing the application.
- Checkout: `/workspace/sites/split-signal`. Source was pushed by the Sites workflow; this GitHub repository is the owner's recoverable source/progress copy.
- Deployment archive was built from the pushed source. Do not persist or print short-lived source credentials.
- D1 initial migration was generated, inspected, and applied locally once. Do not blindly replay it. Deployment provisioning is managed by Sites.

## Exact next actions

1. Owner opens the public URL signed out, then tests one normal and one incognito session using different nicknames in the same room.
2. Play on a phone and laptop, ideally separate connections. Check all three repairs and replay. Follow docs/PLAYTEST.md.
3. Collect concrete issues: action, expected result, actual result, device/window, and screenshot when useful.
4. Apply small fixes, verify affected behavior, publish a new version, and checkpoint the source/status here.
5. After the live playtest, choose an actual key-screen image and prepare the final title and description within 500 characters. The owner completes contest submission.

## Resume instructions

Read AGENTS.md, README.md, and this file before editing. Preserve existing code. If scratch is gone, restore this GitHub repository or the exact Sites source. Inspect current Site and GitHub status before repeating interrupted operations. Do not re-register the Site, rebuild from scratch, repeat successful migrations, or buy extra usage. Checkpoints identify completed work and the remaining manual tests.
