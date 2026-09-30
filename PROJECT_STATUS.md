# Project Status

Updated: September 30, 2026 (Asia/Kolkata).

## Authorization and budget

Build and public publishing are authorized, including clear rules and GitHub checkpoints. The owner requested a solo bot teammate on September 30. INR 0 extra spend: included Sites/D1 only, no paid runtime AI, purchases, credits, or upgrades. No contest submission is authorized now.

## Completed locally

- Full 2–6-player server, API, and responsive UI in `/workspace/sites/split-signal`.
- Private Power/Relay clues, room codes, host lobby, modes, shared deadlines, three repairs, locks/fuses, role rotation, chat, reconnect, replay, and host recovery.
- Rules with worked example and interactive tutorial.
- Station artwork and custom icon.
- D1 migration generated, inspected, and applied locally once.
- First pre-bot TypeScript check and Worker build passed. A previous integration run reached a passing 2-player full mission before interruption; its remaining results were not recovered.
- September 30: solo Nova (bot) implemented. Trades clues via chat, uses only its role projection, operates its station, responds to help/wait, and rotates roles. Lobby can switch between solo and friends. Post-change TypeScript check passed.
- Fixed lobby reset retaining offline seats. Bot never inherits host ownership.

## In progress and unverified

Extended real-Worker/D1 integration tests with complete bot missions, privacy, conversation, mode switching, offline takeover, and deadline expiry. New build and full test run are next. Bot behavior and mobile layout still require browser QA. No public deployment yet.

## Hosting and source

Existing Site ID: `appgprj_6abbb87ccbac81919d299c5a9403c352`. Reuse it; never create another. On September 30, native inspection returned zero versions and no live URL, access custom. Public access is requested and available. Source will be pushed to the Sites-managed remote during the publication workflow; this GitHub repository is the user's recoverable source/checkpoint copy. Never save source credentials in files.

## Exact next actions

1. Build via the Sites build helper, then run `node tests/integration.mjs`.
2. Start supervised Sites preview and test solo, multiplayer entry, rules/tutorial, and phone layout. Fix concrete failures.
3. Publish the exact tested source with public access using Sites; verify native deployment status.
4. Save source, results, public URL, and remaining manual tests here and verify GitHub head.
5. Owner tests normal/incognito and separate phone/laptop, then prepare actual screenshot and submission copy.

## Resume instructions

Read AGENTS.md, README.md, and this file. Preserve existing checkout and source. Inspect interrupted operations before repeating migration or publication. The initial migration was already applied locally; do not blindly replay it. Preview may need restarting after interruption. Tests use an isolated Miniflare D1 fixture and never production data.
