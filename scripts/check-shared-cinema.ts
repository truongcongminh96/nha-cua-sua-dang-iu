import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split('\n').filter(line => line.includes('=')).map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]));
const clients = Array.from({ length: 4 }, () => createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }));
try {
  for (const client of clients) assert.ifError((await client.auth.signInAnonymously()).error);
  const [sua, xiiu, outsider, replacement] = clients;
  const enter = (client: typeof sua, person: string, pin = '300492') => client.rpc('cinema_enter_shared', { p_pin: pin, p_person: person });
  const bad = await enter(outsider, 'Sữa', '000000'); assert.ifError(bad.error); assert.equal(bad.data.error, 'invalidPin');
  const unknown = await enter(outsider, 'Other'); assert.equal(unknown.data.error, 'invalidPerson');
  const rooms = await Promise.all([enter(sua, 'Sữa'), enter(xiiu, 'Xiiu')]);
  for (const result of rooms) { assert.ifError(result.error); assert.ok(!result.data.error); }
  assert.equal(rooms[0].data.id, rooms[1].data.id);
  const roomId = rooms[0].data.id;
  const members = await sua.from('cinema_members').select('*').eq('room_id', roomId); assert.ifError(members.error);
  assert.equal(members.data?.length, 2); assert.deepEqual(members.data!.map(row => row.display_name).sort(), ['Sữa', 'Xiiu']);
  const seat = members.data!.find(row => row.display_name === 'Sữa')!;
  const doubleSeat = await enter(sua, 'Xiiu'); assert.equal(doubleSeat.data.error, 'personLocked');
  const hidden = await outsider.from('cinema_rooms').select('*').eq('id', roomId); assert.equal(hidden.data?.length, 0);
  const chatId = crypto.randomUUID();
  const chat = await sua.rpc('cinema_send_message', { p_room: roomId, p_content: 'Shared cinema verification', p_id: chatId }); assert.ifError(chat.error);
  const moved = await enter(replacement, 'Sữa'); assert.ifError(moved.error); assert.ok(!moved.data.error);
  const after = await replacement.from('cinema_members').select('*').eq('room_id', roomId); assert.equal(after.data?.length, 2);
  assert.equal(after.data!.find(row => row.display_name === 'Sữa')!.id, seat.id);
  const oldAccess = await sua.from('cinema_rooms').select('*').eq('id', roomId); assert.equal(oldAccess.data?.length, 0);
  const oldWrite = await sua.rpc('cinema_send_message', { p_room: roomId, p_content: 'Old session', p_id: crypto.randomUUID() }); assert.ok(oldWrite.error);
  const history = await replacement.from('cinema_messages').select('id').eq('id', chatId); assert.equal(history.data?.length, 1);
  const again = await enter(replacement, 'Sữa'); assert.equal(again.data.id, roomId);
  for (let i = 0; i < 9; i++) await enter(outsider, 'Sữa', '000000');
  const limited = await enter(outsider, 'Sữa'); assert.equal(limited.data.error, 'rateLimit');
  const catalog = await replacement.from('cinema_movies').select('*').order('position'); assert.ifError(catalog.error); assert.equal(catalog.data?.length, 2);
  const hiddenCatalog = await outsider.from('cinema_movies').select('*'); assert.equal(hiddenCatalog.data?.length, 0);
  const forbiddenMovie = await outsider.rpc('cinema_select_movie', { p_movie: catalog.data![1].id }); assert.ok(forbiddenMovie.error);
  const invalidMovie = await replacement.rpc('cinema_select_movie', { p_movie: crypto.randomUUID() }); assert.ok(invalidMovie.error);
  const second = await replacement.rpc('cinema_select_movie', { p_movie: catalog.data![1].id }); assert.ifError(second.error); assert.equal(second.data.video_url, catalog.data![1].video_url);
  const otherView = await xiiu.from('cinema_rooms').select('*').eq('id', roomId).single(); assert.equal(otherView.data?.video_revision, second.data.video_revision); assert.equal(otherView.data?.video_url, second.data.video_url);
  const same = await xiiu.rpc('cinema_select_movie', { p_movie: catalog.data![1].id }); assert.ifError(same.error); assert.equal(same.data.video_revision, second.data.video_revision);
  const first = await xiiu.rpc('cinema_select_movie', { p_movie: catalog.data![0].id }); assert.ifError(first.error); assert.equal(first.data.video_revision, second.data.video_revision + 1);
  console.log('PASS: server-side code, fixed names, atomic shared room, two stable seats, session replacement, preserved chat, RLS denial attempt limit, private two-film catalog and shared movie selection.');
} finally { for (const client of clients) await client.removeAllChannels(); }
