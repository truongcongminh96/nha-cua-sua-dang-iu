# Kiểm chứng bản dựng lại — thư phòng giấy ngà

Ngày: 03/10/2026. Phần này thay thế mô tả/bằng chứng của bản cảnh trước ở bên dưới.

## Thiết kế đã triển khai

- Tường vữa ngà, cột và nẹp mảnh màu mực, sàn gỗ sáng bản rộng trên đế tối.
- Cửa sổ tròn có vành gỗ và song mảnh, hai tấm giấy chia ô hai bên, phong cảnh núi nhiều lớp. Mưa đặt sau phần tường bao để chỉ hiện qua cửa sổ.
- Ghế dài khung gỗ và vải sáng; bàn cạnh bằng đá; bàn trà chữ nhật với ấm sứ; bàn viết chân thanh; kệ sách tông trung tính; thảm hai tấm viền tối; đệm tròn.
- Đèn giấy hình bầu có gân ở góc đọc, bàn viết và cạnh kệ; tranh cuộn chữ 慢; bonsai và bình cắm cành; giá gỗ với túi vải của Mochi.
- Font Fraunces/IBM Plex Mono trên sách và ghi chú, giấy ngà/mực đậm, đỏ dấu nhỏ. Nội dung sách và các tương tác giữ nguyên.
- Điểm đáp kệ thấp/kệ cao của Mochi được chuyển sang vùng trống trên mặt kệ.

## Kiểm tra bản mới

- `pnpm build`: đạt. `pnpm test`: **19/19 đạt**.
- Cả năm sách chọn được; chín điểm trên mỗi trang không bị nội thất che. Có kiểm tra mới cho mặt đỡ tại tám điểm đáp trên cao của Mochi.
- Phiên hành vi 24.000 bước, khả năng tiếp cận các điểm, reduced motion, i18n và lưu trữ tiếp tục đạt.
- Fixture cảnh mới: **624 → 165 mesh** sau batching. Đây không phải số FPS hoặc số draw call toàn ứng dụng.
- Chromium/Playwright: desktop 1440×1000 ở ngày/hoàng hôn/đêm; mobile 390×844 ngày quang và đêm mưa. Đã xem ảnh cả năm sách; thử lật trang và trở về. Console không có lỗi.
- Chưa đo FPS trên điện thoại thật.

Ảnh ở `output/playwright/`: `room-before-remodel.png`, `room-remodel-day.png`, `room-remodel-golden.png`, `room-remodel-night.png`, `room-remodel-mobile-day.png`, `room-remodel-mobile-night-rain.png`, `room-remodel-book-1.png` đến `room-remodel-book-5.png`.

---

## Bằng chứng bản trước (lưu để đối chiếu)

# Kiểm chứng căn nhà 3D

Ngày: 03/10/2026. Theo `DESIGN.md` mục 12 và `SKILL.md`. Tiếp tục trên các chỉnh sửa có sẵn trong `Room.ts` và `materials.ts`.

## Phần đã triển khai

- Đế nhà mỏng hơn, mép liền; ván sàn so le ít chênh màu. Chân tường, panel sơn và nẹp ngà tạo chiều sâu kiến trúc.
- Texture trung tính, vân gỗ mảnh, linen dệt, giấy có xơ, vữa có hạt; roughness/bump riêng cho từng bề mặt.
- Kệ có sách cao/thấp, bìa vải, ruột giấy và gáy riêng. Tầng giữa nhô thành bệ đọc, có thanh đỡ. Chỉ sách `small-bravery` dịch nhẹ để toàn trang không bị tầng trên hoặc đèn sàn che.
- Chụp đèn rỗng có viền/thanh đỡ, cây có lá cong mỏng và gân nhẹ. Cây trước phòng nhỏ hơn để chừa khoảng nhìn.
- Cân bằng lại sunlight/fill ở cả ba thời điểm. Rèm/lá dừng tại tư thế gốc khi giảm chuyển động.
- Đồng bộ đặc tả và skill trong `doc/`; giữ nội dung sách, locale, camera, tuyến Mochi, lưu trữ và API WebMCP.

## Kiểm tra tự động

- `pnpm build`: TypeScript và Vite đạt. App bundle khoảng 161.6 KB gzip.
- `pnpm test`: **18/18 đạt**.
- Kiểm tra mới: hình học lá có tọa độ/normal/UV hữu hạn; raycast nhìn được cả hai mặt; rèm/lá đứng yên khi giảm chuyển động.
- Kiểm tra mới: chín điểm trên trang của từng sách không bị nội thất che từ hướng camera đọc. Test này phát hiện và bảo vệ lỗi che đầu trang sách trên kệ mà test giữa sách trước đây chưa bắt được.
- Các kiểm tra cũ tiếp tục đạt: chọn/đọc năm sách, đường điều hướng kết nối, phiên Mochi 24.000 bước, i18n, nhật ký và lưu trữ lỗi.
- Trong fixture căn nhà, mesh giảm từ **621 xuống 210** sau batching; nhóm tương tác và chuyển động vẫn tồn tại. Đây là số mesh của fixture, không phải FPS hoặc số draw call của toàn ứng dụng.

## Trình duyệt và hình ảnh

Playwright CLI chạy trên Chromium tại preview Vite cục bộ. Fixture chỉ bổ sung ghi nhận trạng thái camera; không đưa instrumentation vào sản phẩm.

- Ma trận 24 cảnh: 320×740, 390×844, 768×1024, 1440×1000; Việt/Trung; ngày/hoàng hôn/đêm. Kiểm tra WebGL context hoạt động, canvas có kích thước và không cuộn ngang; có ảnh từng tổ hợp.
- Quan sát ảnh desktop/mobile: cảnh và điều khiển giữ khoảng trống; kệ, rèm, cây, sàn và đèn rõ ở các thời điểm đại diện.
- Mưa trên mobile: giọt mưa nằm trong cửa sổ, cảnh dịu và đèn tăng sáng.
- Cả năm sách: mở qua giới thiệu, đọc trang tiếp, đổi Trung/Việt giữ trang, Esc trả camera về vị trí/zoom trước.
- Chế độ giảm chuyển động: đọc ban đêm và trở về hoạt động. Unit test xác minh rèm/lá thực sự đứng yên.
- Ảnh đọc trên kệ sau sửa: toàn bộ lời nhắn và phần đầu trang hiện rõ. Nội dung sách giữ nguyên.

Ảnh và script ở `output/playwright/` (được gitignore):

- [Trước](../output/playwright/scene-before-desktop.png)
- [Sau ban ngày](../output/playwright/scene-after-desktop.png)
- [Sau ban đêm](../output/playwright/scene-after-night.png)
- [Mobile mưa](../output/playwright/scene-rain-mobile.png)
- [Đọc trên kệ](../output/playwright/scene-reading-shelf.png)
- [Đọc ban đêm](../output/playwright/scene-reading-night.png)
- Ma trận: `scene-{width}-{locale}-{mode}.png`; script `scene-check.js`.

## Giới hạn

Chưa đo FPS/GPU trên máy thật, chưa thử Safari/Firefox hoặc thiết bị cảm ứng thật. Raycast kiểm tra vùng trang không thay cho kiểm tra mọi glyph/font fallback. WebMCP và âm thanh không thay đổi trong đợt này; không chạy lại toàn bộ kiểm tra UI cũ, xem `UI-VERIFICATION.md` cho bằng chứng đợt trước. Không deploy.
