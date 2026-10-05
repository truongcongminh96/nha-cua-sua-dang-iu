# Milk Cinema — shared room verification, 05/10/2026

The main UI now selects Sữa/Xiiu and asks for the shared code. The fixed room loads the uploaded R2 movie. The new migration was applied locally without resetting existing data. No hosting deployment was performed.

- `pnpm lint`, `pnpm build`, and all 25 existing tests passed.
- `supabase db lint --local --level error` passed.
- `pnpm test:cinema:shared` passed against local Supabase: wrong code, allowed names, concurrent joins into one room, two stable seats, blocked double-seat identity, reentry, session replacement, retained chat, denied old-session database access, and committed attempt limits.
- Chromium with two isolated identities passed: wrong-code error, room entry, actual R2 movie metadata (1080×1500, 2210.518 seconds), play/pause sync, paused seek to 1436.8 seconds remaining aligned after four seconds, persisted chat received by the other person, remote reaction, refresh remembering name without saving code, 1440×900 desktop and 390×844 mobile, and no uncaught page errors.
- A separate three-context check passed: replacing the Sữa session removed the previous player's UI, the new host seat and guest remained interactive, and Chinese entry/dark mobile layout worked without horizontal overflow.
- R2 URL endpoint checks confirmed video/mp4, exact 2,391,149,634-byte object length, and 206 byte-range responses at the beginning and at byte 2,000,000,000. No complete local media download was used for playback testing.

Screenshots are under `output/playwright/cinema-simple-*.png` and were visually inspected. This is not full-film drift verification, Safari/mobile-device testing, or hosted cross-network verification. The shared code grants either trusted participant name; replacing a browser revokes database access immediately, while prior Realtime authorization remains subject to channel caching until disconnection. The old client performs membership checks every five seconds. Public R2 video access remains independent of private-room/chat access.

---

The following is the historical verification of the previous create/invite flow, retained for context. It does not describe the current main entry UI.

# Milk Cinema — verification, 03/10/2026

Implemented in the existing Vite application at `?page=cinema`. The destination chooser and 3D house remain separate lazy-loaded branches. No deployment has been performed.

