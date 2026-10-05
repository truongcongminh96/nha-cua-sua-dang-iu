create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists milk_private;
revoke all on schema milk_private from public, anon, authenticated;

create table public.cinema_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z2-9]{4,8}$'),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  video_provider text not null check (video_provider in ('direct','google-drive')),
  video_url text not null check (char_length(video_url) between 1 and 4096),
  video_file_id text,
  host_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  check ((video_provider='direct' and video_file_id is null) or (video_provider='google-drive' and video_file_id ~ '^[A-Za-z0-9_-]{10,200}$'))
);
create table public.cinema_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.cinema_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 40),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(room_id,user_id), unique(id,room_id)
);
create table public.cinema_messages (
  id uuid primary key,
  room_id uuid not null references public.cinema_rooms(id) on delete cascade,
  member_id uuid not null,
  display_name text not null,
  content text not null check (char_length(btrim(content)) between 1 and 1000),
  created_at timestamptz not null default now(),
  foreign key(member_id,room_id) references public.cinema_members(id,room_id) on delete cascade
);
create index cinema_messages_history on public.cinema_messages(room_id,created_at);
create index cinema_members_user on public.cinema_members(user_id,room_id);
create table milk_private.invites (room_id uuid primary key references public.cinema_rooms(id) on delete cascade, digest bytea not null);
create table milk_private.join_limits (user_id uuid primary key references auth.users(id) on delete cascade, started_at timestamptz not null, attempts integer not null);

create function public.cinema_is_member(p_room uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.cinema_members where room_id=p_room and user_id=(select auth.uid()));
$$;
revoke all on function public.cinema_is_member(uuid) from public,anon;
grant execute on function public.cinema_is_member(uuid) to authenticated;
alter table public.cinema_rooms enable row level security;
alter table public.cinema_members enable row level security;
alter table public.cinema_messages enable row level security;
revoke all on public.cinema_rooms,public.cinema_members,public.cinema_messages from anon,authenticated;
grant select on public.cinema_rooms,public.cinema_members,public.cinema_messages to authenticated;
create policy cinema_room_read on public.cinema_rooms for select to authenticated using (public.cinema_is_member(id));
create policy cinema_member_read on public.cinema_members for select to authenticated using (public.cinema_is_member(room_id));
create policy cinema_message_read on public.cinema_messages for select to authenticated using (public.cinema_is_member(room_id));

