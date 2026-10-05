# NineTails Workshop — Design Specification v2 — "Xuan Paper" (宣紙)

APPROVED DIRECTION. The living mockup at `design-explorations/a-xuan-paper.html`
(screenshot `a-xuan-paper.png`) is ground truth for mood, spacing, and type.
v1 ("Ink & Foxfire", dark/ember) is retired entirely.

## 1. Concept

Light ink-wash literati minimalism. The site reads like a Song-dynasty museum
catalog: rice paper, sumi ink, one cinnabar seal-red, and 留白 — deliberate
emptiness — doing the work ornament used to do. NineTails is the brand; chapter
count and chapter numerals come from the canonical manifest.

### Palette (exact)
- Paper ground `#F6F2E9`; deeper paper (hover/surfaces) `#EFEADD`
- Ink `#1C1A17`; ink-60 `rgba(28,26,23,.62)`; ink-40 `.50`; ink-12 `.12`; ink-08 `.08`
- Seal red `#B23A2B` — used ONLY small: seal stamps, priority marks, hairline
  accents, hover numerals, 目錄-style labels. Never large fills except seal chips.
- Night ink (code blocks & night pages) `#141210` with paper-toned text `#EFE9DC`.
- No other hues. No per-chapter accent colors — ink + seal only (ignore the
  `accent` field in the manifest).

### Typography
- Display & prose: Fraunces (next/font/google, opsz axis; weights 300–600,
  + italic). H1s huge and light (300) with italic em mixes, tracking -0.02em.
  Body prose Fraunces 400, ~1.06rem, line-height ~2, ink-60 for long reading.
- Hanzi: Noto Serif SC (numerals 〇一二…, labels like 目錄); Ma Shan Zheng for
  large brush watermark glyphs only.
- Meta/labels: IBM Plex Mono, 0.6–0.7rem, uppercase, letter-spacing .2–.34em,
  ink-40.
- Remove Geist entirely.

### Motifs
- Seal stamps: small seal-red squares (2px radius) with white hanzi (九, 印),
  occasionally rotated 2–3°. The brand mark is a 九 seal.
- Giant translucent brush hanzi watermarks (opacity ~0.05) as the only "art":
  狐 on the home hero; a per-chapter glyph on chapter pages
  (〇迎 一基 二狐 三戰 四敵 五境 六進 七story: story→書? use 話 8→法).
  Chapter glyph map: 0 迎, 1 基, 2 狐, 3 戰, 4 敵, 5 境, 6 升, 7 話, 8 法.
- Vertical writing-mode annotations (writing-mode: vertical-rl), e.g.
  九尾工坊 · 設計之書, as quiet page furniture.
- Hairline rules: 1px ink-08/ink-12. No shadows anywhere except the subtle
  film grain overlay (fixed, opacity .05, pointer-events none).
- Priority mark: 0.45rem seal-red square rotated 45° (diamond). Keep the
  PriorityBadge concept but restyle: mono uppercase label + diamond.

## 2. Layout

### Homepage (match the mockup, then extend)
1. Header: 九 seal + "NINETAILS WORKSHOP" letterspaced; nav right: 目錄,
   Glossary, Resources, Search ⌘K. No background, no border.
2. Hero: eyebrow with short seal-red dash; H1 "Nine tails. / *Nine chapters.* /
   One shared craft." with a small rotated 印 seal; giant 狐 watermark right;
   lede paragraph; pill CTA (ink fill, nested circular arrow — arrow chip
   translates on hover) + quiet underlined secondary; stats row (九 / 48 / 16);
   vertical-rl annotation at right edge.
3. 目錄 Table of Contents: full list of all canonical chapters as hairline rows —
   Chinese numeral, title, italic one-line gloss, priority diamond where the
   chapter has priorities, section count + minutes (mono). Hover: deeper paper
   bg + numeral turns seal-red + subtle left padding shift (0.5s
   cubic-bezier(0.32,0.72,0,1)).
4. Role paths ("Begin according to your role"): three quiet columns separated
   by hairlines — New Game Designer / Senior Designer / Producer — mono
   eyebrow, serif title, numbered reading list of real section links.
5. Priorities: "重點 · Current priorities" — compact two/three-column list of
   priority sections, each with seal diamond + chapter numeral.
6. Footer: centered italic aphorism “大巧若拙 — the greatest skill appears
   effortless.” + mono site line.

### Docs layout
- Left sidebar (sticky, ~280px, paper, right hairline): 九 seal brand, search
  trigger (hairline box, mono), chapters grouped under "numeral + title"
  headers, section links ink-60 → ink, active = ink text + seal-red numeral
  tick, priority diamond suffix. Footer links: Glossary · Resources · 內部.
  Mobile: slide-over paper drawer.