## Checks run

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm test` | PASS — 25 tests, including the original house tests and six cinema tests |
| `pnpm build` | PASS — TypeScript and Vite production build |
| `supabase db lint --local --level error` | PASS — no schema errors |
| `pnpm test:cinema:backend` | PASS against actual local Supabase |
| Chromium two-context flow | PASS with separate anonymous identities and actual private Realtime |
| Chromium failure/recovery flow | PASS with controlled autoplay denial, failed media requests, and browser offline/online |
| Missing environment / production preview | PASS — honest setup state; chooser usable; dev-only preview absent from production |

Local backend started with Supabase CLI 2.119.0 and OrbStack. The migration applied on initial startup. Local `.env.local` contains only the API URL and publishable key and is ignored by Git. Local Supabase remains available for development; Docker/OrbStack must be running.

## Database and Realtime evidence

`scripts/check-cinema-backend.ts` creates development identities and verifies:

- An outsider cannot read the room or its messages.
- Invalid invitation keys are rejected.
- Two concurrent guest joins result in exactly one admitted guest and one `roomFull`, with two total members.
- Existing-member rejoin does not consume another seat.
- Direct membership inserts and host reassignment from a client are rejected.
- A nonmember cannot send chat to the room.
- Retrying the same message UUID persists one message.
- Private Broadcast reaches an admitted member.
- A nonmember gets a channel authorization error when subscribing to that private room.

The backend script is intended for a development project and leaves its test identities/rooms in the database. It does not embed or require service-role credentials.

## Real-browser evidence

The two-person flow used **two isolated browser contexts**, one desktop and one mobile, with distinct anonymous auth storage. Media was the playable direct MP4 at `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`.

Verified homepage → cinema → create → invitation → guest join → player; host play/pause received by guest; guest seeking received by host; paused seek alignment; persisted chat in both directions; HTML-like chat text rendered literally; floating reaction delivered; messages appearing once; guest refresh restoring membership, history, and paused playback position; host leaving showing the waiting state, and returning reconnecting the room.

Additional checks covered:

- A simulated browser autoplay policy rejecting playback until the tap-to-start action; playback recovered after interaction.
- Native browser-control fallback receiving remote seeks, with bounded outgoing WebSocket frames instead of an event loop.
- M/arrow keyboard controls and ignoring shortcuts while typing in chat.
- Browser offline/online handling: shared controls disable, connection status appears, and actual Supabase channels reconnect.
- Changing locale while watching preserves video time; changing locale in a form preserves entered values and updates the heading.
- Light/dark UI, responsive landing/room/forms at 390, 430, 768, 1440, and 1920 CSS pixel widths. Room/landing checks included 390×844, 430×932, 768×1024, 1440×900, and 1920×1080.
- Mobile chat sheet opening/closing and returning focus.
- Invalid direct media error, a blocked Drive request displaying its specific error, and the source-retry link selecting the direct-URL tab.
- The house still creates its WebGL canvas; its existing geometry, reading, behavior, storage, and navigation unit tests pass.
- Cinema resource entries do not include `src/app.ts`, so it does not load the house.
- No uncaught page errors in the successful flows. Failed media requests were intentional in failure-state checks.

The browser scripts and visually inspected screenshots are local artifacts under `output/playwright/`, including:

- `cinema-landing-desktop.png`, `cinema-landing-mobile-dark.png`.
- `cinema-ready-desktop.png`.
- `cinema-room-desktop-top.png`, `cinema-room-dark-top.png`, `cinema-room-mobile.png`, `cinema-room-chinese.png`.
- `cinema-chat-mobile.png`, `cinema-create-mobile.png`, `cinema-join-mobile.png`.
- `verify-cinema.js`, `verify-cinema-extra.js`.

## Practical limits and remaining work

- Browser verification used Chromium and a short test video. Safari/Firefox, physical iPhone/iPad devices, long films, background timer throttling over long sessions, real internet latency, and measured long-session drift are not yet verified.
- Drift thresholds, paused/buffering projection, event validation, replay ordering, and authority-epoch recovery have unit coverage. Native fallback and browser recovery have live coverage. This is not a performance benchmark or a claim of a guaranteed sub-300 ms offset on all networks.
- Google Drive success was not verified with a real accessible film. URL parsing and a blocked-request failure/retry state were verified. Drive remains best-effort; use a proper direct video source for reliable viewing.
- Room data is isolated with server-side authorization. Playback/presence are cooperative client broadcasts between the two admitted users, not cryptographically attributable host-only commands. See `supabase/README.md` before adding security-sensitive host-only features.
- There is one active playlist entry, no playlist editor, OAuth/Picker, automatic host transfer, expiry, member eviction, or anonymous-account recovery.
- A total reload of both clients has no durable playback checkpoint; they may need to choose their position again. Temporary guest interruption can recover from the connected host.
- For public hosting, configure hosted Supabase, disable public Realtime access, review any pre-existing permissive channel policies, configure anonymous-sign-in abuse protection, and rebuild with the hosted environment values. Localhost invite URLs are only for local development.

## Additional mobile check, 05/10/2026

Chromium touch/mobile emulation passed for entry and room at 320×740, 375×812, 390×844, 430×932, and 844×390 without horizontal overflow. Tap play/pause, chat send/close, dark theme, and Chinese locale passed. A reduced 390×500 viewport kept the chat sheet within view; this does not simulate an actual OS keyboard. No uncaught page errors were observed.

Landscape originally retained the desktop chat column. Scoped landscape CSS now uses a full-width player, compact room heading, and chat button; the playback control row stays within the 390px-high viewport. Portrait and landscape screenshots under `output/playwright/cinema-phone-*.png` were inspected after stable resize/repaint. `pnpm lint` and `pnpm build` passed after this CSS change. Actual iOS Safari/Android devices and fullscreen behavior still need device testing.


## Two default films, 05/10/2026

The second local file was uploaded directly to R2 via rclone multipart, with exact remote size 306,034,712 bytes verified. Its public endpoint returned video/mp4, Content-Length, Accept-Ranges and a successful 206 response at byte 200,000,000.

`202610050002_cinema_movies.sql` was applied locally, adding the private-to-members catalog and source-selection RPC. Both Sữa and Xiiu can select either default film; the room stores the current source and a monotonic revision. Playback/request payloads are scoped to that revision so old-film events cannot control the new source. Movie changes rebuild media/realtime cleanly, preserve chat drafts and volume/mute preferences, and retain persisted chat. The first movie was restored as the selected source after verification.

- `pnpm lint`, `pnpm test` (25/25), `pnpm build`, and local schema lint passed.
- `pnpm test:cinema:shared` passed, including the two-film catalog, outsider denial for catalog reads/source writes, invalid selection rejection, shared selected URL/revision, idempotent selection and revision increment.
- Chromium with two isolated identities passed both host- and guest-initiated source changes, second-film play/pause and seek to 60 seconds staying aligned, source reset to paused/time zero, retained draft and chat, selected source on reload, and 320/390/844px layouts without horizontal overflow or uncaught page errors.
- Mobile and desktop screenshots `output/playwright/cinema-two-movies-*.png` were visually inspected. Safari/actual devices and whole-film drift remain unverified. No hosting deployment was performed.