create function public.cinema_create_room(p_name text,p_display_name text,p_provider text,p_url text,p_file_id text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.cinema_rooms; secret text; code text; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Unauthorized'; end if;
  if char_length(btrim(p_name)) not between 1 and 100 or char_length(btrim(p_display_name)) not between 1 and 40 or p_name is null or p_display_name is null then raise exception 'invalidName'; end if;
  if p_url is null or char_length(p_url)>4096 or p_url !~ '^https://[^/@[:space:]]+([/:?#]|$)|^http://(localhost|127\.0\.0\.1|\[::1\])(:[0-9]+)?/' then raise exception 'invalidUrl'; end if;
  if p_provider='google-drive' and (p_url !~ '^https://drive\.google\.com/' or p_file_id is null or p_file_id !~ '^[A-Za-z0-9_-]{10,200}$') then raise exception 'invalidDrive'; end if;
  -- Serialize create attempts from one identity.
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  if (select count(*) from public.cinema_rooms where host_id=uid and created_at>now()-interval '1 hour')>=10 then raise exception 'rateLimit'; end if;
  secret := encode(extensions.gen_random_bytes(24),'hex');
  for attempt in 1..20 loop
    code := '';
    for digit in 1..6 loop code := code || substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',1+get_byte(extensions.gen_random_bytes(1),0)%32,1); end loop;
    begin
      insert into public.cinema_rooms(code,name,video_provider,video_url,video_file_id,host_id) values(code,btrim(p_name),p_provider,p_url,p_file_id,uid) returning * into r;
      exit;
    exception when unique_violation then
      if attempt=20 then raise exception 'connectionError'; end if;
    end;
  end loop;
  insert into public.cinema_members(room_id,user_id,display_name) values(r.id,uid,btrim(p_display_name));
  insert into milk_private.invites values(r.id,extensions.digest(secret,'sha256'));
  return jsonb_build_object('room',to_jsonb(r),'invite_secret',secret);
end $$;

create function public.cinema_join_room(p_code text,p_secret text,p_display_name text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.cinema_rooms; uid uuid := auth.uid(); n integer;
begin
  if uid is null then raise exception 'Unauthorized'; end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 40 then raise exception 'invalidName'; end if;
  insert into milk_private.join_limits values(uid,now(),1) on conflict(user_id) do update set
    attempts=case when milk_private.join_limits.started_at<now()-interval '1 minute' then 1 else milk_private.join_limits.attempts+1 end,
    started_at=case when milk_private.join_limits.started_at<now()-interval '1 minute' then now() else milk_private.join_limits.started_at end
    returning attempts into n;
  -- Return errors so failed attempts still commit their rate-limit counter.
  if n>10 then return jsonb_build_object('error','rateLimit'); end if;
  select * into r from public.cinema_rooms where code=upper(p_code) for update;
  if r.id is null then return jsonb_build_object('error','invalidInvite'); end if;
  if exists(select 1 from public.cinema_members where room_id=r.id and user_id=uid) then return to_jsonb(r); end if;
  if p_secret is null or p_secret !~ '^[a-f0-9]{48}$' or not exists(select 1 from milk_private.invites where room_id=r.id and digest=extensions.digest(p_secret,'sha256')) then return jsonb_build_object('error','invalidInvite'); end if;
  if (select count(*) from public.cinema_members where room_id=r.id)>=2 then return jsonb_build_object('error','roomFull'); end if;
  insert into public.cinema_members(room_id,user_id,display_name) values(r.id,uid,btrim(p_display_name));
  return to_jsonb(r);
end $$;

create function public.cinema_rotate_invite(p_room uuid) returns text language plpgsql security definer set search_path='' as $$
declare secret text;
begin
  if not exists(select 1 from public.cinema_rooms where id=p_room and host_id=auth.uid()) then raise exception 'Unauthorized'; end if;
  secret := encode(extensions.gen_random_bytes(24),'hex');
  update milk_private.invites set digest=extensions.digest(secret,'sha256') where room_id=p_room;
  return secret;
end $$;

create function public.cinema_send_message(p_room uuid,p_content text,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.cinema_members; msg public.cinema_messages;
begin
  select * into m from public.cinema_members where room_id=p_room and user_id=auth.uid();
  if m.id is null then raise exception 'Unauthorized'; end if;
  perform pg_advisory_xact_lock(hashtextextended(m.id::text,1));
  select * into msg from public.cinema_messages where id=p_id;
  if msg.id is not null then
    if msg.member_id<>m.id or msg.room_id<>p_room or msg.content<>btrim(p_content) then raise exception 'Unauthorized'; end if;
    return to_jsonb(msg);
  end if;
  if (select count(*) from public.cinema_messages where member_id=m.id and created_at>now()-interval '10 seconds')>=8 then raise exception 'rateLimit'; end if;
  insert into public.cinema_messages(id,room_id,member_id,display_name,content) values(p_id,p_room,m.id,m.display_name,btrim(p_content)) returning * into msg;
  return to_jsonb(msg);
end $$;

revoke all on function public.cinema_create_room(text,text,text,text,text),public.cinema_join_room(text,text,text),public.cinema_rotate_invite(uuid),public.cinema_send_message(uuid,text,uuid) from public,anon;
grant execute on function public.cinema_create_room(text,text,text,text,text),public.cinema_join_room(text,text,text),public.cinema_rotate_invite(uuid),public.cinema_send_message(uuid,text,uuid) to authenticated;

create function public.cinema_channel_member(topic text) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.cinema_members m where 'cinema:'||m.room_id::text=topic and m.user_id=auth.uid());
$$;
revoke all on function public.cinema_channel_member(text) from public,anon;
grant execute on function public.cinema_channel_member(text) to authenticated;
create policy cinema_realtime_read on realtime.messages for select to authenticated using (extension in ('broadcast','presence') and public.cinema_channel_member(realtime.topic()));
create policy cinema_realtime_write on realtime.messages for insert to authenticated with check (extension in ('broadcast','presence') and public.cinema_channel_member(realtime.topic()));

create function milk_private.broadcast_chat() returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform realtime.send(to_jsonb(new),'chat','cinema:'||new.room_id::text,true);
  return new;
end $$;
create trigger cinema_chat_broadcast after insert on public.cinema_messages for each row execute function milk_private.broadcast_chat();
