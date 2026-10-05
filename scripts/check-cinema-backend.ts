import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(x => x.includes('=')).map(x => [x.slice(0,x.indexOf('=')),x.slice(x.indexOf('=')+1)]));
const clients = Array.from({length:4},() => createClient(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}}));
async function run() {
  for (const client of clients) { const auth=await client.auth.signInAnonymously(); assert.ifError(auth.error); }
  const [host,guest,other,outsider] = clients;
  const created = await host.rpc('cinema_create_room',{p_name:'Backend verification',p_display_name:'Host',p_provider:'direct',p_url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',p_file_id:null});
  assert.ifError(created.error); const {room,invite_secret:secret}=created.data;
  const hidden=await outsider.from('cinema_rooms').select('*').eq('id',room.id); assert.ifError(hidden.error); assert.equal(hidden.data?.length,0);
  const bad=await outsider.rpc('cinema_join_room',{p_code:room.code,p_secret:'0'.repeat(48),p_display_name:'Invalid'}); assert.ifError(bad.error); assert.equal(bad.data.error,'invalidInvite');
  const results=await Promise.all([guest,other].map((client,i) => client.rpc('cinema_join_room',{p_code:room.code,p_secret:secret,p_display_name:`Guest ${i}`})));
  assert.equal(results.filter(x => !x.error&&!x.data.error).length,1); assert.equal(results.filter(x => x.data?.error==='roomFull').length,1);
  const admitted=results[0].data?.error ? other : guest;
  const count=await host.from('cinema_members').select('*').eq('room_id',room.id); assert.equal(count.data?.length,2);
  const rejoin=await admitted.rpc('cinema_join_room',{p_code:room.code,p_secret:'',p_display_name:'Again'}); assert.ifError(rejoin.error); assert.equal(rejoin.data.id,room.id);
  const member=count.data!.find(m=>m.user_id!==(created.data.room.host_id));
  const direct=await outsider.from('cinema_members').insert({room_id:room.id,user_id:(await outsider.auth.getUser()).data.user!.id,display_name:'Intruder'}); assert.ok(direct.error);
  const spoof=await admitted.from('cinema_rooms').update({host_id:member.user_id}).eq('id',room.id); assert.ok(spoof.error);
  const messageId=crypto.randomUUID();
  const msg=await admitted.rpc('cinema_send_message',{p_room:room.id,p_content:'A persisted message <script>',p_id:messageId}); assert.ifError(msg.error);
  const retry=await admitted.rpc('cinema_send_message',{p_room:room.id,p_content:'A persisted message <script>',p_id:messageId}); assert.ifError(retry.error); assert.equal(retry.data.id,msg.data.id);
  const blocked=await outsider.rpc('cinema_send_message',{p_room:room.id,p_content:'Forbidden',p_id:crypto.randomUUID()}); assert.ok(blocked.error);
  const rows=await host.from('cinema_messages').select('*').eq('room_id',room.id); assert.equal(rows.data?.length,1);
  const cross=await outsider.from('cinema_messages').select('*').eq('room_id',room.id); assert.equal(cross.data?.length,0);
  const hc=host.channel(`cinema:${room.id}`,{config:{private:true}}); const gc=admitted.channel(`cinema:${room.id}`,{config:{private:true}});
  let received=false; gc.on('broadcast',{event:'verification'},()=>{received=true;});
  for (const [client,channel] of [[host,hc],[admitted,gc]] as const) {
    await client.realtime.setAuth();
    await new Promise<void>((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Realtime subscribe timeout')),10000);channel.subscribe(status=>{if(status==='SUBSCRIBED'){clearTimeout(timeout);resolve();}else if(status==='CHANNEL_ERROR'){clearTimeout(timeout);reject(new Error('Realtime authorization failed'));}});});
  }
  await hc.send({type:'broadcast',event:'verification',payload:{ok:true}});
  for(let i=0;i<30&&!received;i++) await new Promise(r=>setTimeout(r,100));
  assert.ok(received,'private broadcast delivered to authorized member');
  const denied=outsider.channel(`cinema:${room.id}`,{config:{private:true}});
  await outsider.realtime.setAuth();
  await new Promise<void>((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Unauthorized channel did not return an authorization error')),10000);denied.subscribe((status)=>{if(status==='CHANNEL_ERROR'){clearTimeout(timeout);resolve();}else if(status==='SUBSCRIBED'){clearTimeout(timeout);reject(new Error('Unauthorized user subscribed to private room'));}});});
  console.log('PASS: private rooms, invalid invite, atomic two-seat join, idempotent rejoin/chat, RLS read/write boundaries, host protection, private Realtime broadcast.');
}
try { await run(); } finally { for(const client of clients) await client.removeAllChannels(); }
