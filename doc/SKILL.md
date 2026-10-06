---
name: ninetails-xuan-paper-ui
description: Use this skill whenever designing, reviewing, or implementing UI for NineTails Workshop or any interface that should feel like its Xuan Paper studio handbook: warm rice paper, ink typography, seal red, Chinese editorial details, restrained motion, and generous whitespace. Apply it for homepage, documentation, navigation, dashboards, content blocks, dark mode, and responsive refinements.
---

# NineTails Xuan Paper UI

> Trong repo Sữa Bea, đọc kèm [README.md](README.md): tranh minh họa được phép có màu, giao diện thì chỉ dùng mực và đỏ triện.

Treat the interface as a living design book for a game design studio. The visual language is quiet editorial luxury: a Song-dynasty catalog translated into a usable documentation product. Every decorative choice should also help orientation, hierarchy, or status.

## Visual foundation

- Use warm paper `#F6F2E9`, deeper paper `#EFEADD`, warm ink `#1C1A17`, and seal red `#B23A2B`.
- Use seal red sparingly for active states, priority marks, small seals, hairline accents, and important actions. Do not turn it into a large surface color.
- Keep borders as 1px hairlines. Avoid drop shadows, glass effects, gradients, and decorative cards.
- Use Fraunces for display and reading prose, Noto Serif SC for Hanzi, Ma Shan Zheng only for large brush watermarks, and IBM Plex Mono for metadata, labels, code, and status.
- Let typography carry personality: very large light H1s, restrained italic emphasis, generous line-height, and compact mono metadata.
- Use Chinese characters as meaningful navigation and identity: chapter numerals, seal glyphs, vertical annotations, and watermarks should encode the content rather than act as random ornament.

## Layout and hierarchy

- Make the hero a clear thesis. Pair a strong editorial headline with a short explanatory lede and one primary action.
- Preserve deliberate empty space, but ensure large desktop gaps still contain a useful signal such as a watermark, current state, date, or index cue.
- Use hairline rows for indexes, chapters, priorities, and previous/next navigation. Hover can shift the row 2–4px and deepen the paper surface.
- Keep documentation reading columns around 64–70ch. Use a paper sidebar and a narrow right rail only when they improve orientation.
- On mobile, protect title readability and tap targets first. Let metadata wrap or move below the title rather than compressing the main label.

## Controls and motion

- Prefer square or lightly rounded controls (`2px` radius) for the catalog language. Reserve pill shapes for an intentionally prominent primary action.
- Keep one motion curve: `cubic-bezier(0.32,0.72,0,1)`, around 400–600ms. Use color, paper-surface changes, and tiny translation; avoid noisy entrance animation.
- Provide visible `:focus-visible` rings in seal red and honor `prefers-reduced-motion`.
- Never make color the only status signal. Pair active/priority color with a glyph, label, border, or position.

## Content and consistency

- Use sentence case for user-facing controls and plain verbs for actions.
- Reserve mono uppercase for metadata and utility navigation so it remains a signal, not wallpaper.
- Keep brand numerology separate from content counts. “NineTails” can remain the identity while chapter counts, stats, and navigation must be generated from the canonical manifest.
- Do not invent chapter-specific accent colors when the Xuan Paper direction is active; use ink plus seal red.

## Review checklist

Before finishing a UI change, inspect light and dark themes at desktop and mobile widths. Check hierarchy, contrast of secondary text, mono-label density, active/focus states, row wrapping, and whether every decorative mark has a navigational or editorial reason. Prefer one memorable signature detail and remove any extra ornament that does not help the reader.
