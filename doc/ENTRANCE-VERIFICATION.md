# Trang chọn hai cánh cửa

Bản hiện tại: [Cute Xuan Paper](ENTRANCE-CUTE-PAPER.md). Nội dung bên dưới ghi lại lần dựng theo ảnh tham chiếu ban đầu.

Ngày kiểm tra: 06/10/2026. Tham chiếu: ảnh người dùng cung cấp và ngôn ngữ Xuan Paper trong `DESIGN.md`, `SKILL.md`.

## Giao diện

- Hai cánh cửa là liên kết HTML: cửa gỗ dẫn đến `?page=cinema`, cửa xanh dẫn đến `?page=home`. Bấm hình và tên đều đi vào được.
- Nền giấy, Fraunces/Noto Serif SC, viền mảnh, dấu triện đỏ; giữ ngôn ngữ Việt/Trung và lựa chọn sáng/tối đã lưu.
- Desktop dùng một bức minh họa liền nền; mobile xếp hai cửa dọc và cắt hình bằng CSS. Tiêu đề, chú thích, điều khiển và footer là HTML thực.
- Chế độ tối có minh họa ban đêm riêng. Chỉ tải minh họa của theme hiện tại; Three.js tiếp tục được tải sau khi chọn căn nhà.
- Focus bàn phím rõ, nút header tối thiểu 44 × 44px, ảnh trang trí không được đọc lặp bằng trình đọc màn hình, tôn trọng giảm chuyển động.

## Kiểm tra

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

## Minh họa và prompt

Dùng công cụ **imagegen tích hợp**; chuyển PNG đầu ra thành JPEG chất lượng 88 bằng `sips`, không thay đổi nội dung hình sau khi tạo. Asset production được lưu trong repo:

- [Sáng](../public/images/entrance-doors.jpg): 1586 × 992px, khoảng 527KB.
- [Tối](../public/images/entrance-doors-night.jpg): 1586 × 992px, khoảng 455KB.

Prompt cuối cho bản sáng (ảnh đính kèm là edit target):

> Use case: precise-object-edit. Asset type: production website doorway illustration. Edit target: attached screenshot. Remove ONLY the overlaid website UI: top brand SỮA BEA and red seal, navigation language and moon, horizontal header rule, headline and subtitle at top, both doorway captions and circular arrows underneath, and footer sentence, rules and red seal. Replace those pixels seamlessly with matching warm ivory rice-paper/plaster texture. Keep the entire beautiful scene unchanged: two arched doorways in exact same positions, left antique dark wooden cinema door, cinema sign and film poster, warm lights and red cinema seats inside; right sage green home door, climbing jasmine, warm reading room lamp and books, sleeping cat, plant pots; exact framing, botanical shadows and stone ground, painting style and colors. Do NOT remove physical CINEMA sign or physical 家 wooden plaque. Preserve image aspect ratio and artwork placement. No new graphics, no website UI, no watermarks. Background should blend with warm paper #F6F2E9.

Prompt cuối cho bản tối (bản sáng sạch là edit target):

> Use case: lighting-weather. Asset type: alternate night theme for the same website illustration. Edit target: the attached two-door illustration. Change ONLY lighting and background tone from daylight to night. Exact same image aspect ratio 1586:992 and exact pixel placements of doors, arches, plants, physical signs and props. Preserve antique brown wood cinema door at left, red cinema seats, sage green home doorway at right, flowering jasmine and sleeping cat. The wide plain textured paper/wall background across top, bottom, left and right becomes warm very dark lacquer near-black #131010, with subtle ink-paper texture. Stone arch and doorstep remain visible in muted warm shadows. Warm gold light glows from inside both open doorways and from the two exterior lamps; flowers and plants are softly lit by those warm lights. Keep colors and details readable but restful and atmospheric. Do not move or resize anything. No added moon, no sky, no stars, no new objects, no text or UI. Preserve physical CINEMA and 家 signs. Seamless dark-paper background to integrate with a website using #131010.
