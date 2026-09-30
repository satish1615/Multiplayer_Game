# Split Signal game specification

Build authorized September 29, 2026. The owner specifically requires rules that players can follow independently. The following fills routine implementation details of the discussed cooperative concept.

## Player journey

Enter a nickname, create a six-character room or join one. No login or installation. A host selects Mission (five minutes, three failed checks) or Practice (untimed, unlimited checks). All 2–6 players ready up. Restore three systems together, then transmit the rescue signal. Replay generates new clues.

## Roles and information

One player operates Power. They alone receive the target symbol (STAR, MOON, or TRIANGLE), and see the receiving symbol. They choose channel A/B/C and strength 1/2/3.

Every other player operates one relay in a chain. Relay 1 has a private target-to-channel/strength reference to read back to Power. Each relay has a private target-to-required-exit reference and three dials. Each dial maps the incoming port to a different outgoing port; changing an upstream control changes downstream readouts. Players tell each other the target and settings using room chat or quick messages. External voice is optional and no voice service is required.

A repair succeeds only when the Power channel/strength and EVERY relay's exit match their target row. Final-symbol agreement alone is insufficient. Players may change settings freely. Each player presses Lock in; checking happens only when all have locked the same configuration. Any control change clears all locks. One failed shared check costs one fuse in Mission, not every individual click. After successful repairs, everyone continues and roles rotate.

## Clear rules and practice

Rules must be accessible from entry, lobby, and game. Include a worked example, the difference between giving a clue and pressing a control, role-specific instructions, win/loss rules, and reconnect guidance. A short solo walkthrough may teach the exact controls; multiplayer Practice uses the real synchronized game with no timer or failure limit.

## Solo teammate (authorized September 30, 2026)

Entry includes Solo + bot alongside Create and Join. Nova (bot) is explicitly labelled in the lobby, crew, and chat. Solo starts in untimed Practice; the host can choose a timed Mission. Nova trades clues, responds to mission questions, changes its own controls, locks in, continues, and rotates roles. The human must still share private information and operate their own station.

Nova uses ordinary game logic, with no external AI service or runtime API cost. Decisions use Nova's own private role projection and messages deliberately shared by the human. The bot waits for STAR/MOON/TRIANGLE when on Relay, and for channel/strength (for example B2 or the quick clue button) when on Power. It supports help, greetings, Wait, and I'm set. It is a mission teammate, not an open-ended chat assistant. Wait pauses bot actions, not the mission clock.

Server polls/actions advance one bot turn after a short delay. Bot state is persisted with the room, excluded from client projections, and protected by the same compare-and-swap updates as human actions. No browser has a bot credential. Solo is one human plus one bot; the host can remove Nova in the lobby before inviting friends. Bots never inherit hosting when the last human leaves.

## Reliability and privacy

D1 stores rooms and anonymous seats. Server-generated per-seat tokens authenticate access; only hashed tokens persist. Private clues stay server-side except when intentionally projected to the owning player. Use atomic conditional updates and request IDs to prevent lost or repeated actions. Shared deadlines are server-owned. Returning to the same browser recovers the seat; separate normal/private sessions act as distinct players. Explicit departure returns remaining players to the lobby. An offline host can be replaced after 45 seconds. Rooms expire after 24 hours of inactivity.

## Visual direction

Dark navy station setting, mint/cyan controls, amber signal accents, large touch targets, quiet readable surfaces, and restrained animation. Generated artwork is background imagery only; all controls, symbols, and feedback are real UI.

## Cost and delivery

INR 0 extra spend, included Sites/D1 only, no runtime paid AI APIs, domains, upgrades, or credits. Keep the GitHub source and PROJECT_STATUS.md current. Publish publicly and report actual validation gaps. User will test normal/incognito and separate phone/laptop devices. Contest submission requires an actual screenshot, not a concept image.