- Content column max ~68ch: breadcrumb (mono, "目錄 / 三 · Combat Systems /
  …"), priority mark, Fraunces 300 H1 (large), italic summary lead, mono
  reading-time, hairline, then blocks, then prev/next as two hairline cards
  (numeral + title, hover deeper paper).
- Right rail (xl): 頁內 "On this page" mono TOC from h2s, scroll-spy,
  seal-red active tick. Reading progress: 1px seal-red top bar.
- Chapter overview: giant pale Chinese numeral (typographic watermark ~14rem,
  ink-08) + chapter brush glyph watermark, tagline, hairline section rows
  (like homepage 目錄), then next-chapter card.

### Night pages (lacquer accent, from direction B)
Sections `design-foundations/stylish-combat-showcase` and
`enemies-and-bosses/quynh-tieu-redesign-showcase` render inverted: night ink
ground `#141210`, paper-toned text, seal red unchanged, gold hairline
`rgba(201,162,39,.16)` corner brackets around the article. Implement via a
`night` set in the layout code (not the manifest) toggling CSS vars on the
article container + a full-bleed dark page background. Sidebar stays paper.

## 3. Blocks restyle (same Block model, same content files — DO NOT touch src/content/)
- lead: Fraunces 300 1.35rem italic-leaning, ink.
- p/list: reading prose per type spec; inline `code` = IBM Plex Mono 0.85em in
  a hairline box, paper-deep bg; **bold** = weight 600 ink.
- h2: Fraunces 400 1.9rem with small seal-red 〡 tick or short dash before;
  generous top margin (4rem+). h3: 1.25rem weight 500.
- callout: hairline ink-12 box, paper-deep bg, mono uppercase title with
  variant mark — note ink, tip ink w/ 提示, warning seal-red hairline left
  border, priority = seal diamond + "Design Priority" + seal hairline.
- media placeholder: paper-deep panel, hairline frame INSIDE a second hairline
  (double rule, like mounted scroll art), brush hanzi watermark (畫 for image,
  影 for video, 圖 for diagram), mono label + kind, caption italic below.
- code: night-ink panel, mono, paper-toned text, mono title bar with language;
  hairline gold top rule.
- table: hairline rows only (no vertical rules), mono uppercase small header
  row, ink-60 cells.
- checklist: square hairline boxes, mono-ish items in serif; title mono.
- terms: term in mono seal-red-ish? No — term in IBM Plex Mono ink, definition
  serif ink-60; hairline left rule per row.
- quote: large Fraunces italic, seal-red opening mark, attribution mono.
- cards: hairline boxes, serif titles, hover deeper paper.
- steps: Chinese numerals 一二三… in seal-red, hairline connecting rule.

## 4. Motion
One easing everywhere: cubic-bezier(0.32,0.72,0,1), 0.4–0.6s. Hover =
color/bg/1–3px transform only. Respect prefers-reduced-motion. No entry
animations on prose (reading site); allowed: gentle fade-up on homepage
sections via IntersectionObserver.

## 5. Theming — Light & Dark modes

Two first-class themes sharing one variable-driven token system. Every color
in the app flows through CSS custom properties (`--paper`, `--paper-deep`,
`--ink`, `--ink-60`, `--ink-40`, `--ink-12`, `--ink-08`, `--seal`, `--night`,
`--gold-hairline`, …) so a theme is nothing but a variable swap.

- **Light — "Xuan Paper" (default)**: exactly the palette in §1.
- **Dark — "Night Ink"** (the lacquer language of direction B, site-wide):
  - ground `#131010` (warm lacquer near-black); raised/hover surface `#1B1614`
  - text ivory `#EFE9DC`; 60% `rgba(239,233,220,.62)`; 40% `.40`
  - hairlines `rgba(239,233,220,.10)` and `.14`
  - seal red brightens to `#C9553F` for contrast (stamps stay filled seal
    chips with ivory hanzi)
  - gold hairline `rgba(201,162,39,.18)` allowed sparingly: lattice divider,
    code-panel top rule, night-page corner brackets
  - brush hanzi watermarks: ivory at opacity ~0.045
  - code panels: slightly raised `#1E1917` with a gold top hairline
  - grain overlay stays (opacity .05)
- **Mechanism**: `data-theme="dark"` on `<html>`; variables redefined under
  `[data-theme="dark"]`. Default follows `prefers-color-scheme` via a tiny
  inline no-flash script in `<head>` (reads localStorage `nt-theme`, falls
  back to system). Toggle appears in the site header AND docs sidebar: a
  small seal-style chip — 日 (light) / 月 (dark) — mono-labeled, persisted to
  localStorage; honors system changes when unset. `color-scheme: light dark`
  set appropriately so form controls/scrollbars match.
- **Night pages** (§2) keep their gold corner brackets in BOTH themes; in dark
  mode they distinguish themselves by the brackets + a slightly deeper ground.
- Screenshots/QA must cover both themes.

## 6. Tech & constraints
Same stack (Next 16 App Router, Tailwind v4 @theme tokens, static generation).
Fonts: Fraunces, Noto Serif SC, Ma Shan Zheng, IBM Plex Mono via next/font.
Keep all routes, search modal behavior (⌘K), scroll-spy, mobile drawer —
restyled, not removed. `src/content/**` is read-only. Keep lint/build green.
