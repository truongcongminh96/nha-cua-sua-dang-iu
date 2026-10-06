# Hai cánh cửa — kiến trúc Trung Hoa / Xuan Paper

Bản minh họa hiện tại: [Cute Xuan Paper](ENTRANCE-CUTE-PAPER.md). Tài liệu bên dưới ghi lại bản kiến trúc trước lần chỉnh nét vẽ dễ thương.

Ngày kiểm tra: 06/10/2026. Tham chiếu: yêu cầu chuyển kiến trúc sang Trung Hoa và `DESIGN.md`.

## Thay đổi

- Hai cửa gỗ khung chữ nhật, song ô hình học, mái ngói xám đầu mái cong, tường vôi và chân tường gạch.
- Đèn giấy, cây trúc, chậu lan, bàn ghế gỗ và sách/cuộn thư; bảng gỗ “影” cho rạp và “家” cho nhà.
- Minh họa nét bút khô và mực loãng trên giấy tuyên, màu gỗ trầm; nền giấy `#F6F2E9`, mực `#1C1A17`, triện đỏ nhỏ `#B23A2B`.
- Có bản Night Ink `#131010` cùng kiến trúc và ánh đèn giấy ấm.
- Chỉnh giới hạn tranh 1400px, khoảng dành cho mái và vùng cắt mobile để tiêu đề không chạm mái và hình giữ đủ phần đầu mái.
- Viền tranh tan vào giấy ở bốn cạnh bằng CSS mask. Hai vùng chọn tiếp tục là liên kết HTML đến rạp và căn nhà 3D.

## Kiểm chứng

- `pnpm build`, `pnpm lint`, `pnpm test` (25/25), `git diff --check`: đạt.
- Playwright: 320/390/768/1440px × Việt/Trung × sáng/tối = 16 tổ hợp; không tràn ngang, ảnh tải được, nút header tối thiểu 44 × 44px.
- Lưu theme/locale qua reload; bấm vùng hình mở trang rạp và căn nhà 3D; focus bàn phím và giảm chuyển động: đạt.
- Không có page error hoặc response lỗi từ tài nguyên local trong luồng kiểm tra.
- Ảnh kiểm tra `output/playwright/xuan-*.png`; script `check-xuan.cjs`, `capture-xuan.cjs` cùng thư mục, là output local được gitignore.

Kiểm tra Chromium với viewport mô phỏng; chưa kiểm tra thiết bị thật, Safari/Firefox. Kiểm tra rạp đến màn hình vào rạp, chưa kiểm tra lại phát phim/backend.

## Asset và prompt

Dùng **imagegen tích hợp** để sửa minh họa; chuyển PNG đầu ra sang JPEG chất lượng 88 bằng `sips`. Asset production được lưu trong repo:

- [Xuan Paper sáng](../public/images/entrance-xuan-paper.jpg): 1585 × 992px, khoảng 698KB.
- [Night Ink](../public/images/entrance-xuan-paper-night.jpg): 1586 × 992px, khoảng 704KB.

Prompt cuối cho bản sáng, với minh họa cũ làm edit target:

> Use case: style-transfer and precise-object-edit. Asset type: production website hero illustration, traditional Chinese courtyard entrances in a Xuan Paper editorial design. Edit target: attached current two-door artwork. Replace the European architecture and rendering with authentic restrained Jiangnan Chinese courtyard architecture and a hand-painted Chinese ink-and-light-wash illustration on warm Xuan rice paper. Keep exact image aspect ratio 1586:992, camera straight-on, doorway center positions near x=530 and x=1070, doorway thresholds near y=740, and large blank paper above y=190 and below y=790 for real website text. Left entry: rectangular dark timber post-and-lintel opening, traditional geometric carved wood lattice folding door leaves partly open, narrow grey tiled eaves with gently turned ends, weathered white plaster and grey brick footing. A small vertical wooden plaque bearing only the character 影; through the opening a tiny private cinema, a dim projection screen and two subdued dark reddish-brown cinema seats, a warm Chinese paper lantern. Right entry: rectangular lighter weathered wood post-and-lintel opening, traditional geometric Chinese wooden lattice folding screens with translucent rice paper, a narrow grey tiled awning, a modest wooden 家 plaque. Inside is a Chinese scholar's cozy reading room with wooden desk, books and scrolls, a round warm paper lantern, Ming-style wooden chair, sleeping cat on a woven mat. Some sparse bamboo, an orchid pot and one restrained scholar's potted plant replace abundant Mediterranean jasmine. Architectural silhouette unmistakably Chinese, domestic and intimate, never a palace. Style: elegant Song-dynasty literati ink painting on fibrous Xuan paper, visible dry-brush contours, soft diluted ink washes, muted natural timber tones, quiet negative space, minimal detail at margins, warm paper #F6F2E9, warm ink #1C1A17, tiny cinnabar #B23A2B seal accent only, subtle amber interior light. No colored green door paint, no saturated red doors or large colorful surfaces. Shadows dissolve into the paper. Preserve two welcoming distinct destinations and equal visual weight. Avoid all European arches, dressed limestone arch voussoirs, French glazed doors, wrought-iron lamps, English CINEMA signage, western lampshades, baroque decoration, photorealism, 3D renders, Japanese torii/shoji, ornate imperial dragon ornament. No website UI, titles, captions, navigation or watermarks.

Prompt cuối cho bản tối, với bản sáng mới làm edit target:

> Use case: lighting-weather. Asset type: Night Ink variant of the attached Xuan Paper Chinese courtyard illustration. Edit target: the attached daylight artwork. Change ONLY the lighting and paper background tone to a warm quiet night. Preserve exact 1585:992 canvas aspect ratio, placement, scale, architectural silhouette, roof heights, ground line and all physical objects. Preserve two Chinese timber post-and-lintel doorways, grey curved tile eaves, geometric wooden lattice door leaves, traditional paper lanterns, bamboo, orchid and scholar's potted plants, small 影 and 家 wooden plaques, tiny cinema at left and scholar's reading room with sleeping cat at right. The entire plain Xuan paper background becomes warm near-black lacquer ink #131010 with subtle paper grain. Draw architectural contours and tiled roof texture with soft ivory and warm grey ink washes, making them readable against dark paper without photorealism. Small paper lanterns glow softly amber, cozy interior light spills a little onto the thresholds. Muted warm ink/ivory/wood palette, only tiny cinnabar accents. Maintain hand-painted Song literati ink-and-wash treatment and generous negative space. Keep the open doorways inviting and equally legible. No added moon, stars, sky, text, website UI, new objects or watermarks. No western arches or lamps, no bright red doors, no neon, no cinematic blue lighting, no 3D render.
