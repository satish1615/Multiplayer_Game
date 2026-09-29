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

## Reliability and privacy

D1 stores rooms and anonymous seats. Server-generated per-seat tokens authenticate access; only hashed tokens persist. Private clues stay server-side except when intentionally projected to the owning player. Use atomic conditional updates and request IDs to prevent lost or repeated actions. Shared deadlines are server-owned. Returning to the same browser recovers the seat; separate normal/private sessions act as distinct players. Explicit departure returns remaining players to the lobby. An offline host can be replaced after 45 seconds. Rooms expire after 24 hours of inactivity.

## Visual direction

Dark navy station setting, mint/cyan controls, amber signal accents, large touch targets, quiet readable surfaces, and restrained animation. Generated artwork is background imagery only; all controls, symbols, and feedback are real UI.

## Cost and delivery

INR 0 extra spend, included Sites/D1 only, no runtime paid AI APIs, domains, upgrades, or credits. Keep the GitHub source and PROJECT_STATUS.md current. Publish publicly and report actual validation gaps. User will test normal/incognito and separate phone/laptop devices. Contest submission requires an actual screenshot, not a concept image.

