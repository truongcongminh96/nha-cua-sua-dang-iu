# Milk Cinema — MVP integration requirements

Status: revised implementation plan (2026-10-05), not a report of completed changes.

Latest agreed scope: one shared room for **Sữa** and **Xiiu**. Both enter the same six-digit code **300492**, select their name, and choose between two preconfigured R2 movies. No room creation, invitation link, source selection, or upload UI is required in the main experience. This scope supersedes the general create/join flow described below; retain the existing player, synchronization, chat, responsive design, locales, and house navigation.

Shared-room implementation:

- Validate the code in the restricted `cinema_enter_shared` database RPC, not in client JavaScript. Store its digest and the movie URL in `milk_private.shared_cinema`.
- Allow only the two names, serialize room/seat creation, and keep at most two member records. Re-entering the same name on a different browser moves that seat to the new anonymous identity and retains message history. One browser identity cannot take both seats.
- The first person to enter coordinates playback. When that person's seat moves to another browser, host ownership follows it. Existing room authority ordering remains unchanged.
- An old replaced browser loses database access and leaves the room on its next membership check (every five seconds). This is a convenient shared-code experience for two trusted people, not individual account authentication; anyone who knows the shared code can select either name. Existing Realtime authorization caching still applies until channel reconnection/removal.
- Apply `supabase/migrations/202610050001_shared_cinema.sql`. Existing rooms and messages are retained. Do not reset the database.
- The owner uploads videos outside the app. The default catalog contains **Phim 01** and **Phim 02**, seeded by `202610050002_cinema_movies.sql`. Both people can choose either film in the room; the database serializes selection, stores the selected URL and a monotonic video revision, and broadcasts a notification. Both browsers reload the selected source paused at the beginning. Playback events and requests from older source revisions are ignored. Catalogue editing/upload stays outside the UI.
- Both people visit `?page=cinema`. Refresh returns to name/code entry, with the last chosen name remembered and the code never stored in browser storage. The selected name is only a preference, not authorization.


Build Milk Cinema as the watch-together section of the existing **Sữa Bea** website in this repository. Work as a senior full-stack engineer and product designer. Implement the application, run it locally, verify it in a real browser, fix discovered issues, and leave the repository runnable.

## 1. Repository scope and product entry

This repository already contains a working Vite + TypeScript + Three.js house experience. Preserve that work and integrate cinema into the same application.

The existing homepage has two destinations:

- **Đi xem phim** opens `?page=cinema`.
- **Vô nhà** opens `?page=home` and loads the existing 3D house.

These two options are already implemented, as shown in the user's homepage reference. Do not build another destination chooser or replace the current homepage with the Milk Cinema landing. Implement the described cinema experience inside the existing **Đi xem phim** destination. Preserve the current homepage layout and its two destination rows.

The cinema entry URL during local development is:

```text
http://localhost:5173/?page=cinema
```

Replace the cinema placeholder with the Milk Cinema landing page. Keep the homepage destination chooser, its Vietnamese/Chinese language controls, theme controls, and navigation back to it. Milk Cinema is the cinema section's name; the surrounding website remains Sữa Bea.

Keep the current Vite architecture. Do not migrate this repository to Next.js, introduce App Router or `next/font`, or replace the house to satisfy this specification. React, Tailwind, and shadcn/ui are not required. Use reusable TypeScript modules, DOM components, the existing CSS system, Lucide, pnpm, and Supabase.

Do not modify the house's models, camera, pet behavior, reading experience, discoveries, or storage keys as part of cinema development. Load cinema modules only on cinema URLs, and continue loading Three.js only when entering the house. Scope cinema styles so they do not change the house or chooser.

## 2. Product goal

Milk Cinema is a private cinema room for two people. A user can:

1. Enter cinema from the homepage.
2. Create a room with a name, their display name, and a video source.
3. Copy an invitation URL and share it with one other person.
4. Join an invited room with a display name.
5. Watch the same video with synchronized play, pause, and seek.
6. Chat and send reactions while watching.
7. Use the interface comfortably on desktop and mobile.

