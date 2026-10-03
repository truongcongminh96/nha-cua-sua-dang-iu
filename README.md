# Sữa Bea 的小屋

*A little house that heals with you.*

Một căn nhà 3D để đọc sách, nghe mưa và ngắm sóc bay Mochi. Sử dụng **Vite + TypeScript + Three.js**, không cần backend hoặc tài khoản.

## Chạy tại máy

Sử dụng **pnpm 11.24.0** (được khai báo trong `packageManager`). Dự án đã được kiểm tra với Node.js 24.

```sh
pnpm install
pnpm dev
```

Mở `http://localhost:5173`. Vite tự cập nhật khi sửa mã nguồn.

```sh
pnpm build     # Kiểm tra TypeScript và tạo thư mục dist/
pnpm preview
pnpm test      # Kiểm tra nội dung, điều hướng, hành vi, lưu trữ và hình học
```

## Khám phá căn nhà

- Nút **中文 / Tiếng Việt** đổi ngôn ngữ ngay cả khi đang đọc sách, giữ nguyên góc nhìn và trạng thái thế giới. Lựa chọn được lưu trên máy. Giao diện, bìa sách, lời nhắn, ghi chú, nhật ký và trạng thái Mochi có cả hai bản; trang sách hiển thị ngôn ngữ còn lại dưới lời nhắn chính.
- Kéo để xoay, cuộn để thu phóng; trên điện thoại dùng một ngón để xoay, hai ngón để thu phóng.
- Nhấn một trong năm cuốn sách để mở sách và đọc chữ ngay trên trang giấy 3D. Nhấn “再读一页” để lật trang; Esc hoặc “回到小屋” để trở về góc nhìn trước.
- Bưu thiếp, giấy ghi chú, hộp nhạc và máy ảnh chứa những lời nhắn nhỏ. Các vật thể cũng có nút truy cập bằng bàn phím trong phần giới thiệu căn nhà.
- Chọn ban ngày, hoàng hôn hoặc ban đêm ở góc phải trên. Thời điểm ban đầu lấy theo giờ địa phương; ánh sáng chuyển dần.
- Bật mưa ở góc phải dưới. Âm thanh mặc định tắt. Khi bật sẽ có tiếng gió, chim ở xa, mưa, lật trang và bước chân nhỏ. Nhấn hộp nhạc để nghe giai điệu. Nhạc nền được bật riêng trong phần giới thiệu.
- Mochi tự ngủ, thức dậy, vươn vai, đi, leo, đánh hơi, ăn trái cây, chải lông, nhảy và lượn. Sóc bay hoạt động về đêm nên ban ngày thường thích ngủ hơn.
- Mười hai khoảnh khắc được lưu trong `localStorage` theo ngày địa phương. Không có điểm số hoặc nhiệm vụ. Khi bộ nhớ bị chặn, căn nhà vẫn hoạt động và giữ phát hiện trong phiên hiện tại.
- Đêm quang đôi khi có sao băng. Khi chuyển sang tab khác, thế giới và âm thanh tạm dừng. Chuyển động môi trường tôn trọng cài đặt giảm chuyển động của hệ thống.

## Cấu trúc

```text
src/
  main.ts                  Khởi động và thông báo khi WebGL không khả dụng
  app.ts                   Lắp ghép hệ thống, đầu vào và vòng lặp render
  world/
    Room.ts                Căn nhà, đồ nội thất, sách và chữ trên trang giấy
    materials.ts           Vân gỗ, giấy, vải, gốm và bảng màu
    primitives.ts          Hình học bo góc và thành phần dựng đồ vật
    optimize.ts            Gộp mesh tĩnh, giữ nguyên các nhóm tương tác/chuyển động
    Ambience.ts            Bụi, sao và sự kiện sao băng hiếm
  systems/
    Camera.ts              Góc nhìn có giới hạn, quán tính và chế độ đọc
    TimeOfDay.ts           Chuyển ánh sáng ngày / hoàng hôn / đêm
    Weather.ts             Mưa ngoài cửa sổ và giọt nước trên kính
    Audio.ts               Âm thanh tổng hợp, khởi động sau thao tác người dùng
    Interactable.ts        Đăng ký tương tác và kiểm tra vật che khuất
    Discovery.ts           Danh mục phát hiện, ngày địa phương và lưu trữ an toàn
    Assets.ts              GLTF cache, clone skeleton, texture và animation loader
  pet/
    types.ts               Định nghĩa thú cưng, trạng thái và khả năng của đồ vật
    Navigation.ts          Kết nối bề mặt an toàn và tìm đường
    PetBehavior.ts         Chọn hành vi có trọng số theo ngữ cảnh
    PetModel.ts            Chân, đuôi, mắt, tai và màng lượn
    PetAnimation.ts        Dáng đi, bám, đánh hơi, thở và lượn
    Pet.ts                 Thực thi trạng thái và đường di chuyển
  data/
    environment.ts         Khả năng đồ vật, điểm tiếp xúc và thú cưng
    quotes.ts              12 lời nhắn Trung / Việt / Anh và năm cuốn sách
    i18n.ts                Bản dịch Trung–Việt và ngôn ngữ đã chọn
  ui/                      Điều khiển tối giản, nhật ký và bố cục responsive
tests/                     Kiểm tra hệ thống không cần GPU
```

