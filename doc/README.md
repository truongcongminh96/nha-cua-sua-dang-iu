# Tài liệu Sữa Bea

Sữa Bea có ba khu dùng chung một ngôn ngữ Xuan Paper: **trang chọn cửa** (`?page=choose`), **Milk Cinema** (`?page=cinema`) và **căn nhà 3D** (`?page=home`). File này là nguồn chuẩn cho quy tắc giao diện của repo. Khi khác với DESIGN.md hoặc SKILL.md, làm theo file này.

## Đọc gì, khi nào

| Tài liệu | Dùng cho |
| --- | --- |
| [DESIGN.md](DESIGN.md), [SKILL.md](SKILL.md) | Ngôn ngữ hình ảnh gốc Xuan Paper (từ dự án NineTails). Bỏ qua phần Next.js, chương mục, ⌘K. |
| [ENTRANCE.md](ENTRANCE.md) | Trang chọn cửa: minh họa hiện tại, prompt, kiểm chứng và lịch sử các bản trước. |
| [CINEMA.md](CINEMA.md), [CINEMA-VERIFICATION.md](CINEMA-VERIFICATION.md) | Phạm vi, backend và kiểm chứng Milk Cinema. |
| [UI-VERIFICATION.md](UI-VERIFICATION.md), [SCENE-VERIFICATION.md](SCENE-VERIFICATION.md) | Kiểm chứng giao diện và cảnh 3D của căn nhà. |

## Quy tắc giao diện

- **Màu:** token nằm ở [`src/ui/tokens.css`](../src/ui/tokens.css): giấy `#F6F2E9`, giấy đậm `#EFEADD`, mực `#1C1A17`, đỏ triện `#B23A2B`. Night Ink `#131010` với chữ ngà `#EFE9DC` và đỏ `#C9553F`. Không khai báo lại các màu này trong CSS của từng trang.
- **Tranh và giao diện:** tranh minh họa và cảnh 3D được dùng gỗ mật ong, kem, xanh sage, hồng đào nhạt. Giao diện (chữ, nút, viền) chỉ dùng mực và đỏ triện. Đỏ triện chỉ dùng cho chi tiết nhỏ: dấu triện, trạng thái đang chọn, lỗi, vạch mảnh. Không dùng cho tiêu đề lớn.
- **Theme:** một khoá `sua-ui-theme` dùng chung, xử lý trong [`src/ui/theme.ts`](../src/ui/theme.ts) (kèm thẻ `theme-color`). Căn nhà mở ở chế độ ban đêm khi theme tối. Chọn thời điểm trong nhà thì theme đổi theo: đêm là tối, ngày hoặc hoàng hôn là sáng.
- **Thành phần dùng chung:**
  - Nút ngôn ngữ `.lang-switch`: hiện "VI / 中文", chữ mono 12px, gạch chân ngôn ngữ đang chọn.
  - Dấu triện `.seal-chip`: ô đỏ đặc, chữ Hán màu giấy.
  - Mỗi khu đều có đường quay về `?page=choose`.
- **Chữ:** Fraunces cho tiêu đề, văn bản và nhãn form. IBM Plex Mono chỉ cho thông tin phụ, tối thiểu 11px. Mọi chữ hiển thị phải có cả tiếng Việt và tiếng Trung, trừ tên riêng (Milk Cinema, Sữa, Xiiu, Mochi).
- **Hình khối:** viền 1px, bo góc 2px, không đổ bóng. Riêng nút hành động chính được bo tròn hẳn. Trạng thái không chỉ thể hiện bằng màu, phải kèm dấu, nhãn hoặc viền.
- **Nhân vật:** bé mèo trong tranh ở cửa và sóc bay Mochi trong nhà là hai nhân vật riêng, có chủ đích.

## Đợt đồng bộ 06/10/2026

- Gỡ mã phòng khỏi repo. Đổi mã bằng [`supabase/snippets/rotate-cinema-pin.sql`](../supabase/snippets/rotate-cinema-pin.sql).
- Trang rạp dùng ô cửa rạp từ tranh ở cửa. Căn nhà đổi sang gỗ mật ong. Nền đêm đổi sang Night Ink.
- Thêm token, nút ngôn ngữ và dấu triện dùng chung. Form rạp báo lỗi ngay trong trang theo ngôn ngữ đang chọn. Mobile hiện hai cửa cạnh nhau.
- Ảnh minh họa chuyển sang WebP (khoảng 600KB xuống khoảng 230KB mỗi ảnh). Gỡ 4 ảnh cũ không dùng.
- Kiểm chứng: `pnpm build`, `pnpm lint`, `pnpm test` (26/26), `git diff --check`. Playwright Chromium ở 320/390/1440px, sáng/tối: không tràn ngang, không có lỗi trang. Đã thử luồng nhà → đêm → về trang chủ (theme tối) → vào lại nhà (đêm). Chưa thử Safari/Firefox hay thiết bị thật. Phòng chiếu bên trong không được vào lại vì cần mã thật.
