import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLocale, onLocaleChange, setLocale, t, vietnamese } from '../src/data/i18n';
import { books, quotes } from '../src/data/quotes';
import { discoveries } from '../src/systems/Discovery';
import { stateLabels } from '../src/pet/Pet';

test('language changes persist independently of discoveries and can be switched back', () => {
  const data = new Map<string, string>([['sua-bea.moments.v1', 'existing discoveries']]);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) } });
  setLocale('zh'); let changes = 0; const stop = onLocaleChange(() => changes++);
  setLocale('vi'); assert.equal(getLocale(), 'vi'); assert.equal(t('慢慢来'), 'Cứ chậm thôi');
  assert.equal(data.get('sua-bea.locale.v1'), 'vi'); assert.equal(data.get('sua-bea.moments.v1'), 'existing discoveries');
  setLocale('vi'); assert.equal(changes, 1);
  setLocale('zh'); assert.equal(t('慢慢来'), '慢慢来'); assert.equal(changes, 2);
  stop(); setLocale('vi'); assert.equal(changes, 2);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: () => { throw new Error('Storage disabled'); } });
  assert.doesNotThrow(() => setLocale('zh')); assert.equal(getLocale(), 'zh');
});

test('both languages cover every quote, book, discovery, and pet state', () => {
  for (const quote of quotes) { assert.ok(quote.zh.trim()); assert.ok(quote.vi.trim()); assert.ok(!/\p{Script=Han}/u.test(quote.vi)); assert.equal(quote.vi.split('\n').length, 2); }
  const labels = [...books.map(b => b.title), ...discoveries.flatMap(d => [d.label, d.hint]), ...Object.values(stateLabels)];
  for (const label of labels) { assert.ok(vietnamese[label], `Missing translation: ${label}`); assert.ok(!/\p{Script=Han}/u.test(vietnamese[label])); }
});
