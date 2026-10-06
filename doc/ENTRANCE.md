# Trang chọn hai cánh cửa

Tài liệu duy nhất cho trang `?page=choose`: bản hiện tại ở trên, các bản trước ở phần Lịch sử. Quy tắc màu và thành phần dùng chung xem [doc/README.md](README.md).

Ngày cập nhật và kiểm tra: 06/10/2026. Hướng hiện tại: dễ thương, nhẹ và ấm; giữ kiến trúc Trung Hoa và nền giấy Xuan Paper.

## Giao diện

- Gỗ màu mật ong sáng, tường kem sạch, ngói bo mềm và nét vẽ màu nước nhẹ.
- Đèn giấy tròn, ghế rạp hồng đất mềm, màn hình phong cảnh sáng; sách, chén trà và bé mèo cam mũm mĩm.
- Bé mèo cam trong tranh ở cửa là nhân vật riêng của trang chọn cửa, có chủ đích. Trong căn nhà 3D, thú cưng là sóc bay Mochi. Hai bên không cần giống nhau.
- Cây trúc và hoa trắng nhỏ, màu sage/peach nhẹ trong minh họa; màu UI và typography theo quy tắc trong [README.md](README.md).
- Bản tối dùng nền Night Ink nhưng giữ cả mặt nhà và nội thất sáng rõ, cây xanh và mèo cùng nét vẽ truyện tranh.
- Asset được dùng làm nền desktop, hai ô cửa cắt cạnh nhau trên mobile và ô cửa rạp ở trang Milk Cinema.

## Kiểm chứng

- `pnpm build`, `pnpm lint`, `git diff --check`: đạt.
- Playwright 320/390/768/1440px × Việt/Trung × sáng/tối: 16 tổ hợp; không tràn ngang, đúng asset theo theme, đúng locale, đúng liên kết rạp/nhà.
- Không có page error hoặc response lỗi tài nguyên local trong luồng kiểm tra.
- 8 ảnh desktop/tablet/mobile và phần cuối mobile; footer mobile hiển thị đủ.
- Fixture: `output/playwright/check-cute.cjs`; ảnh `output/playwright/cute-*.png`, được gitignore.

Kiểm tra Chromium với viewport mô phỏng. Chưa thử thiết bị thật hoặc Safari/Firefox. Trong đợt chỉnh minh họa này, các liên kết được kiểm tra bằng đích URL; không kiểm tra lại phát phim/backend hay tương tác căn nhà 3D.

## Asset và prompt

Dùng **imagegen tích hợp**; PNG được chuyển sang JPEG chất lượng 88 bằng `sips`, rồi sang WebP chất lượng 0.84 (encoder của Chromium) ngày 06/10/2026. Hai asset production:

- [Cute Paper sáng](../public/images/entrance-cute-paper.webp): 1586 × 992px, khoảng 217KB.
- [Cute Paper tối](../public/images/entrance-cute-paper-night.webp): 1586 × 992px, khoảng 235KB.

Prompt cuối cho bản sáng (bản kiến trúc Trung Hoa trước đó là edit target):

> Use case: style-transfer. Asset type: cute welcoming website hero illustration on Xuan rice paper. Edit target: attached Chinese two-door courtyard picture. Completely redraw its visual style as a gentle, very cute hand-painted children's storybook gouache/watercolor illustration with simple clean rounded forms, delicate warm ink outlines, airy creamy paper and very soft shadows. Retain traditional Chinese architecture: two timber lattice door entrances, subtly upturned grey tiled mini awnings, paper lanterns, small wooden 影 / 家 plaques. Keep exact wide 1586:992 canvas, same approximate centers x530 and x1070, eave tops near y150 and thresholds y740; blank paper above scene and below y790 for real HTML text. Make timber pale honey oak, clean smooth surfaces, neat cream plaster, simplified rounded grey-beige roof tiles with only a few strokes, a friendly cozy miniature house feeling. Doors open wide and interiors are BRIGHT, warm, inviting. Left cinema: two plush rounded dusty-rose seats and a softly glowing screen showing an adorable simple illustrated landscape with rounded clouds; no human silhouettes or mysterious monochrome film. Right reading room: a small wooden reading desk, a few colorful cream-spined books, a cushioned chair, a teacup, warm round paper lantern; a VERY CUTE plump sleeping cream-and-ginger cat prominently curled on a little round mat, tiny pink nose and soft rounded ears. Exterior: a few small round ceramic pots of delicate sage-green leaves and tiny white flowers, one small bamboo sprig; generous empty paper around everything. Palette: warm Xuan Paper #F6F2E9, pale honey wood, warm diluted ink, very soft sage and peach accents; tiny cinnabar seal-red only as small accent. Chinese courtyard identity but sweet, light and cozy, like a friendly illustrated picture book. Reduce small details drastically. NO aged dark wood, scratches, decay, dirt, cracks, black ink splatter, gritty texture, dense vegetation, dramatic dark interiors, heavy cinematic shadows, hard lighting, spooky or abandoned-house feeling, photorealism or 3D render. No European arches, Japanese torii, imperial palace, gold opulence, neon. No website UI, captions, headline or watermark. Paper margins should blend into #F6F2E9.

