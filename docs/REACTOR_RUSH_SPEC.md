# Reactor Rush: first playable specification

Approved build start: October 1, 2026, 12:52 IST. Locked design history: REACTOR_RUSH_DESIGN.md. Current progress: ../PROJECT_STATUS.md.

- Sky Lab: bright white/sky-blue laboratory above clouds with periwinkle accents and a dark arena floor.
- Six equal-stat selectable characters: Iris, helmet-free Orbit, Juno (plum/cream/amber), Comet, Lumi, Jet.
- Create/join via anonymous nickname and six-character room code. Up to six participants. Solo starts with two labelled bots; host can change bot count.
- 60 seconds, 90 seconds, or custom 30–600 seconds; everyone readies before host starts. Three-second shared countdown.
- WASD/arrows or touch joystick move; Space or touch Dash boosts movement with a three-second cooldown. No rival attacks in this first playtest.
- Pick up glass energy balls by touching them. Three slots; at most one rare. Blue is worth one, gold two. Carrying alone gives no points.
- **Deposit energy** automatically by returning to your own labelled reactor. Two blue + one gold = four points in three slots.
- Normal balls respawn four seconds after collection. Rare appears in a reachable random spot away from reactors, with a shared warning. Initial spawn about 20 seconds; later intervals 20–30 seconds while no rare exists. A rare on the ground disappears after 15 seconds. Rare diameter is 20% larger as a playtest default.
- Lasers warn for 1.3 seconds, then activate for 1.3 seconds. Contact drops one carried ball; short protection prevents repeated drops. Dash is movement only.
- Highest deposited score when time ends wins. Tied top scores share victory. Host returns everyone to lobby for another round.
- Server owns movement, scoring, randomness, bots, inventory and time. Clients send bounded inputs, interpolate animation and reconcile with versioned snapshots. No paid API, overages or added infrastructure.
- Keep a visible Rules section on the front page and a rules dialog in the lobby and game. Display bot labels and connection state; preserve seat across refresh.

## Verification gates

Worker/API independent clients and concurrent actions; no client score injection; carrying and deposit rules; cooldown; boundaries; laser drop; rare timing; expiry; disconnected input timeout; host takeover; match timer/ties; rematch; keyboard/touch; readable phone layout. Record actual evidence, not assumptions.
