import assert from 'node:assert/strict';
import { test } from 'node:test';
import { petStatuses, roomStatuses } from '../src/ui/copy';
import { vietnamese } from '../src/data/i18n';
import { UI } from '../src/ui/UI';

test('quiet UI copy covers both locales and every time and pet state', () => {
  const copy = [...Object.values(roomStatuses), ...Object.values(petStatuses),
    '一间小屋', 'Sữa Bea 的小屋', '手记', '打开小屋手记', '关闭面板',
    '今天还没有记录。', '可以翻一本书，或陪 Mochi 待一会儿。', '小小的记录',
    '来坐一会儿吧。', '可以翻一本书，听听雨，或者什么也不做。',
    'Mochi 是这里的小飞鼠室友。白天爱睡觉，晚上喜欢四处逛逛。你离开时，它也会照顾好自己。',
    '在小屋里走走', '也可以直接选择一个物件：', '声音已打开', '声音已关闭', '正在下雨', '雨停了', '晴天'];
  for (const source of copy) {
    assert.ok(vietnamese[source]?.trim(), `Missing Vietnamese UI text: ${source}`);
    assert.ok(!/\p{Script=Han}/u.test(vietnamese[source]), `Untranslated UI text: ${source}`);
  }
  assert.equal(Object.keys(roomStatuses).length, 3);
  assert.equal(Object.keys(petStatuses).length, 11);
});

test('discovery summary supports changed catalog totals and empty days', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const summary = { textContent: '' };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    querySelector(selector: string) { assert.equal(selector, '#discovery-summary'); return summary; },
  } });
  try {
    // Exercise the UI boundary without a GPU or a DOM dependency.
    UI.prototype.setDiscoveries.call({} as UI, 3, 13);
    assert.equal(summary.textContent, '3 / 13');
    UI.prototype.setDiscoveries.call({} as UI, 0, 7);
    assert.equal(summary.textContent, '0 / 7');
  } finally {
    if (original) Object.defineProperty(globalThis, 'document', original);
    else Reflect.deleteProperty(globalThis, 'document');
  }
});