Prompt cuối cho bản tối (bản cute sáng là edit target):

> Use case: lighting-weather. Asset type: cute cozy evening variant for a Xuan Paper website dark theme. Edit target: the attached cheerful storybook Chinese two-door illustration. Keep the EXACT same 1586:992 aspect ratio, architecture, scale and object placement, roof silhouette, two open honey-wood lattice doors, bamboo and tiny white flowers, 影 and 家 plaques, rosy rounded cinema seats, cheerful landscape screen, book room and cute plump orange-and-cream sleeping cat. Change only surrounding paper background to warm dark ink #131010 with very subtle paper grain, and make lighting feel like a friendly illustrated bedtime story. CRITICAL: the two houses and both interiors remain BRIGHT, evenly lit, and pastel; pale honey wood, creamy walls and sage foliage stay clearly visible, almost as light and cute as the original. Light all facade surfaces gently and evenly, not just the lanterns. Round paper lanterns give small soft creamy apricot glows, not strong orange spotlights. Keep the screen bright and cheerful and books easy to see. Rendering stays flat, delicate, simple children's gouache/watercolor with soft rounded contours and warm fine linework. Foliage remains pastel sage green rather than black or metallic gold. Keep the cat extra sweet, round face, tiny pink nose. No ominous mood, darkened doorway interiors, black silhouettes, dramatic shadows, dark amber wash, high contrast, eerie light, desaturated sepia, gritty aging, realistic night lighting, 3D render, photorealism, stars or moons. No added objects or text, no website UI, no watermark. It should feel safe, soft, warmly welcoming and cute at a glance in dark mode.

## Lịch sử

### Bản kiến trúc Trung Hoa / Xuan Paper (06/10/2026, trước Cute)

Ngày kiểm tra: 06/10/2026. Tham chiếu: yêu cầu chuyển kiến trúc sang Trung Hoa và `DESIGN.md`.

#### Thay đổi

- Hai cửa gỗ khung chữ nhật, song ô hình học, mái ngói xám đầu mái cong, tường vôi và chân tường gạch.
- Đèn giấy, cây trúc, chậu lan, bàn ghế gỗ và sách/cuộn thư; bảng gỗ “影” cho rạp và “家” cho nhà.
- Minh họa nét bút khô và mực loãng trên giấy tuyên, màu gỗ trầm; nền giấy `#F6F2E9`, mực `#1C1A17`, triện đỏ nhỏ `#B23A2B`.
- Có bản Night Ink `#131010` cùng kiến trúc và ánh đèn giấy ấm.
- Chỉnh giới hạn tranh 1400px, khoảng dành cho mái và vùng cắt mobile để tiêu đề không chạm mái và hình giữ đủ phần đầu mái.
- Viền tranh tan vào giấy ở bốn cạnh bằng CSS mask. Hai vùng chọn tiếp tục là liên kết HTML đến rạp và căn nhà 3D.

#### Kiểm chứng

- `pnpm build`, `pnpm lint`, `pnpm test` (25/25), `git diff --check`: đạt.
- Playwright: 320/390/768/1440px × Việt/Trung × sáng/tối = 16 tổ hợp; không tràn ngang, ảnh tải được, nút header tối thiểu 44 × 44px.
- Lưu theme/locale qua reload; bấm vùng hình mở trang rạp và căn nhà 3D; focus bàn phím và giảm chuyển động: đạt.
- Không có page error hoặc response lỗi từ tài nguyên local trong luồng kiểm tra.
- Ảnh kiểm tra `output/playwright/xuan-*.png`; script `check-xuan.cjs`, `capture-xuan.cjs` cùng thư mục, là output local được gitignore.

Kiểm tra Chromium với viewport mô phỏng; chưa kiểm tra thiết bị thật, Safari/Firefox. Kiểm tra rạp đến màn hình vào rạp, chưa kiểm tra lại phát phim/backend.

#### Asset và prompt

