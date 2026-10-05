import { supabase, identity } from '../supabase/client';
import type { VideoSource } from '../video/providers';
export interface Room { id: string; code: string; name: string; video_provider: 'direct' | 'google-drive'; video_url: string; video_file_id: string | null; video_revision?: number; host_id: string }
export interface Member { id: string; room_id: string; user_id: string; display_name: string; joined_at: string }
export interface Message { id: string; member_id: string; display_name: string; content: string; created_at: string }
function client() { if (!supabase) throw new Error('setup'); return supabase; }
export function roomSource(room: Room): VideoSource {
  return room.video_provider === 'direct' ? { provider: 'direct', url: room.video_url } : { provider: 'google-drive', fileId: room.video_file_id!, originalUrl: room.video_url };
}
export async function createRoom(name: string, displayName: string, source: VideoSource): Promise<{ room: Room; invite_secret: string }> {
  await identity();
  const { data, error } = await client().rpc('cinema_create_room', { p_name: name.trim(), p_display_name: displayName.trim(), p_provider: source.provider, p_url: source.provider === 'direct' ? source.url : source.originalUrl, p_file_id: source.provider === 'google-drive' ? source.fileId : null });
  if (error) throw error;
  return data;
}
export async function joinRoom(code: string, secret: string, displayName: string): Promise<Room> {
  await identity();
  const { data, error } = await client().rpc('cinema_join_room', { p_code: code.toUpperCase(), p_secret: secret, p_display_name: displayName.trim() });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
export async function loadRoom(code: string): Promise<{ room: Room; members: Member[]; userId: string }> {
  const userId = await identity();
  const { data: room, error } = await client().from('cinema_rooms').select('*').eq('code', code.toUpperCase()).maybeSingle();
  if (error) throw error;
  if (!room) throw new Error('roomMissing');
  const members = await client().from('cinema_members').select('*').eq('room_id', room.id).order('joined_at');
  if (members.error) throw members.error;
  return { room, members: members.data, userId };
}
export async function history(roomId: string): Promise<Message[]> {
  const { data, error } = await client().from('cinema_messages').select('id,member_id,display_name,content,created_at').eq('room_id', roomId).order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data.reverse();
}
export async function sendMessage(roomId: string, content: string, id: string): Promise<Message> {
  const { data, error } = await client().rpc('cinema_send_message', { p_room: roomId, p_content: content.trim(), p_id: id });
  if (error) throw error;
  return data;
}
export async function inviteSecret(roomId: string): Promise<string> {
  const { data, error } = await client().rpc('cinema_rotate_invite', { p_room: roomId });
  if (error) throw error;
  return data;
}

export async function enterSharedRoom(pin: string, person: string) {
  const userId = await identity();
  const { data, error } = await client().rpc('cinema_enter_shared', { p_pin: pin, p_person: person });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  const loaded = await loadRoom(data.code);
  return { ...loaded, userId };
}

export interface Movie { id: string; position: number; title: string; video_url: string }
export async function movies(): Promise<Movie[]> {
  const { data, error } = await client().from('cinema_movies').select('*').order('position');
  if (error) throw error;
  return data;
}
export async function selectMovie(id: string): Promise<Room> {
  const { data, error } = await client().rpc('cinema_select_movie', { p_movie: id });
  if (error) throw error;
  return data;
}