Use owner-managed Cloudflare R2 media URLs as the recommended source, through the existing direct-video path. Keep other directly playable HTTPS media URLs usable. Preserve the current UI, room system, player, synchronization, chat, reactions, locales, themes, and responsive behavior. No application upload, upload backend, R2 SDK, Google login, or complex playlist management is required.

## 3. Design foundation

Read `doc/DESIGN.md` and `doc/SKILL.md` before writing UI code. Use their Xuan Paper visual direction. Their NineTails brand, chapter catalog, studio content, and framework-specific instructions are reference material; adapt the visual language to Sữa Bea and Milk Cinema. This document defines cinema scope and takes precedence for its routes, stack, and behavior.

Core colors:

- Paper: `#F6F2E9`.
- Paper deep: `#EFEADD`.
- Ink: `#1C1A17`.
- Seal red: `#B23A2B`.
- Night ink: `#141210`.

Typography: Fraunces for display, Noto Serif SC for Chinese, and IBM Plex Mono for metadata and small labels. Reuse the repository's font-loading approach and system fallbacks.

Use warm paper texture, elegant whitespace, hairline borders, subtle grain, meaningful ink decorations, small red seals, and restrained motion. Use a cinematic Night Ink surface for the video player. Avoid a generic SaaS dashboard or a Netflix-style catalog. Artwork must work without external image assets.

Follow the existing Vietnamese/Chinese locale mechanism. Add translations for cinema UI; preserve locale and theme when navigating among chooser, cinema, and house. User-entered room names and messages are not translated.

## 4. Routes and navigation

Use query-based routes compatible with the existing static Vite deployment:

```text
/?page=choose                       Homepage destination chooser
/?page=home                         Existing 3D house
/?page=cinema                       Milk Cinema landing and join entry
/?page=cinema&view=create           Create-room form
/?page=cinema&room=M7K2             Watch room for an existing member
/?page=cinema&room=M7K2#invite=...   Invitation for a new member
```

Build URLs from the current deployment origin and base path; do not hardcode localhost in generated invites. Do not introduce separate Next.js `/create` or `/room/[roomId]` routes.

Reload, direct invitation navigation, Browser Back/Forward, and return to the homepage must work. Use real links where practical. If using History API navigation, handle `popstate` and clean up the previous screen before mounting another.

Show useful states for malformed URLs, unknown rooms, invalid invitations, full rooms, and unavailable connections. Returning to the chooser must not delete a room.

## 5. Landing and create-room screens

Cinema landing content:

```text
Milk Cinema
WATCH TOGETHER

Phim hay hơn
khi có người
cùng xem.

Một không gian riêng,
dành cho những khoảnh khắc
thật đặc biệt.
```

Primary CTA: **Tạo phòng xem**. Secondary CTA: **Tham gia phòng**. Include a quiet way to return to the homepage.

The create screen has:

- Room name, with example `Đêm phim của chúng ta ❤️`.
- Display name.
- One primary **URL video** input for an already uploaded Cloudflare R2 video or another directly playable media URL. Do not add an Upload tab.
- A hint: **Tự upload phim lên Cloudflare R2, rồi dán liên kết phát trực tiếp vào đây.**
- URL validation, a pending state, and a clear submission error.
- Remove Google Drive from the new-room primary source selector. Preserve support for existing Drive rooms as legacy behavior with its current explicit error state.

Validate nonempty trimmed names, reasonable length limits, and source URLs. Accept HTTPS media URLs and allow local HTTP URLs for local development. Reject executable URL schemes. Do not require `.mp4` at the end of a playable URL, since media may use query parameters or signed URLs.

Generate a readable room code, for example `M7K2`, with a unique database constraint and collision retry. After a successful database transaction, show **Phòng của bạn đã sẵn sàng!**, the code, **Sao chép liên kết mời**, and **Vào phòng**. Handle clipboard failure with a selectable URL fallback.

The join entry accepts an invitation URL, or a room code plus invitation key, and the guest's display name. A short room code alone is not a private-room credential.

## 6. Identity, invitation, and room access

Use Supabase anonymous sign-in to establish a stable authenticated identity without asking for email, password, or Google login. Reuse the session on refresh. Explain in setup docs that clearing browser storage loses that anonymous identity.