Dùng **imagegen tích hợp** để sửa minh họa; chuyển PNG đầu ra sang JPEG chất lượng 88 bằng `sips`. Asset production lúc đó: Asset này đã được gỡ khỏi `public/images` ngày 06/10/2026; lấy lại từ git history nếu cần.

- Xuan Paper sáng (`entrance-xuan-paper.jpg`): 1585 × 992px, khoảng 698KB.
- Night Ink (`entrance-xuan-paper-night.jpg`): 1586 × 992px, khoảng 704KB.

Prompt cuối cho bản sáng, với minh họa cũ làm edit target:

> Use case: style-transfer and precise-object-edit. Asset type: production website hero illustration, traditional Chinese courtyard entrances in a Xuan Paper editorial design. Edit target: attached current two-door artwork. Replace the European architecture and rendering with authentic restrained Jiangnan Chinese courtyard architecture and a hand-painted Chinese ink-and-light-wash illustration on warm Xuan rice paper. Keep exact image aspect ratio 1586:992, camera straight-on, doorway center positions near x=530 and x=1070, doorway thresholds near y=740, and large blank paper above y=190 and below y=790 for real website text. Left entry: rectangular dark timber post-and-lintel opening, traditional geometric carved wood lattice folding door leaves partly open, narrow grey tiled eaves with gently turned ends, weathered white plaster and grey brick footing. A small vertical wooden plaque bearing only the character 影; through the opening a tiny private cinema, a dim projection screen and two subdued dark reddish-brown cinema seats, a warm Chinese paper lantern. Right entry: rectangular lighter weathered wood post-and-lintel opening, traditional geometric Chinese wooden lattice folding screens with translucent rice paper, a narrow grey tiled awning, a modest wooden 家 plaque. Inside is a Chinese scholar's cozy reading room with wooden desk, books and scrolls, a round warm paper lantern, Ming-style wooden chair, sleeping cat on a woven mat. Some sparse bamboo, an orchid pot and one restrained scholar's potted plant replace abundant Mediterranean jasmine. Architectural silhouette unmistakably Chinese, domestic and intimate, never a palace. Style: elegant Song-dynasty literati ink painting on fibrous Xuan paper, visible dry-brush contours, soft diluted ink washes, muted natural timber tones, quiet negative space, minimal detail at margins, warm paper #F6F2E9, warm ink #1C1A17, tiny cinnabar #B23A2B seal accent only, subtle amber interior light. No colored green door paint, no saturated red doors or large colorful surfaces. Shadows dissolve into the paper. Preserve two welcoming distinct destinations and equal visual weight. Avoid all European arches, dressed limestone arch voussoirs, French glazed doors, wrought-iron lamps, English CINEMA signage, western lampshades, baroque decoration, photorealism, 3D renders, Japanese torii/shoji, ornate imperial dragon ornament. No website UI, titles, captions, navigation or watermarks.

Prompt cuối cho bản tối, với bản sáng mới làm edit target:

> Use case: lighting-weather. Asset type: Night Ink variant of the attached Xuan Paper Chinese courtyard illustration. Edit target: the attached daylight artwork. Change ONLY the lighting and paper background tone to a warm quiet night. Preserve exact 1585:992 canvas aspect ratio, placement, scale, architectural silhouette, roof heights, ground line and all physical objects. Preserve two Chinese timber post-and-lintel doorways, grey curved tile eaves, geometric wooden lattice door leaves, traditional paper lanterns, bamboo, orchid and scholar's potted plants, small 影 and 家 wooden plaques, tiny cinema at left and scholar's reading room with sleeping cat at right. The entire plain Xuan paper background becomes warm near-black lacquer ink #131010 with subtle paper grain. Draw architectural contours and tiled roof texture with soft ivory and warm grey ink washes, making them readable against dark paper without photorealism. Small paper lanterns glow softly amber, cozy interior light spills a little onto the thresholds. Muted warm ink/ivory/wood palette, only tiny cinnabar accents. Maintain hand-painted Song literati ink-and-wash treatment and generous negative space. Keep the open doorways inviting and equally legible. No added moon, stars, sky, text, website UI, new objects or watermarks. No western arches or lamps, no bright red doors, no neon, no cinematic blue lighting, no 3D render.

### Bản đầu tiên theo ảnh tham chiếu (06/10/2026)

Ngày kiểm tra: 06/10/2026. Tham chiếu: ảnh người dùng cung cấp và ngôn ngữ Xuan Paper trong `DESIGN.md`, `SKILL.md`.

#### Giao diện