## Thiết kế giao diện

UI theo hướng Xuan Paper với giấy ngà, mực đậm và đỏ dấu: điều khiển gọn, lời giao diện ngắn và nhật ký chỉ ghi những khoảnh khắc đã gặp. Xem [đặc tả thiết kế](doc/DESIGN.md), [skill UI của dự án](doc/SKILL.md) và [kết quả kiểm chứng UI](doc/UI-VERIFICATION.md). Căn nhà 3D là một thư phòng với cửa sổ tròn, khung gỗ mảnh, ghế dài linen, đèn giấy có gân, bàn trà, thảm dệt và bonsai; xem [kiểm chứng cảnh 3D](doc/SCENE-VERIFICATION.md).

## Mở rộng

**Lời nhắn mới:** thêm `QuoteDefinition` trong `data/quotes.ts` rồi đưa ID vào `quoteIds` của sách hoặc đồ vật. Sáu nhóm nội dung: `calm`, `tired`, `courage`, `loneliness`, `tomorrow`, `self-kindness`. Dữ liệu tách khỏi phần dựng hình để thêm ngôn ngữ.

**Đồ nội thất mới:** sau khi dựng mô hình, khai báo khả năng trong `affordances`: `sleepable`, `climbable`, `eatable`, `watchable`, `inspectable`, `walkable`, `jumpable`, `landable`. Nối các điểm tiếp xúc an toàn trong `navigationLinks`. Bộ điều khiển thú cưng không cần biết tên từng đồ vật.

**Thú cưng thứ hai:** thêm một định nghĩa trong `pets` với ID, tên, điểm xuất phát, tốc độ và random seed riêng. Mỗi con có trạng thái, mô hình và animation độc lập. Hiện chưa có tránh va chạm hoặc hành vi xã hội giữa nhiều thú cưng.

**Mô hình GLB hoàn chỉnh:** `AssetLoader.model(url)` tải GLTF/GLB và clone skeleton cho từng instance. `AnimationLoader` tạo mixer/actions độc lập. Nếu cần Draco, truyền đường dẫn decoder tự host vào constructor. Bản hiện tại sử dụng hoàn toàn hình học và Canvas texture được tạo bằng mã, không phụ thuộc tài sản 3D bên ngoài.

## Hiệu năng và giới hạn

Đồ nội thất tĩnh được gộp theo material; hình học và material được dùng lại. Lá cây chuyển động theo nhóm. Một directional light tạo bóng, đèn bàn dùng point light không tạo bóng. Pixel ratio tối đa 1.75 trên desktop, 1.4 trên thiết bị cảm ứng; shadow map tương ứng 2048 và 1024. Dừng cập nhật khi tab bị ẩn. JavaScript production khoảng 160 KB gzip. Font lấy từ Google Fonts và có font hệ thống dự phòng.

Các kiểm tra tự động bao gồm: mọi điểm điều hướng kết nối được với nhau; lượn theo chiều hạ xuống và đáp an toàn; phiên chạy thú cưng kéo dài; hành vi theo giờ; không che khuất năm cuốn sách từ góc nhìn đọc; gộp hình học; tham chiếu nội dung; chuyển ngày; bộ nhớ lỗi/bị chặn; cache retry. Mục tiêu là 60 FPS trên desktop hiện đại; chưa đo FPS thực tế hoặc kiểm tra hình ảnh trên nhiều trình duyệt/thiết bị.

Trình duyệt có WebMCP sẽ được đăng ký các thao tác tùy chọn để đọc trạng thái, đổi không khí và mở đồ vật. Nếu API không có, căn nhà hoạt động bình thường. Chưa có phiên WebMCP được phép truy cập để kiểm tra việc đăng ký và thực thi thực tế.

Đây là phiên bản đầu có đầy đủ luồng tương tác, dùng mô hình procedural, animation theo khớp nhóm và tuyến an toàn khai báo trước. Không có mô phỏng lông, vật lý đầy đủ, thời tiết phức tạp hoặc va chạm giữa nhiều thú cưng. Có thể đưa `dist/` lên dịch vụ static hosting để triển khai.


## Màn hình đầu

URL mặc định có hai card **Đi xem phim** / **Vô nhà**. `?page=home` mở trực tiếp căn nhà; `?page=cinema` là trang phim tạm để phát triển sau. Nút chọn lại và Browser Back quay về màn hình chọn. Căn nhà Three.js chỉ tải khi ghé nhà. Giao diện này tiếp tục dùng bảng màu giấy ấm và bản dịch Việt/Trung trong docs.