Rooms admit at most two distinct authenticated users, including the host. Multiple tabs or a refresh for the same identity must not create another membership or consume another seat. Presence should aggregate tabs for the same member.

Use a cryptographically random invitation secret with at least 128 bits of entropy, separate from the short room code. Put it in the invitation URL fragment. Validate it through a restricted server-side database RPC before granting membership. Store only its digest in a private, non-exposed schema; never return that digest to general room readers. Avoid logging the raw invitation secret. Preserve a valid invitation through the initial anonymous sign-in flow, then remove it from the visible URL after membership is granted.

Creation and joining must be atomic database operations. Joining must lock or otherwise serialize capacity checks so simultaneous joins cannot admit a third member. Rejoining an existing membership is idempotent. Preserve membership during transient disconnection; the MVP does not automatically evict members or recycle their seats.

Enable RLS on rooms, members, and messages. Authorize reads and writes through actual room membership. Do not allow room enumeration, cross-room chat access, direct self-enrollment, arbitrary host reassignment, or member identity spoofing through database writes. Use hardened RPCs for privileged creation/joining, with restricted grants, validated inputs, and a fixed safe `search_path` if using `SECURITY DEFINER`.

Use private Supabase Realtime channels and RLS on `realtime.messages` for both Broadcast and Presence, scoped to the channel's room membership. Disable public Realtime access. A client-supplied `senderId`, display name, or `is_host` field must not grant database permissions.

## 7. Data model and setup

Provide a migration under `supabase/migrations/` with tables, foreign keys, indexes, constraints, RPCs, grants, and RLS policies.

```text
rooms
  id                  UUID primary key
  code                Unique readable room code
  name
  video_provider      direct | google-drive
  video_url
  video_file_id        Nullable, Drive only
  host_id             Auth user UUID
  created_at

room_members
  id                  UUID primary key
  room_id             rooms.id
  user_id             Auth user UUID
  display_name
  joined_at
  last_seen_at
  UNIQUE(room_id, user_id)

messages
  id                  UUID primary key / idempotency key
  room_id
  member_id
  display_name        Server-derived name snapshot
  content
  created_at          Server timestamp

private invitation data
  room_id
  invite_secret_hash
```

Derive the host indicator by comparing the authenticated user's ID with `rooms.host_id`; avoid a separately mutable `is_host` flag. Enforce message membership within the same room, trimmed nonempty content, and maximum length. Throttle repeated create/join attempts and excessive messages/reactions using mechanisms appropriate to this MVP; do not rely on UI throttling to protect privileged RPCs.

Persist chat history. Playback ticks use Realtime Broadcast, not per-tick Postgres writes. Presence is the live online signal; `last_seen_at` is optional coarse bookkeeping and must not trigger writes every frame.

## 8. Owner-managed Cloudflare R2 playback

Expected flow:

```text
Owner uploads video to Cloudflare R2 outside Cinema
    ↓
Owner copies the public object media URL
    ↓
Create room: paste URL + enter room/display names
    ↓
Create Supabase room using the existing direct provider
    ↓
Both browsers stream from R2 in the existing HTML5 player
```

Keep resolution separate from the player. An R2 public object URL is a direct video source; do not introduce a separate provider merely to label its storage host:

```ts
type VideoSource =
  | { provider: 'direct'; url: string }
  | { provider: 'google-drive'; fileId: string; originalUrl: string }; // Existing rooms only
```

Reuse `src/cinema/video/providers.ts`, `roomSource()`, and the current create-room RPC. The current database already accepts direct HTTPS URLs. No schema migration, object-key field, upload record, or R2 credentials are required for this scope. Keep existing room data and legacy Drive parsing compatible.

The application must not implement file selection, drag/drop, upload progress, presigned upload APIs, multipart upload, upload cleanup, or browser-side transcoding. The owner manages upload, naming, and deletion outside Cinema. Do not install AWS S3 packages or add R2 access/secret keys to this repository for playback alone.

Load the URL directly using native `<video src="..." preload="metadata" playsinline>`. Do not fetch the whole film into a Blob, base64, or browser memory. Do not proxy video bytes through Vite, Vercel, or Supabase. Supabase continues handling room data and realtime events only.

