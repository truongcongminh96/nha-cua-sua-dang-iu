---
name: sua-bea-little-house-ui
description: Thiết kế, review hoặc triển khai giao diện Nhà nhỏ của Sữa Bea trong repo nha-cua-sua-dang-iu. Áp dụng tinh thần giấy ấm, xanh lá dịu, gỗ, typography Trung–Việt và chuyển động nhẹ cho căn nhà 3D, đọc sách, nhật ký, điều khiển thời điểm và trải nghiệm mobile.
---

> **Điều chỉnh theo phản hồi 03/10/2026:** UI phải bám bản gốc trong `Downloads/workshop_skills`: giấy `#F6F2E9`, mực `#1C1A17`, đỏ dấu `#B23A2B`, Fraunces + IBM Plex Mono, nét mảnh và hàng mục lục. Các hướng dẫn xanh lá, Lora/Playfair, thẻ bo tròn bên dưới là bản tùy biến cũ, không còn là chuẩn cho lớp UI. Trang vào nhà dùng watermark 家, hai hàng lựa chọn và theme sáng/tối; overlay trong nhà dùng cùng bộ màu, chuyển Night Ink theo thời điểm đêm. Vật liệu và ánh sáng 3D vẫn có hệ riêng. Giữ nội dung Sữa Bea, stack Vite và các luồng hiện có.


# Nhà nhỏ của Sữa Bea UI

Đây là bản custom từ skill UI NineTails, lưu trong repo để tham khảo và sử dụng về sau. File này chưa được cài vào hệ thống skill của Codex. Đọc `DESIGN.md` cùng thư mục làm đặc tả chi tiết; phân biệt UI đã triển khai với các đề xuất trang trí tùy chọn. Tham khảo `UI-VERIFICATION.md` và `SCENE-VERIFICATION.md` cho bằng chứng kiểm tra.

## Khi áp dụng

Dùng khi có yêu cầu thiết kế hoặc sửa UI của Nhà nhỏ của Sữa Bea: overlay trên cảnh 3D, sách, nhật ký, giới thiệu, loading, trạng thái Mochi, thời tiết, ngôn ngữ hoặc responsive, kiến trúc và chất liệu 3D. Không tự triển khai giao diện khi yêu cầu chỉ là cập nhật tài liệu.

## Tinh thần sản phẩm

Một căn nhà để đọc sách, nghe mưa, ở bên sóc bay Mochi hoặc chẳng làm gì cả. Cảnh 3D là trọng tâm; UI giúp khám phá mà vẫn chừa chỗ để ngắm. Lời nhắn ấm và cụ thể, không thúc giục, không biến những khoảnh khắc thành việc cần hoàn thành.

## Nền tảng thị giác

- Theo bảng màu repo: nền ban ngày `#EEEEE6`, chữ `#545F4D`, giấy ấm, xanh lá dịu và gỗ. Hoàng hôn và ban đêm dùng token trong `DESIGN.md`.
- Màu đất nung `#CF926A` có thể làm dấu nhỏ; không dùng đỏ dấu của NineTails làm nhận diện mặc định.
- Nhóm nút nền giấy, bo 8–12px, viền 1px; không blur trên nút hoặc bóng hover. Drawer giấy đục, bóng mềm nhẹ. Giữ ánh sáng và bóng tự nhiên của căn nhà.
- Playfair Display cho nhận diện, Lora cho lời nhắn tiếng Việt, Noto Serif SC cho tiếng Trung, DM Sans cho điều khiển. Dùng Noto Sans SC khi cần chữ Trung dạng sans rõ hơn.
- Ưu tiên dấu tiếng Việt, glyph Trung, fallback và độ đọc rõ trên cảnh sáng / tối; không chỉ đánh giá nền panel riêng lẻ.

## Chữ Hán và nhận diện

- Tên: Nhà nhỏ của Sữa Bea / Sữa Bea 的小屋; biểu tượng chính là ngôi nhà, bạn cùng nhà là sóc bay Mochi.
- Đã dùng một dấu 家 trong phần giới thiệu; trang giấy 3D giữ dấu 慢 mờ và 家 nhỏ. Không phủ watermark lên toàn cảnh. Nếu mở rộng về sau: 家 = nhà, 慢 = chậm, 光 = ánh sáng, 书 = sách. Chỉ chọn một chi tiết có ý nghĩa cho mỗi vùng, không trang trí đồng loạt.
- Dùng giản thể để nhất quán với locale Trung trong repo. Tra bảng nhãn ở `DESIGN.md`; không giữ biểu tượng cáo, chín đuôi hoặc chương studio của mẫu gốc.
- Chữ trang trí có `aria-hidden="true"`; nhãn chức năng phải dịch theo ngôn ngữ đang chọn. Không yêu cầu người dùng biết chữ Hán để thao tác.
- Watermark tùy chọn opacity .03–.05, không nằm sau lời nhắn cần đọc và không che canvas.

