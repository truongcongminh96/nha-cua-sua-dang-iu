-- One shared cinema, with two stable seats. Media is uploaded outside the app.
create table milk_private.shared_cinema (
  id boolean primary key default true check (id),
  pin_digest bytea not null,
  video_url text not null,
  room_id uuid references public.cinema_rooms(id)
);
revoke all on milk_private.shared_cinema from public, anon, authenticated;
insert into milk_private.shared_cinema(id,pin_digest,video_url) values (
  true, extensions.digest('300492','sha256'),
  'https://pub-492f9b31f90744b0911a075de7ba931e.r2.dev/movies/c31893a1-aac9-430c-99d3-25df52d6dcb6/1393416545880003_001_1080p.mp4'
);

create function public.cinema_enter_shared(p_pin text,p_person text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare cfg milk_private.shared_cinema; r public.cinema_rooms; seat public.cinema_members;
  uid uuid := auth.uid(); n integer;
begin
  if uid is null then raise exception 'Unauthorized'; end if;
  insert into milk_private.join_limits values(uid,now(),1) on conflict(user_id) do update set
    attempts=case when milk_private.join_limits.started_at<now()-interval '1 minute' then 1 else milk_private.join_limits.attempts+1 end,
    started_at=case when milk_private.join_limits.started_at<now()-interval '1 minute' then now() else milk_private.join_limits.started_at end
    returning attempts into n;
  if n>10 then return jsonb_build_object('error','rateLimit'); end if;
  select * into cfg from milk_private.shared_cinema where id for update;
  if p_pin is null or p_pin !~ '^[0-9]{6}$' or cfg.pin_digest<>extensions.digest(p_pin,'sha256') then
    return jsonb_build_object('error','invalidPin');
  end if;
  if p_person is null or p_person not in ('Sữa','Xiiu') then return jsonb_build_object('error','invalidPerson'); end if;
  if cfg.room_id is null then
    insert into public.cinema_rooms(code,name,video_provider,video_url,host_id)
      values('MILK2','Sữa & Xiiu','direct',cfg.video_url,uid) returning * into r;
    update milk_private.shared_cinema set room_id=r.id where id;
  else
    select * into r from public.cinema_rooms where id=cfg.room_id for update;
  end if;
  -- One browser identity cannot occupy both names.
  if exists(select 1 from public.cinema_members where room_id=r.id and user_id=uid and display_name<>p_person) then
    return jsonb_build_object('error','personLocked');
  end if;
  select * into seat from public.cinema_members where room_id=r.id and display_name=p_person for update;
  if seat.id is null then
    if (select count(*) from public.cinema_members where room_id=r.id)>=2 then return jsonb_build_object('error','roomFull'); end if;
    insert into public.cinema_members(room_id,user_id,display_name) values(r.id,uid,p_person);
  elsif seat.user_id<>uid then
    -- Re-entering from another browser replaces that person's previous session.
    -- Keep the seat ID and message history, and move host ownership with the seat.
    if r.host_id=seat.user_id then
      update public.cinema_rooms set host_id=uid where id=r.id;
      r.host_id := uid;
    end if;
    update public.cinema_members set user_id=uid,last_seen_at=now() where id=seat.id;
  end if;
  return to_jsonb(r);
end $$;
revoke all on function public.cinema_enter_shared(text,text) from public,anon;
grant execute on function public.cinema_enter_shared(text,text) to authenticated;