Recommend MP4 with H.264 video and AAC audio. R2 stores/delivers the file; this plan does not add codec conversion. A filename ending in MP4 does not guarantee browser compatibility. Preserve clear loading, buffering, unsupported-media, network, and unavailable-source errors, with a way to try another source.

The media URL must point to the object itself, not the Cloudflare dashboard or an HTML preview/download confirmation page. Document public development access through `r2.dev` and a custom media domain for production. Do not hardcode the bucket/domain into the player or require `R2_PUBLIC_BASE_URL` when the user pastes a complete URL.

Document R2 playback CORS for the actual deployment origins, including `http://localhost:5173`, with GET and HEAD. Expose useful headers such as Content-Length, Content-Range, Accept-Ranges, and ETag. PUT/upload CORS is outside this application scope. CORS does not make a public object private.

Public media URLs are an explicit MVP tradeoff: anyone with the URL can access the video independently of the private Supabase room. Room invitation/RLS protections remain in place for membership and chat. Temporary signed playback URLs are future work: a complete solution would need room-authorized URL issuance and renewal, and should retain the existing player and synchronization interfaces. Do not claim public media inherits room privacy.

Verify the actual R2 object URL with byte-range requests and seeking. Inspect successful 206/Content-Range responses and seek from an early timestamp to a much later point in a long film. Confirm playback does not require downloading the complete file first. Missing R2 access or a real media URL must not block independent changes; keep direct URL mode usable and report real R2 verification as pending rather than simulate success.

Do not attempt to fix Drive's large-file confirmation page or replace the synchronized player with a Drive iframe as part of this change.

## 9. Watch room and custom player

Desktop: a room header, a large video area with controls, and a compact chat column. Show room name/code, invitation action, both members, and host/connection indicators. Mobile: video first, controls and reactions next, with chat accessible as a bottom sheet. In landscape mobile, prioritize fullscreen video.

Use native HTML5 video with `playsinline` and custom controls:

- Play/pause, progress slider, seek, rewind/forward 10 seconds.
- Volume, mute, fullscreen, current time, and duration.
- Loading, buffering, ended, invalid source, and playback error states.

Controls fade when inactive but remain available during keyboard focus, open interactions, and pause/error states. Clamp seek values to valid media bounds. Handle unknown duration before metadata loads. Provide native controls as an accessibility fallback when necessary.

Catch rejected `video.play()` promises, including autoplay denial after a remote PLAY. Show a clear tap-to-start action; once the user enables playback, request and apply the latest room state. Do not silently label a blocked player as synchronized. Handle unsupported fullscreen APIs with a usable fallback.

The optional collapsible playlist contains one active video for this MVP. Keep its data structure extensible; no add/remove/reorder management is required.

## 10. Playback synchronization and ordering

Use Supabase Realtime Broadcast. Both users may request PLAY, PAUSE, and SEEK. The host coordinates authoritative state so concurrent actions have a deterministic order.

Guest controls send requests with unique IDs. The host applies accepted requests and broadcasts the resulting state; its own controls use the same ordering path. Each authoritative event contains at least:

```ts
type PlaybackState = {
  type: 'PLAY' | 'PAUSE' | 'SEEK' | 'SYNC';
  eventId: string;
  sequence: number;
  time: number;
  playing: boolean;
  sentAt: number;
  senderId: string;
};
```

Include enough state for a SEEK while paused or playing to be unambiguous. Reject malformed payloads and ignore duplicate/outdated events. Do not reset sequencing on a host refresh in a way that permanently makes guests ignore new events; introduce an authority epoch or an equivalent recovery mechanism.

Apply remote state without rebroadcast loops. Do not use an arbitrary short timeout as the sole guard for asynchronous media events. Bound event queues, deduplication caches, timers, and pending requests.

On joining, reconnecting, returning from a background tab, or becoming media-ready, request a fresh snapshot from the host. Retry safely if the initial handshake is missed. Do not broadcast a new client's default zero-time state as room authority.

