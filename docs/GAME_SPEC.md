# Game concept discussion

Status: Split Signal selected for further discussion. Its detailed rules, visual direction, and implementation plan have not been approved. Updated September 27, 2026 (Asia/Kolkata).

The owner explicitly asked to discuss what to build after sharing all three mission sections.

## Fixed requirements

- At least two players on separate devices, including players in different locations.
- Rules and instructions that new players can follow independently.
- Public playable URL, room code, no player login or installation, and replay.
- INR 0 additional spend; no paid domains, servers, assets, AI APIs, upgrades, or extra credits.
- Save source and progress to GitHub at meaningful checkpoints.
- Review and approve the design before implementation, then build the core loop and test before visual refinement.
- Submit a title, playable URL, actual game screenshot, and description within 500 characters; select public sharing to enter the challenge.

## Concepts to discuss

| Concept | Player experience | Main mechanic | Design risk |
| --- | --- | --- | --- |
| Split Signal | Cooperate under time pressure | Combine private clues and coordinate controls to repair a space station | Clues can become tedious if too much reading or typing is required |
| Vault Pact | Compete through negotiation and bluffing | Make simultaneous choices to cooperate, take rewards, or betray an agreement, using fictional game points | Needs careful balancing so one choice is not always best |
| Pattern Panic | Compete in short puzzle rounds | Solve changing visual patterns and earn points for correct answers | Needs a stronger distinctive mechanic than a standard quiz |

These are brainstormed directions, not claims of uniqueness or likely contest results.

## Current recommendation: Split Signal

Proposed audience: friends and classmates playing remotely or together.

Proposed range: 2-6 players. Short missions of approximately five minutes. Every player holds useful private information and a control. Team members must combine their information; roles rotate between repairs, and new puzzles support replay.

Remote communication must be part of the design. Consider simple room chat and quick clue-sharing messages so play does not depend on a separate calling app.

Keep instructions short and provide a worked example. Avoid player elimination, long waits, or specialist knowledge.

## Assessment against the contest rubric

Recommendation as of September 26: develop Split Signal further. This is a design judgment, not a predicted judging score or a selected plan.

- Execution: a bounded cooperative puzzle loop can make shared state, private information, and correct synchronization easy to demonstrate and test.
- Creativity: this is the main gap in the initial proposal. Private clues, timed cooperation, and generated puzzles already appear in [Keep Talking and Nobody Explodes](https://keeptalkinggame.com/), whose official site was checked on September 26. A space theme or a timer alone does not establish originality.
- Usefulness/value: aim for short sessions, meaningful participation by every player, and enjoyable remote cooperation. Real-player feedback must confirm these aims.
- Polish/thoughtfulness: prioritize readable phone controls, understandable instructions, quick communication, and recovery after disconnection.

Proposed mechanic to explore: linked controls. Each player operates a control whose effects appear partly on another player's screen; the team must find one configuration satisfying the separate clues together. Settle a concrete, understandable example before accepting this design. This may differentiate the implementation, but is not a claim that the mechanic has never existed.

Vault Pact remains a viable alternative, with greater uncertainty around balance and whether bluffing stays engaging with only two players. Pattern Panic is a simpler fallback, but its current pitch offers less differentiation from ordinary puzzle competitions. These comparisons are implementation judgments rather than empirical results.

## Visual concepts shown on September 27

The owner asked for images showing how the stages could look. Three AI-generated UI concept boards were displayed in the conversation:

1. Create/join and room lobby: navy station background, large cyan actions, amber secondary actions, name/code inputs, ready player rows, and a sample room code NOVA42.
2. Two-player gameplay: Alex's Power screen has channel/strength controls and target/current receiver feedback; Sam's Routing screen has incoming-power information and an illustrative route board. Both show shared timer, progress, and room chat.
3. Outcomes: an illuminated communications beacon after rescue, or a dim amber station when time expires, with round results and replay/lobby actions.

These are brainstorming images, not application screenshots, final assets, or an approved UI specification. The visuals use cinematic station artwork behind conventional web controls; they do not imply a working 3D environment. Puzzle wiring and icon states in generated mockups are illustrative and must not be treated as exact game logic.

The owner has agreed to initial testing in one normal browser window and one incognito window. Extra user-feedback collection is optional. Also confirm the actual public game across separate devices.

Proposed pace remains a short untimed practice followed by five-minute missions; the owner has not yet selected the pace. The intended payoff is to restore the station and transmit a rescue signal.

## Decisions still open

1. Cooperative, competitive, or bluffing-focused experience.
2. Final concept, name, theme, and distinctive mechanic.
3. Exact rules, win/loss conditions, scoring, round length, and communication controls.
4. Minimum first playable version and acceptance criteria.

Continue the conversation with one meaningful decision at a time. Once the owner chooses a direction, replace this draft with the agreed specification; do not start implementation until the plan is approved.
