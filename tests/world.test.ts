import assert from 'node:assert/strict';
import { test } from 'node:test';
import { affordances, navigationLinks, pets } from '../src/data/environment';
import { quotes, books } from '../src/data/quotes';
import { Discovery, discoveries, localDate, type LocalStore } from '../src/systems/Discovery';
import { Navigation } from '../src/pet/Navigation';
import { PetBehavior, seededRandom } from '../src/pet/PetBehavior';
import { initialTimeMode, localTimeMode } from '../src/systems/TimeOfDay';
import { AssetCache } from '../src/systems/Assets';

test('all furniture destinations are reachable, including a safe route home', () => {
  const nav = new Navigation(affordances, navigationLinks);
  for (const from of affordances) for (const to of affordances) {
    if (from.id === to.id) continue;
    const route = nav.route(from.id, to.id);
    assert.ok(route.length, `${from.id} must reach ${to.id}`);
    assert.equal(route.at(-1)!.target.id, to.id);
  }
  for (const link of navigationLinks.filter(l => l.motion === 'glide')) {
    const start = nav.nodes.get(link.from)!, end = nav.nodes.get(link.to)!;
    assert.ok(start.position[1] > end.position[1], 'Gliders descend; they do not fly upwards.');
    assert.ok(end.capabilities.includes('landable'), 'Every glide needs a soft or safe landing.');
  }
  assert.ok(pets.every(p => nav.nodes.has(p.start)));
});

test('the book and discovery catalog has no missing references or duplicate identities', () => {
  assert.equal(books.length, 5); assert.ok(quotes.length >= 12); assert.equal(discoveries.length, 12);
  for (const list of [quotes, books, affordances, discoveries]) assert.equal(new Set(list.map(x => x.id)).size, list.length);
  for (const book of books) for (const quote of book.quotes) assert.ok(quotes.some(q => q.id === quote));
  assert.equal(new Set(quotes.map(q => q.category)).size, 6);
});

test('behavior respects affordances, prefers daytime rest, and responds to user interest', () => {
  const run = (time: 'day' | 'night', interest?: string) => {
    const behavior = new PetBehavior(seededRandom(123));
    let sleeps = 0, interests = 0;
    for (let i = 0; i < 2000; i++) {
      const choice = behavior.choose(affordances, { time, rain: false, current: 'rug', previous: 'idle', userInterest: interest });
      if (choice.state === 'sleep') { assert.ok(choice.target.capabilities.includes('sleepable')); sleeps++; }
      if (choice.state === 'eat') assert.ok(choice.target.capabilities.includes('eatable'));
      if (choice.target.id === 'plant') interests++;
      assert.ok(choice.duration >= 5);
    }
    return { sleeps, interests };
  };
  assert.ok(run('day').sleeps > run('night').sleeps * 2);
  assert.ok(run('day', 'plant').interests > run('day').interests * 3);
});

test('discoveries deduplicate, persist, sanitize malformed data, and roll over at local midnight', () => {
  const map = new Map<string, string>(); const store: LocalStore = { getItem: k => map.get(k) ?? null, setItem: (k, v) => { map.set(k, v); } };
  let date = '2026-09-11'; const journal = new Discovery(store, () => {}, () => date);
  assert.equal(journal.record('slow-days'), true); assert.equal(journal.record('slow-days'), false);
  assert.equal(journal.record('made-up'), false); assert.equal(journal.count, 1);
  assert.equal(new Discovery(store, () => {}, () => date).count, 1);
  date = '2026-09-12'; assert.equal(journal.count, 0); journal.record('pet-glide');
  assert.equal(new Discovery(store, () => {}, () => date).count, 1);
  map.set('sua-bea.moments.v1', '{broken'); assert.doesNotThrow(() => new Discovery(store, () => {}));
  map.set('sua-bea.moments.v1', JSON.stringify({ date, ids: ['slow-days', 'slow-days', null, 'bad'] }));
  assert.equal(new Discovery(store, () => {}, () => date).count, 1);
});

test('blocked browser storage never prevents exploration', () => {
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('quota'); } };
  const journal = new Discovery(blocked, () => {}); assert.equal(journal.persistent, false);
  assert.doesNotThrow(() => journal.record('pet-glide')); assert.equal(journal.count, 1);
});

test('time selection respects the local clock boundaries', () => {
  assert.equal(localTimeMode(5), 'night'); assert.equal(localTimeMode(6), 'day');
  assert.equal(localTimeMode(15), 'day'); assert.equal(localTimeMode(16), 'golden'); assert.equal(localTimeMode(18), 'night');
  assert.equal(localDate(new Date(2026, 8, 11, 0, 1)), '2026-09-11');
});

test('the dark site theme opens the house at night', () => {
  assert.equal(initialTimeMode('dark', 10), 'night');
  assert.equal(initialTimeMode('light', 10), 'day'); assert.equal(initialTimeMode('light', 20), 'night');
});

test('asset requests deduplicate and a failed request can be retried', async () => {
  const cache = new AssetCache<string>(); let calls = 0;
  const loader = async () => { calls++; return 'loaded'; };
  assert.deepEqual(await Promise.all([cache.get('a', loader), cache.get('a', loader)]), ['loaded', 'loaded']); assert.equal(calls, 1);
  await assert.rejects(cache.get('b', async () => { throw new Error('temporary'); }));
  assert.equal(await cache.get('b', loader), 'loaded'); assert.equal(calls, 2);
});