Broadcast does not provide a durable playback log. If the host is offline, retain the last known state, show **Đang chờ chủ phòng kết nối lại**, and disable shared control requests until it returns. Do not delete the room or silently invent a new host. Automatic host election/transfer is outside this MVP. If neither client can restore playback state after a full reload, show that state explicitly rather than claiming to recover it.

## 11. Drift correction and buffering

The host broadcasts SYNC approximately every 3 seconds. Estimate host clock offset/round-trip latency during the handshake instead of assuming `Date.now()` is identical on both devices. Project host playback time only when the host is actually advancing, and clamp estimates to valid bounds.

- Drift below 300 ms: no correction.
- Drift from 300 to 1000 ms: adjust playback rate slightly, for example 0.97–1.03.
- Drift above 1000 ms: seek to estimated host time.

Return playback rate to 1 after correction, on pause, and during cleanup. Do not continuously seek. A paused player does not need playback-rate correction; align paused time when necessary.

Distinguish requested playing state from actual buffering/advancement. Do not extrapolate through host buffering. A buffering guest resynchronizes when ready without forcing both clients into repeated seek loops. Surface prolonged buffering and connection loss clearly.

## 12. Presence, chat, reactions, and cleanup

Presence includes member ID, display name, and joined time. Show host with a crown/label and the other member's online status. Show **Đang kết nối lại...** during reconnect; a temporary disconnect must not destroy the room.

Chat supports plain text, timestamps, history, and reconnect recovery. Fetch missed messages after reconnect and deduplicate by message ID. A retry must not create duplicate persisted messages. Render user content as text, never interpolated HTML. Auto-scroll when the reader is near the bottom or sends a message; preserve their position while reading older messages. Give failed sends a visible retry state.

Reactions: ❤️ 😂 😭 😮 👍. Broadcast them and briefly show floating reactions over the video, including the local reaction exactly once. Validate allowed reactions, throttle rapid clicks, cap concurrent animations, and remove completed elements. Respect reduced motion.

Clean up subscriptions, presence, timers, listeners, pending async work, media, and animation elements when leaving a room. Repeated navigation must not duplicate handlers, messages, or audio. Group online status for multiple tabs of the same identity and ensure only one tab per host identity publishes authoritative SYNC at a time.

## 13. Responsive behavior and accessibility

Verify 390×844, 430×932, a tablet viewport, 1440×900, and 1920 desktop. No horizontal page scrolling. Support safe areas, usable tap targets, mobile chat-sheet scrolling, and fullscreen/landscape behavior.

Provide semantic buttons, accessible form errors, labels for icon controls, visible focus states, readable contrast, reduced motion, and an accessible progress slider. The chat sheet must manage focus and Escape dismissal without trapping the user after it closes. Do not hide focused controls.

Desktop shortcuts: Space toggles playback, Left/Right seek 10 seconds, M mutes, and F toggles fullscreen. Ignore shortcuts in input, textarea, select, and contenteditable elements, or when they conflict with a focused control or modal. Prevent default page scrolling only when handling a shortcut.

## 14. Environment and documentation

Create `.env.example` using Vite names:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

These are browser-visible configuration. Never put a service-role key or Supabase secret key in a `VITE_*` variable or commit secrets. Use `import.meta.env`, not Next.js environment access. R2 playback from a pasted public URL requires no new environment variables or access keys.

Missing Supabase configuration must not break the chooser or house. Cinema should explain that room creation and realtime require setup. Do not simulate multiplayer success as a substitute for a connected backend. Any development-only mock must be explicitly labeled.

Update README with:

- `pnpm install`, `pnpm dev`, and the cinema entry URL.
- Supabase project creation, anonymous sign-in, environment values, migration execution, private Realtime configuration, and access policies.
- How to invite the second person and what happens when anonymous browser identity is lost.
- Owner-managed R2 setup: create a bucket, upload externally with a method suitable for the file size, enable public development access or attach a production custom domain, configure playback CORS, and copy the object URL into Cinema. Do not promise that every manual upload tool supports 2–10 GB; document the chosen method's limits.
- Public media privacy tradeoff, recommended MP4 codecs, media URL/range checks, and how to replace an unavailable source.
- Drive is legacy/experimental and is no longer recommended; retain existing rooms without promising large-file playback.
- Signed playback URL issuance/renewal is future scope, not part of this MVP.
- Honest backend/browser verification status and remaining limitations.