## Bố cục và thao tác

- Giữ canvas toàn màn hình, các nhóm điều khiển ở rìa, khoảng trống quanh Mochi và đồ vật tương tác.
- Nhận diện trái trên; âm thanh / thời điểm / ngôn ngữ phải trên; nhật ký trái dưới; mưa / reset / giới thiệu phải dưới.
- Khi đọc, ưu tiên trang sách, nút đọc thêm và trở về; giữ đổi ngôn ngữ và Esc.
- Nhật ký / giới thiệu dùng drawer giấy với nội dung dễ đọc, cuộn được và nút đóng rõ. Nội dung dài tối đa khoảng 60–68ch khi có đủ chỗ.
- Mobile: safe area, không chồng nhãn với nút, vùng chạm mục tiêu ít nhất 44 × 44 CSS px. Cho chữ xuống dòng thay vì ép nhỏ.
- Nhật ký chỉ hiện các khoảnh khắc đã gặp, không có checklist/gợi ý chưa gặp. Bộ đếm nhẹ lấy tổng từ dữ liệu; phát hiện là kỷ niệm, không phải nhiệm vụ. Không thêm sidebar chương hoặc role paths từ mẫu catalog.

## Trạng thái, chuyển động và khả năng truy cập

- Dùng ba trạng thái hiện có `day` / `golden` / `night` qua `body[data-time]`; màu UI đi qua CSS variables. Không tự thêm theme độc lập hoặc khóa lưu trữ của mẫu gốc.
- Hover / panel dùng `cubic-bezier(0.32,0.72,0,1)`, khoảng 400–600ms, dịch chuyển nhỏ. Camera, ánh sáng và Mochi theo hệ thống riêng.
- Tôn trọng `prefers-reduced-motion`, focus rõ, điều khiển bàn phím và `aria-pressed` cho nút trạng thái.
- Không dùng màu làm tín hiệu duy nhất; ghép icon, chữ hoặc hình dạng.
- Âm thanh mặc định tắt và khởi động sau thao tác người dùng; giữ điều khiển nhạc nền riêng.
- Nội dung tiếng Việt / Trung qua `t()` và `localize()`; giữ thế giới và sách đang đọc khi đổi locale.

## Ràng buộc repo

Stack là Vite + TypeScript + Three.js và Lucide. Theo cấu trúc hiện có trong `src/ui`, `src/data`, `src/world`, `src/systems`; không chuyển sang Next.js / Tailwind hoặc thêm bộ font mới chỉ vì skill tham khảo sử dụng chúng. Font hiện tải duy nhất ở `index.html`.

Không mang giới hạn `src/content/**` hoặc block model của NineTails sang repo này. Nếu cần sửa lời nhắn hoặc dữ liệu, thực hiện trong phạm vi yêu cầu và giữ đủ bản dịch / tham chiếu liên quan. Không thay khóa lưu trữ hiện có nếu không có nhu cầu migration cụ thể.

## Checklist review khi sửa UI

- Desktop / mobile; Trung / Việt; đủ ba thời điểm; mưa / trời quang.
- Phân cấp chữ, độ tương phản trên cảnh, font fallback, không chồng điều khiển.
- Đọc sách / đọc thêm / trở về; đổi locale trong lúc đọc; nhật ký / giới thiệu.
- Focus, Tab, Esc, nhãn icon, vùng chạm, giảm chuyển động.
- Âm thanh tắt / bật, loading, lỗi WebGL và lưu trữ bị chặn.
- Chạy `pnpm build` và `pnpm test` nếu sửa code; báo đúng các kiểm tra đã thực hiện.
- Giữ một chi tiết nhận diện đáng nhớ; bỏ phần trang trí làm khó đọc hoặc che căn nhà.


## Khi sửa thế giới Three.js

- Cảnh hiện tại là thư phòng giấy ngà: cửa sổ tròn, cột mực mảnh, gỗ sáng, vải ngà, thảm dệt, đèn giấy có gân và bonsai. Lấy màu hiện tại từ `src/world/materials.ts`; không khôi phục bảng xanh lá/đất nung cũ.
- Vật liệu dùng roughness/bump riêng và cache chung. Giữ batching cho mesh tĩnh, loại trừ sách và các nhóm chuyển động.
- Giữ mặt đọc và điểm đáp của Mochi thông thoáng. Thay chiều cao/vị trí đồ đỡ phải cập nhật `affordances` và các liên kết điều hướng.
- Mưa/sao nằm sau tường bao cửa tròn, trước nền trời. Không đặt hiệu ứng lên mặt tường.
- Chụp trước/sau, kiểm tra ba thời điểm và mobile. Chạy kiểm tra năm sách, occlusion, mặt đỡ, batching và phiên Mochi dài.
- Xem phần đầu `SCENE-VERIFICATION.md` cho bằng chứng mới nhất; số mesh không đại diện cho FPS.
