create table public.cinema_movies (
  id uuid primary key default gen_random_uuid(),
  position integer not null unique,
  title text not null,
  video_url text not null unique
);
insert into public.cinema_movies(position,title,video_url) values
  (1,'Phim 01','https://pub-492f9b31f90744b0911a075de7ba931e.r2.dev/movies/c31893a1-aac9-430c-99d3-25df52d6dcb6/1393416545880003_001_1080p.mp4'),
  (2,'Phim 02','https://pub-492f9b31f90744b0911a075de7ba931e.r2.dev/movies/87b76165-59f4-4306-aaa0-6065d515eef5/1447802070009834_001_1038p.mp4');
alter table public.cinema_rooms add column video_revision bigint not null default 0;
alter table public.cinema_movies enable row level security;
revoke all on public.cinema_movies from public,anon,authenticated;
grant select on public.cinema_movies to authenticated;
create function public.cinema_shared_member() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from milk_private.shared_cinema c join public.cinema_members m on m.room_id=c.room_id where m.user_id=auth.uid());
$$;
revoke all on function public.cinema_shared_member() from public,anon;
grant execute on function public.cinema_shared_member() to authenticated;
create policy cinema_movies_read on public.cinema_movies for select to authenticated using (public.cinema_shared_member());

create function public.cinema_select_movie(p_movie uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.cinema_rooms; movie public.cinema_movies; v_room_id uuid;
begin
  select c.room_id into v_room_id from milk_private.shared_cinema c where id for update;
  if not exists(select 1 from public.cinema_members m where m.room_id=v_room_id and m.user_id=auth.uid()) then raise exception 'Unauthorized'; end if;
  select * into movie from public.cinema_movies where id=p_movie;
  if movie.id is null then raise exception 'invalidMovie'; end if;
  select * into r from public.cinema_rooms where id=v_room_id for update;
  if r.video_url=movie.video_url then return to_jsonb(r); end if;
  update public.cinema_rooms set video_url=movie.video_url,video_provider='direct',video_file_id=null,video_revision=video_revision+1 where id=r.id returning * into r;
  update milk_private.shared_cinema set video_url=movie.video_url where id;
  return to_jsonb(r);
end $$;
revoke all on function public.cinema_select_movie(uuid) from public,anon;
grant execute on function public.cinema_select_movie(uuid) to authenticated;

create function milk_private.broadcast_movie() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.video_revision<>old.video_revision then
    perform realtime.send(jsonb_build_object('revision',new.video_revision),'movie','cinema:'||new.id::text,true);
  end if;
  return new;
end $$;
create trigger cinema_movie_broadcast after update of video_revision on public.cinema_rooms for each row execute function milk_private.broadcast_movie();
