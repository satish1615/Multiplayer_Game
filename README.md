# Multiplayer Game

A multiplayer browser game for the Handshake AI Skills Studio "Create a Multiplayer Game" mission.

**Current stage:** Checkpoint setup and official rulebook review complete. Game implementation has not started.

Start with [PROJECT_STATUS.md](PROJECT_STATUS.md) for the latest progress and next action. [AGENTS.md](AGENTS.md) explains how to resume and save work.

## Required outcome

- A reusable game at a public URL.
- Players create or join a room with a room code.
- No player accounts or app installation.
- Works on phones and laptops.
- Shared game state stays synchronized across separate player sessions.
- Groups can replay with a fresh round.
- A project title, cover image, description, and playable link for submission.

## Budget: no additional spending

The owner requires building and publishing at INR 0 additional cost using existing ChatGPT Work access.

- Use the existing GitHub repository and tools available within the current plan.
- Use the hosting provider's included public URL. Do not buy a domain.
- Use hosting and shared-state storage only when covered by an included allowance or a genuine free plan, without paid overages or an expiring paid trial.
- Implement replayable puzzles with game logic and randomized content; no billed AI API calls are required during gameplay.
- Do not purchase credits, plan upgrades, paid assets, databases, or other services.
- If included Work usage is exhausted, resume from a saved checkpoint after the allowance resets; do not buy more usage.
- If a required capability cannot be provided without added cost, explain the limitation and seek a no-cost approach rather than enabling billing.

As checked on September 26, 2026, [OpenAI's pricing documentation](https://learn.chatgpt.com/docs/pricing) says Sites is included with eligible ChatGPT plans during public beta. Actual availability depends on plan, region, and workspace settings. Account-specific deployment access still needs verification. This is not a promise of unlimited capacity or permanently free hosting.

## Proposed concept: Split Signal

**Awaiting approval.** The repository and checkpoint workflow are approved; this game concept has not yet been explicitly approved.

A cooperative escape game for 2-6 players, with approximately five-minute rounds. Players restore a failing space station using different private clues and controls.

Example: one player sees a symbol sequence, another has the symbol instructions, and another operates the switches. The group must communicate to complete the repair. Clues and controls must be distributed so the game also works with only two players.

After a repair, roles rotate. New clue combinations and changing conditions support replay. Everyone remains involved throughout the round.

Proposed visual direction: dark navy, cyan controls, amber warnings, readable text, and large touch targets.

## Proposed milestones

| Milestone | Deliverable |
| --- | --- |
| 0. Checkpoints | This repository, progress record, and resume instructions |
| 1. Design | Approved concept, rules, win/loss conditions, and acceptance criteria |
| 2. Playable core | Create/join rooms and complete one mission across separate player sessions |
| 3. Reliability | Shared timer, server-validated actions, private clue isolation, refresh/reconnection, and host departure handling |
| 4. Game experience | Brief instructions, varied puzzles, feedback, optional sound, and rematches |
| 5. Verification | Multiplayer tests, mobile/desktop checks, and feedback from real players |
| 6. Delivery | Public deployment, verified access without login, cover image, and submission description |

Each milestone can be split into smaller saved steps. A saved partial checkpoint must clearly state what remains unverified.

## Technical direction

Technology choices are pending the approved design and the first multiplayer prototype. Shared room state must be maintained by the server, with each player receiving only the information intended for them. Browser storage alone cannot synchronize separate devices.

ChatGPT Sites is the proposed publishing path. If hosting requires a separate managed source repository, record its relationship to this GitHub repository in PROJECT_STATUS.md and keep the game source recoverable here.

Keep all implementation and publishing choices within the no-additional-spending requirement above.

## Verification plan

Before describing the game as ready, verify:

- Players in separate sessions can create and join the same room.
- Games work with 2, 3, and 6 players.
- Actions, phase changes, scores, and round deadlines agree across sessions.
- Simultaneous or repeated actions cannot apply twice or overwrite valid state.
- Private clues and solutions are not sent to unauthorized clients.
- Refreshing, reconnecting, and a host leaving have defined behavior.
- Invalid/full room codes and expired rooms produce usable messages.
- A rematch starts cleanly without mixing state from the previous round.
- Phone and desktop controls remain usable.
- The deployed URL opens for a signed-out visitor.

Record actual commands, results, and remaining gaps in PROJECT_STATUS.md. Planned tests are not passing tests.

## Challenge references

See [the rulebook summary and submission requirements](docs/CONTEST_RULES.md) for eligibility, judging, required entry materials, and page references from the uploaded official PDF.

The official rules retrieved on September 25, 2026 give equal weight to execution, creativity, usefulness/value, and polish/thoughtfulness. They list an entry deadline of October 30, 2026 at 11:59 PM Pacific, equivalent to October 31 at 12:29 PM IST. Plan to submit earlier and recheck the rules before entry.

- [Mission page](https://joinhandshake.com/learn/create-a-multiplayer-game-8d7d59b5/)
- [Official rules](https://go.joinhandshake.com/rs/390-ZTF-353/images/%5BAI_Skills_Studio_Challenge%5D_Contest_Official_Rules.pdf?version=0)
