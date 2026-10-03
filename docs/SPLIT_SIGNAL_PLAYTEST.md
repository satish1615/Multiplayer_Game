# Split Signal playtest record

September 30, 2026.

## Completed

- TypeScript check and production Worker build passed.
- 140 assertions passed against the built Worker and isolated D1 database.
- Complete missions with 2, 3, and 6 independently authenticated player sessions.
- Concurrent controls and locks, duplicate requests, private clue projection, readiness, role rotation, reconnect, replay, host departure, offline takeover, and server deadline expiry.
- Complete three-repair bot mission through only the human's own role projection and shared chat.
- Bot in both roles, help conversation, bot credentials absent, solo-to-friends transition, last-human departure cleanup.
- Actual browser solo mission: three repairs, both roles, zero failed checks.
- Phone-width browser frame at 390×844: clues, tables, controls, room chat, rules, and complete interactive tutorial.
- Refresh restored the same browser seat.

## Fixes found during browser testing

- Local HTTP preview lacked crypto.randomUUID: use secure random bytes for request IDs instead.
- Chat scroll-to-bottom moved the whole page: scroll only the chat container.
- Phone chat was far from the controls: show the latest teammate message above the controls with a room-chat link.
- Mobile rules button lost its accessible label when its text was hidden: add an explicit label.
- Long rules overflowed the mobile dialog: contain a scrollable body below its fixed heading.

## Your live playtest

These checks still need you and another person or device. A bot is optional and does not replace the challenge's real multiplayer requirement.

1. Open the public link in your normal browser and an incognito window. Use two different nicknames.
2. Create a room in the first window. Join its code in the second. Choose Practice, ready both players, and start.
3. Power shares the target. Relay reads back the matching row. Change your own controls, then lock both screens.
4. Complete all three repairs, checking that roles rotate and both screens agree. Use Play again to return to the lobby.
5. Repeat at least one repair using a phone and a laptop on separate connections. Confirm that the public link opens while signed out.
6. Try Solo + bot. Send a clue, ask for help, and play both roles with Nova.

For an issue, send: “On [device/window], I did [action]. I expected [result], but [actual result] happened.” Include a screenshot if useful. Do not share your browser's private seat token.

## Remaining scope limits

The phone check used a browser frame, not a physical phone. Production reachability will be recorded from Sites deployment status; a signed-out user visit remains a manual check. Browser WebMCP was unavailable in the HTTP preview, so its optional tool registration was not validated. Gameplay uses ordinary browser controls and does not require it.

No contest entry has been submitted. Choose the final screenshot and submission text after the live playtest.

## Live report after initial publication

The owner reported an HTML-as-JSON error from Solo + bot inside ChatGPT. Native Worker logs did not contain a matching API request. The client patch handles non-JSON hosting replies explicitly and offers the verified public URL in a separate browser tab. 13 targeted response checks cover HTML status 200/401/403/404/503, malformed JSON, non-game JSON errors, legitimate seat errors, and successful room data. Direct-browser room creation must be retested by the owner; its success is not yet established.

Version 2 was published successfully at 10:05:43 UTC on September 30. TypeScript, the production build, and all 13 targeted response tests passed. The owner should right-click the public link and open a separate browser tab, then retry Solo + bot. The original production failure is not marked resolved yet.
