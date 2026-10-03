# UI refactor — kiểm chứng

Ngày kiểm tra: 03/10/2026. Hướng thiết kế: nhật ký giấy ấm, theo `DESIGN.md` và `SKILL.md` trong thư mục này.

## Thay đổi

- Giảm slogan, chữ hoa và lời chào lặp lại; tên nhà, trạng thái thời điểm và Mochi ngắn hơn.
- Nhóm nút nền giấy, viền mảnh, bo 8–12px; không blur trên nút hoặc bóng hover. Font tải ở một nơi.
- Nhật ký chỉ ghi những khoảnh khắc đã gặp, có ngày địa phương, trạng thái trống và bộ đếm theo danh mục thực.
- Drawer có header/nút đóng cố định, thân cuộn; giữ focus và vị trí đọc khi refresh hoặc đổi locale. Sai số cuộn 1px do trình duyệt làm tròn được chấp nhận.
- Tooltip nằm trong viewport; toast xuống dòng; chế độ đọc ẩn và đặt các nhóm khám phá thành `inert`.
- Tăng độ đậm, cỡ và khoảng cách dòng của chữ trên giấy 3D; giữ nguyên tất cả lời nhắn, tên sách, ánh sáng, mô hình, camera và hành vi Mochi.

## Kết quả

| Kiểm tra | Kết quả |
| --- | --- |
| `pnpm build` | Đạt: TypeScript và production build |
| `pnpm test` | 15/15 đạt; thêm kiểm tra bản dịch UI và bộ đếm với tổng khác 12 |
| `git diff --check` | Đạt |
| Bố cục căn nhà | 24 tổ hợp: 320/390/768/1440px × Trung/Việt × ngày/hoàng hôn/đêm; không chồng nhóm UI, không tràn viewport, nút tối thiểu 44×44px |
| Điều khiển đọc | Nằm trong viewport ở cả bốn kích thước; ngôn ngữ luôn truy cập được |
| Năm cuốn sách | Playwright: mở, lật trang, đổi Trung–Việt giữ nguyên trang; Tab không vào nút ẩn; Esc trả đúng góc nhìn và focus. Tổng 31 kiểm tra luồng UI cuối đều đạt |
| Nhật ký | Chỉ mục đã gặp, trạng thái trống, không nhân bản phát hiện, đóng trả focus về nút mở |
| Refresh drawer | Giữ focus theo hành động/đồ vật và scroll khi cập nhật hoặc đổi locale |
| Tổng danh mục | Thử tổng 13: bộ đếm UI và footer nhật ký dùng tổng thực |
| Chuyển ngày | Kiểm tra tự động hệ thống và fixture UI: bộ đếm trở về 0, nhật ký trở về trạng thái trống |
| Bộ nhớ bị chặn | Căn nhà vẫn mở, đổi locale, đọc sách và ghi phát hiện trong phiên; nhật ký giải thích không lưu được |
| WebGL không khả dụng | Có thông báo theo locale và nút thử lại |
| Font không tải được | Điều khiển vẫn hoạt động, vùng chạm và bố cục dùng font dự phòng |
| Giảm chuyển động | CSS transition/animation tắt theo media query; loading không dùng spinner |
| Âm thanh và mưa | Bật/tắt hoạt động, nhãn và trạng thái đồng bộ sau đổi locale |
| Khả năng truy cập | Axe WCAG 2 A/AA: 0 vi phạm được phát hiện; kiểm tra focus, Tab và Esc trong trình duyệt |

## Ảnh kiểm tra tại máy

Ảnh và fixture nằm trong `output/playwright/`, được gitignore; không được đưa lên hosting.

- Desktop: [trước](../output/playwright/before-desktop.png) / [sau](../output/playwright/after-desktop.png).
- Mobile: [trước](../output/playwright/before-mobile.png) / [sau](../output/playwright/after-mobile.png).
- [Nhật ký trống](../output/playwright/after-journal-empty.png), [nhật ký có ghi chép](../output/playwright/after-journal-mobile.png), [giới thiệu](../output/playwright/after-about-mobile.png).
- [Đọc sách](../output/playwright/after-reading-mobile.png), [đọc lúc hoàng hôn](../output/playwright/after-reading-golden.png), [đọc ban đêm](../output/playwright/after-reading-night.png).
- [Lỗi WebGL](../output/playwright/after-webgl-failure.png), [font dự phòng](../output/playwright/after-font-fallback.png), [loading](../output/playwright/after-loading.png).

## Giới hạn

Kiểm tra trình duyệt trên Chromium/Chrome với viewport mô phỏng; chưa xác minh trên thiết bị thật hoặc Safari/Firefox. Axe không tự đo được tương phản của chữ đặt trên canvas 3D; phần này được kiểm tra bằng ảnh, không coi là chứng nhận WCAG cho toàn bộ cảnh.

Một số lệnh `agent-browser eval` trong chuỗi chạy dài bị timeout. Sau timeout, lệnh snapshot/eval ngắn vẫn đọc được trạng thái trang và camera; console không có lỗi ngoài lỗi WebGL do fixture chủ động tạo. Các luồng còn lại được xác minh lại bằng Playwright CLI. Không đo FPS và không deploy trong đợt này.