- Hai cánh cửa là liên kết HTML: cửa gỗ dẫn đến `?page=cinema`, cửa xanh dẫn đến `?page=home`. Bấm hình và tên đều đi vào được.
- Nền giấy, Fraunces/Noto Serif SC, viền mảnh, dấu triện đỏ; giữ ngôn ngữ Việt/Trung và lựa chọn sáng/tối đã lưu.
- Desktop dùng một bức minh họa liền nền; mobile xếp hai cửa dọc và cắt hình bằng CSS. Tiêu đề, chú thích, điều khiển và footer là HTML thực.
- Chế độ tối có minh họa ban đêm riêng. Chỉ tải minh họa của theme hiện tại; Three.js tiếp tục được tải sau khi chọn căn nhà.
- Focus bàn phím rõ, nút header tối thiểu 44 × 44px, ảnh trang trí không được đọc lặp bằng trình đọc màn hình, tôn trọng giảm chuyển động.

#### Kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| `pnpm build` | Đạt |
| `pnpm lint` | Đạt |
| `pnpm test` | 25/25 đạt |
| `git diff --check` | Đạt |
| Playwright: 320/390/768/1440px × Việt/Trung × sáng/tối | 16 tổ hợp, không tràn ngang, ảnh tải được, nhãn đúng locale, vùng chạm header đạt 44px |
| Reload | Giữ theme và ngôn ngữ |
| Chọn cửa từ vùng hình | Trang rạp phim hiển thị, căn nhà 3D tải canvas và kết thúc loading |
| Giảm chuyển động, focus bàn phím | Đạt |
| Console và tài nguyên local trong luồng kiểm tra | Không có page error hay response lỗi |
| Footer mobile khi cuộn hết trang | Hiển thị đủ |

Ảnh kiểm tra ở `output/playwright/entrance-*.png`; script kiểm tra thủ công ở `output/playwright/check-entrance.cjs` và `capture-entrance.cjs`. Đây là output local, được gitignore. Kiểm tra bằng Chromium với viewport mô phỏng; chưa thử trên thiết bị thật hoặc Safari/Firefox. Luồng rạp được kiểm tra đến màn hình vào rạp, không kiểm tra lại backend/phát phim.

#### Minh họa và prompt

Dùng công cụ **imagegen tích hợp**; chuyển PNG đầu ra thành JPEG chất lượng 88 bằng `sips`, không thay đổi nội dung hình sau khi tạo. Asset production lúc đó: Asset này đã được gỡ khỏi `public/images` ngày 06/10/2026; lấy lại từ git history nếu cần.

- Sáng (`entrance-doors.jpg`): 1586 × 992px, khoảng 527KB.
- Tối (`entrance-doors-night.jpg`): 1586 × 992px, khoảng 455KB.

Prompt cuối cho bản sáng (ảnh đính kèm là edit target):

> Use case: precise-object-edit. Asset type: production website doorway illustration. Edit target: attached screenshot. Remove ONLY the overlaid website UI: top brand SỮA BEA and red seal, navigation language and moon, horizontal header rule, headline and subtitle at top, both doorway captions and circular arrows underneath, and footer sentence, rules and red seal. Replace those pixels seamlessly with matching warm ivory rice-paper/plaster texture. Keep the entire beautiful scene unchanged: two arched doorways in exact same positions, left antique dark wooden cinema door, cinema sign and film poster, warm lights and red cinema seats inside; right sage green home door, climbing jasmine, warm reading room lamp and books, sleeping cat, plant pots; exact framing, botanical shadows and stone ground, painting style and colors. Do NOT remove physical CINEMA sign or physical 家 wooden plaque. Preserve image aspect ratio and artwork placement. No new graphics, no website UI, no watermarks. Background should blend with warm paper #F6F2E9.

Prompt cuối cho bản tối (bản sáng sạch là edit target):

> Use case: lighting-weather. Asset type: alternate night theme for the same website illustration. Edit target: the attached two-door illustration. Change ONLY lighting and background tone from daylight to night. Exact same image aspect ratio 1586:992 and exact pixel placements of doors, arches, plants, physical signs and props. Preserve antique brown wood cinema door at left, red cinema seats, sage green home doorway at right, flowering jasmine and sleeping cat. The wide plain textured paper/wall background across top, bottom, left and right becomes warm very dark lacquer near-black #131010, with subtle ink-paper texture. Stone arch and doorstep remain visible in muted warm shadows. Warm gold light glows from inside both open doorways and from the two exterior lamps; flowers and plants are softly lit by those warm lights. Keep colors and details readable but restful and atmospheric. Do not move or resize anything. No added moon, no sky, no stars, no new objects, no text or UI. Preserve physical CINEMA and 家 signs. Seamless dark-paper background to integrate with a website using #131010.