## 15. Implementation organization

Prefer a separate lazy-loaded cinema module with reusable components, for example:

```text
src/cinema/
  Cinema.ts
  routes.ts
  styles.css
  components/
    CreateRoomForm.ts
    JoinRoomForm.ts
    VideoPlayer.ts
    PlayerControls.ts
    ChatPanel.ts
    ReactionBar.ts
    RoomMembers.ts
    Playlist.ts
  video/
    types.ts
    google-drive.ts
    providers.ts
  room/
    repository.ts
    realtime.ts
    playback-sync.ts
  supabase/
    client.ts
supabase/migrations/
```

Adapt filenames to existing conventions. Keep parsing, synchronization decisions, and database access independently testable. Do not introduce React hooks or an unnecessary framework merely to reproduce the original suggested structure.

## 16. Development workflow and validation

First inspect the repository, applicable instructions, the design docs, package scripts, locale/theme code, and current navigation. Write a short implementation plan, preserve good existing work, then implement. Avoid overwriting unrelated user edits. Do not stop at a scaffold or a plan.

Run the existing checks:

```sh
pnpm lint
pnpm test
pnpm build
```

Retain existing tests for legacy Drive parsing, malformed sources, event ordering, drift, and authorization. Add targeted tests only where changed URL/form behavior requires them. Verify security behavior against an actual local or connected Supabase instance where available, including unauthorized reads, cross-room writes, and simultaneous join attempts.

Run the app and verify in a real browser. Use two isolated browser contexts with separate storage/auth identities; two tabs sharing one session do not prove two-member behavior.

Required flow:

1. Homepage opens; **Đi xem phim** reaches the cinema landing.
2. A creates a room with a known playable direct video URL.
3. A copies an invitation; B opens it and joins with a distinct identity.
4. Player renders; both A and B can initiate play/pause/seek and the other follows.
5. Check paused seeks, quick/concurrent actions, drift, and no event loops.
6. Chat and reactions arrive in both directions exactly once.
7. Refresh B, interrupt its connection, and return from a background tab; recover membership, messages, and playback state.
8. Temporarily disconnect/reload A; show the host-waiting state and recover when it returns.
9. A third identity cannot enter; an invalid invitation cannot access room data or its realtime channel.
10. Check autoplay denial, invalid/unavailable media, source retry UI, and legacy Drive room error handling.
11. Check 390×844 and 1440×900 at minimum, both themes and locales; inspect screenshots and browser console. Cover the other target widths before declaring responsive validation complete.
12. Browser Back/Forward, direct URLs, and refresh work; **Vô nhà**, books/Escape, and chooser navigation still work.
13. Verify the chooser/cinema do not load the Three.js house module, and repeated room navigation leaves no duplicate subscriptions.
14. With a real R2 video URL, repeat two-user playback, pause, late-film seek, chat, and reactions; inspect byte-range network responses. Keep the MDN sample URL as an independent regression check. Report long-film/R2 verification separately if the source is unavailable.

Capture screenshots under `output/playwright/` and visually inspect them. Keep lint, automated tests, build, UI checks, and real multiplayer checks distinct in the report. Without working Supabase configuration, complete independent UI/build work and clearly report live two-user verification as pending. Do not claim synchronization works solely because a mock or a single browser passed.

Do not deploy or provision paid services as part of this implementation request.

## 17. Completion report

Report concisely: implemented screens/features; how cinema integrates with the existing website; key files and architectural decisions; Supabase setup and existing environment variables; owner-managed R2 setup and public-media limitations; whether a migration or dependency change was actually needed; local commands; actual lint/test/build/browser/two-user results; and remaining TODOs.

## Technical references

- [Supabase anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous).
- [Supabase Realtime authorization](https://supabase.com/docs/guides/realtime/authorization).
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).
- [Cloudflare R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).
- [Cloudflare R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/).
- [Cloudflare R2 upload methods and limits](https://developers.cloudflare.com/r2/objects/upload-objects/).
- [Browser autoplay behavior](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
