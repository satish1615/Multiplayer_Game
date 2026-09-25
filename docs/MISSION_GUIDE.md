# Mission guide

Source: Prepare and Build sections pasted by the owner on September 26, 2026 (Asia/Kolkata). Submit section is still pending. These are mission instructions, separate from the contest rules in [CONTEST_RULES.md](CONTEST_RULES.md).

## Required result

1. At least two people can join from separate devices, including people in different locations.
2. New players can follow the game's actual rules without a personal explanation from the creator.
3. The game is available at a URL or host that other people can reach.

The Prepare section gives an approximate 30-minute time estimate. This is not the contest submission deadline.

## Workflow described in Build

1. Give ChatGPT Work the requirements and request a plan before implementation.
2. Discuss decisions, review the short game specification, correct it, and approve it.
3. Build the core playable loop first and provide a working preview for testing.
4. Test the host and joining player in separate sessions, such as a normal and an incognito window.
5. Report each problem with the action, the expected behavior, and the actual result.
6. Make focused fixes and retest. Check synchronization, private information, invalid actions, and general usability.
7. After the game works, refine the layout, colors, and style while preserving the game rules and logic.
8. Publish and share. Sites is the selected first publishing path, subject to the owner's INR 0 additional-cost requirement and actual account access.
9. Open the public URL in a private window to verify visitor access, then submit through the mission.

Option A allows experienced users to build directly with these requirements. Option B provides the guided workflow above. There is no requirement to complete both.

## Application to this project

- The game concept remains proposed; receiving these instructions does not mean the owner approved Split Signal.
- Keep GitHub code and PROJECT_STATUS.md updated at meaningful checkpoints.
- Give the owner a preview they can actually reach. A localhost address in an isolated cloud workspace is not automatically accessible on the owner's device; use the environment's supported preview workflow.
- Two browser sessions are an initial test. Also verify at least two independent devices before claiming the cross-device requirement is complete.
- Write game instructions covering objective, turn/actions, role information, win/loss conditions, and replay.
- Design implication for a cooperative game: remote players need a practical communication method. Consider simple room text chat or structured clue sharing in the final spec; do not silently assume everyone sits together or already has a voice call.
- Styling changes should preserve verified behavior; repeat relevant gameplay checks if a styling change affects interactions.
- The pasted guide mentions Netlify and Vercel as alternatives. They have not been selected, and no alternative host or shared-state service has been provisioned.

## Still needed

- The owner's Submit section, including any form fields or evidence requests.
- The final approved game specification.
- Actual implementation, playtesting evidence, public deployment, and submission.

Do not invent missing submission fields or mark planned tests complete.
