# Milk Cinema backend

The Vite frontend connects directly to Supabase Auth, Postgres RPCs, and private Realtime channels. No video content passes through this backend.

## Local development

Install/start Docker or OrbStack, then run from this repository:

```sh
supabase start
supabase status
```

The initial startup applies `migrations/202610030001_cinema.sql`. Anonymous sign-ins are enabled in `config.toml`. Copy only the API URL and **Publishable key** into the ignored `.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key from supabase status>
```

Restart Vite after changing environment configuration. Studio runs at `http://127.0.0.1:54323`. Local rooms are not accessible from the public internet. Never use a secret/service-role key in frontend configuration.

```sh
pnpm test:cinema:backend
supabase db lint --local --level error
supabase stop
```

The backend verification script creates anonymous test identities and rooms in the configured project, checks atomic capacity, invitations, idempotency, RLS boundaries, and private broadcast. Run it against a development project. It intentionally does not delete rooms via a privileged frontend credential. `supabase stop` preserves local data; `supabase db reset` destroys local database data and should only be used intentionally.

## Hosted Supabase

1. Create or select your development Supabase project.
2. Enable **Authentication → Providers → Anonymous Sign-Ins**. Configure appropriate anonymous-sign-in rate limits/CAPTCHA before public use.
3. Apply `migrations/202610030001_cinema.sql` in the SQL editor, or link the intended project with `supabase link --project-ref <project-ref>` and apply with `supabase db push` after reviewing the target.
4. In Realtime settings, disable **Allow public access**. The app itself only subscribes to private channels; the migration adds membership policies for Broadcast and Presence on `realtime.messages`.
5. Copy the project URL and publishable API key to Vite configuration and restart/rebuild the frontend.
6. Verify two browsers on the deployed frontend using a direct media URL accessible to both.

If your existing project already has permissive policies on `realtime.messages`, review them: permissive policies combine with OR and can bypass room isolation. This migration does not remove unrelated project policies. Prefer a dedicated project or align all policies before deployment.

## Access model

Tables are prefixed `cinema_` to avoid collisions with other parts of the website. RLS allows room members to read their room/members/messages. Direct table mutations are revoked from browser roles. Creation, joining, invitation rotation, and chat use restricted `SECURITY DEFINER` functions with empty search paths and qualified objects.

The short code is a label. Invitations use 192-bit random secrets whose SHA-256 digests live in a non-exposed `milk_private` schema. Joining serializes on the room row and admits at most two distinct auth identities. Existing identities can rejoin without consuming a seat. Invitation rotation is host-only and invalidates earlier unused links; it does not revoke existing membership. A guest never receives the digest or a newly generated invitation.

Chat messages derive their member/name server-side, validate room membership, limit length, throttle sends, and use a caller UUID as an idempotency key. A trigger broadcasts persisted chat changes to the room's private channel. Clients fetch authorized history rather than trusting arbitrary chat broadcast payloads.

Create limits are per identity per hour; join limits are per identity per minute. Anonymous sign-in abuse must also be controlled at Supabase Auth/project ingress, since per-user limits alone do not stop creation of new identities.

Playback and reactions are cooperative ephemeral events between the two admitted members. The frontend chooses one host tab as the playback authority; client broadcast payloads are not cryptographically attributed to individual members. This MVP does not promise protection from a malicious already-admitted participant spoofing playback/presence. Do not treat these payloads as database authorization or implement security-sensitive host-only operations from them.

There is no automatic host transfer, member eviction, or room expiry. Temporary disconnection preserves membership. Losing anonymous browser storage loses the identity; a full room does not automatically free a seat for a new identity. Room cleanup and identity recovery require a later product decision or administrative action.
