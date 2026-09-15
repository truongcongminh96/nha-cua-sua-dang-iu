import { t } from '../data/i18n';

// Keep the original copy for static DOM nodes, so switching back never translates a translation.
const textSources = new WeakMap<Node, string>();
const attributeSources = new WeakMap<Element, Map<string, string>>();
export function localize(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest('[data-live-copy]')) continue;
    if (!textSources.has(node)) textSources.set(node, node.textContent ?? '');
    const source = textSources.get(node)!;
    node.textContent = source.replace(/\S[\s\S]*\S|\S/, value => t(value));
  }
  for (const element of [root, ...root.querySelectorAll<HTMLElement>('[aria-label], [title]')]) {
    if (element.closest('[data-live-copy]')) continue;
    const originals = attributeSources.get(element) ?? new Map<string, string>();
    for (const attr of ['aria-label', 'title']) {
      const value = element.getAttribute(attr);
      if (value === null) continue;
      if (!originals.has(attr)) originals.set(attr, value);
      element.setAttribute(attr, t(originals.get(attr)!));
    }
    attributeSources.set(element, originals);
  }
}
