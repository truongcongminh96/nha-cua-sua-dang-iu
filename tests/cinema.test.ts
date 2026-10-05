import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDriveId } from '../src/cinema/video/google-drive';
import { parseSource } from '../src/cinema/video/providers';
import { correction, projectedTime, EventOrder, isState, type PlaybackState } from '../src/cinema/room/playback-sync';
const state = (sequence = 1, epoch = 'host-session'): PlaybackState => ({ type: 'SYNC', eventId: 'event', sequence, epoch, time: 20, playing: true, advancing: true, sentAt: 1000, senderId: 'host' });
test('Drive parser accepts known forms and rejects spoofed hosts or non-file URLs', () => {
  const id = 'abc123_DEF456789';
  for (const url of [`https://drive.google.com/file/d/${id}/view?usp=sharing`, `https://drive.google.com/open?id=${id}`, `https://drive.google.com/uc?export=download&id=${id}`]) assert.equal(parseDriveId(url),id);
  for (const url of [`https://drive.google.com.evil.test/file/d/${id}/view`, `https://example.test/?id=${id}`, 'https://drive.google.com/drive/folders/123', 'https://drive.google.com/open?id=x', 'javascript:alert(1)']) assert.throws(() => parseDriveId(url));
});
test('video URL validation allows signed media and local fixtures but rejects insecure or executable sources', () => {
  assert.equal(parseSource('https://cdn.test/play?token=123','direct').provider,'direct');
  assert.equal(parseSource('http://localhost:5173/movie.webm','direct').provider,'direct');
  for (const url of ['javascript:alert(1)', 'http://example.test/video.mp4', 'https://user:password@cdn.test/movie.mp4', 'not-a-url']) assert.throws(() => parseSource(url,'direct'));
});
test('drift correction respects boundaries and does not use rate correction while paused', () => {
  assert.deepEqual(correction(10,10.299,true),{rate:1});
  assert.deepEqual(correction(0,.3,true),{rate:1.03});
  assert.deepEqual(correction(10,9.5,true),{rate:.97});
  assert.deepEqual(correction(0,1,true),{rate:1.03});
  assert.deepEqual(correction(0,1.001,true),{seek:1.001,rate:1});
  assert.deepEqual(correction(10,10.5,false),{seek:10.5,rate:1});
});
test('projection uses clock offset and freezes during pause or host buffering', () => {
  assert.equal(projectedTime(state(),2000,500,100),21.5);
  assert.equal(projectedTime({...state(),advancing:false},2000,500,100),20);
  assert.equal(projectedTime({...state(),playing:false},2000,500,100),20);
  assert.equal(projectedTime(state(),2000,500,21),21);
});
test('ordered events reject replay and old authority epochs while allowing host recovery', () => {
  const order = new EventOrder(); assert.equal(order.accept(state()),true);
  assert.equal(order.accept(state()),false); assert.equal(order.accept(state(0)),false);
  assert.equal(order.accept(state(2)),true); assert.equal(order.accept(state(1,'reconnected')),true);
  assert.equal(order.accept(state(10)),false);
});
test('remote state parser rejects invalid timestamps, types, sequences and seek positions', () => {
  assert.equal(isState(state()),true);
  for (const s of [null,{}, {...state(),time:NaN}, {...state(),sequence:1.5}, {...state(),time:-1}, {...state(),sentAt:Infinity}, {...state(),playing:'true'}, {...state(),type:'UNKNOWN'}]) assert.equal(isState(s),false);
});
