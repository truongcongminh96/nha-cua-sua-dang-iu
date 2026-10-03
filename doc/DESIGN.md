# Nhà nhỏ của Sữa Bea — Design specification

> Bản custom cho repo `nha-cua-sua-dang-iu`, cập nhật ngày 03/10/2026.
> Tham khảo tinh thần giấy ấm, typography và khoảng trống từ DESIGN của NineTails Workshop; nhận diện, nội dung và bố cục dưới đây thuộc Nhà nhỏ của Sữa Bea.
> Hướng “nhật ký giấy ấm” đã được chọn và triển khai cho UI. Phần trang trí được ghi là tùy chọn vẫn chưa triển khai; xem `UI-VERIFICATION.md` để biết các kiểm tra thực tế.

## 1. Ý tưởng và nhận diện

**Một căn nhà nhỏ, một chút bình yên.** Người ghé thăm có thể đọc sách, nghe mưa, ngắm sóc bay Mochi hoặc chẳng làm gì cả. Căn nhà là trọng tâm; giao diện chỉ nhẹ nhàng giúp người dùng khám phá.

- Tên tiếng Việt: **Nhà nhỏ của Sữa Bea**.
- Tên tiếng Trung: **Sữa Bea 的小屋** — căn nhà nhỏ của Sữa Bea.
- Lời chào: “Cứ tự nhiên như ở nhà nhé.”
- Tinh thần: gần gũi, mềm mại, riêng tư, chậm rãi; như một trang nhật ký đặt cạnh cửa sổ.
- Chất liệu: giấy ngà, gỗ ấm, vải mềm, gốm, cây xanh và ánh đèn nhỏ.
- Không tạo áp lực hoàn thành: phát hiện là kỷ niệm, không phải nhiệm vụ hoặc thành tích.

### Phần kế thừa và phần custom

Giữ khoảng trống có chủ ý, nét phân cách mảnh, serif cho lời nhắn, chuyển động tiết chế và một dấu nhận diện nhỏ. Thay ngôn ngữ catalog của studio bằng cảm giác một căn nhà có người bạn bé nhỏ cùng sống.

Các chương, lộ trình nghề nghiệp, priority badge, trang combat, manifest và sidebar tài liệu của mẫu gốc không phải cấu trúc sản phẩm này. Không dùng chúng để suy ra chức năng mới.

## 2. Màu sắc

Bảng màu lấy từ giao diện và vật liệu hiện có của repo. Giấy, xanh lá dịu và gỗ ấm là nhận diện chính; không áp dụng giới hạn chỉ mực đen + đỏ dấu của mẫu gốc lên thế giới 3D.

### Giao diện theo thời điểm — giá trị đang có trong mã

| Vai trò | Ban ngày | Hoàng hôn | Ban đêm |
| --- | --- | --- | --- |
| Nền thế giới | `#EEEEE6` | `#EAE3D5` | `#242F38` |
| Chữ chính `--ink` | `#545F4D` | `#685B46` | `#E3DFCA` |
| Chữ phụ `--muted` | `#626D5C` | `#71624D` | `#C1CBC5` |
| Panel `--panel` | `rgba(249,249,240,.96)` | `rgba(247,237,219,.96)` | `rgba(40,52,60,.97)` |
| Nét mảnh `--line` | `rgba(102,113,87,.15)` | `rgba(143,129,108,.16)` | `rgba(193,204,186,.17)` |

Nguồn: `src/ui/styles.css` và `src/systems/TimeOfDay.ts`. Các giá trị trên là baseline, không phải kết quả kiểm tra tương phản. Chữ phụ trên nền trong suốt phải được kiểm tra với cả vùng sáng và tối của cảnh 3D; tăng độ đục panel hoặc độ tương phản khi cần.

### Vật liệu của căn nhà

- Gỗ: `#BF9266`, gỗ sáng `#D6B487`, gỗ tối `#785B43`.
- Tường: `#EEE8D5`; kem: `#F5EDD9`; giấy sách: `#FFF5DC`.
- Lá dịu: `#94A58A`; rêu: `#60765A`; xanh xám: `#889BA4`.
- Đất nung: `#CF926A`; có thể dùng làm điểm nhấn nhỏ trên dấu nhận diện, không phủ thành mảng lớn trên UI.
- Focus ring: ngày `#73572E`, hoàng hôn `#77502C`, đêm `#E4BC85`. Độ đục panel và màu chữ phụ được tăng để rõ hơn trên cảnh. Chữ trên trang 3D dùng mực đậm hơn, giữ nguyên nội dung và ánh sáng.

Nguồn: `src/world/materials.ts` và `src/ui/styles.css`. Màu bìa sách giữ theo `src/data/quotes.ts`, không ép tất cả về một màu.

## 3. Typography

Dùng bộ font đã có thay vì đưa font và cơ chế tải của Next.js vào repo Vite.

- **Tên Sữa Bea / tiêu đề nhận diện:** Playfair Display, weight 500–600; không phóng lớn đến mức che căn nhà.
- **Tiếng Việt / lời nhắn / nội dung đọc:** Lora, weight 400–600, italic dùng nhẹ. Kiểm tra đầy đủ dấu tiếng Việt.
- **Tiếng Trung:** Noto Serif SC cho tiêu đề, sách và lời nhắn; Noto Sans SC có thể dùng cho điều khiển cần đọc nhanh.
- **Điều khiển / trạng thái:** DM Sans với fallback hệ thống; không dùng mono chữ hoa cho mọi nhãn.
- Nội dung drawer khoảng 1rem, line-height 1.7–1.9; cột đọc tối đa khoảng 60–68ch khi có đủ không gian.
- Nhãn thao tác dùng kiểu câu thông thường. Eyebrow chỉ viết hoa khi ngắn; không giãn chữ tiếng Trung như nhãn Latin.
- Font thư pháp không bắt buộc. Watermark nếu có dùng Noto Serif SC, không cần Ma Shan Zheng chỉ để trang trí.

## 4. Chữ Hán và biểu tượng riêng

Giao diện hiện có dùng tiếng Trung giản thể. Các chữ và cụm từ mới phải nhất quán với lựa chọn này, có ý nghĩa trong căn nhà và có bản tiếng Việt tương ứng.

| Vị trí / ý nghĩa | Chữ hoặc cụm từ | Bản tiếng Việt | Cách dùng |
| --- | --- | --- | --- |
| Nhận diện | 家 | Nhà | Dấu nhỏ tùy chọn cạnh tên; biểu tượng ngôi nhà hiện có vẫn là nhận diện chính |
| Tên sản phẩm | Sữa Bea 的小屋 | Nhà nhỏ của Sữa Bea | Tên đầy đủ theo ngôn ngữ đang chọn |
| Nhịp sống | 慢 | Chậm | Watermark tùy chọn ở trang giấy hoặc phần giới thiệu |
| Ánh sáng | 光 | Ánh sáng | Chi tiết nhỏ gắn với sách hoặc lời nhắn về ánh sáng |
| Đọc sách | 书 | Sách | Dấu trang tùy chọn, không thay nhãn thao tác |
| Nhật ký | 小屋手记 | Nhật ký căn nhà | Tiêu đề drawer nhật ký |
| Phát hiện | 今日的小小发现 | Chút dịu dàng hôm nay | Nút mở những khoảnh khắc đã gặp |
| Thời điểm | 日光 / 黄昏 / 夜晚 | Ban ngày / Hoàng hôn / Ban đêm | Ba chế độ hiện có, đi cùng icon mặt trời / hoàng hôn / trăng |
| Chú thích tùy chọn | 小屋里的温柔 | Dịu dàng trong căn nhà | Dòng nhỏ trong phần giới thiệu, không phủ lên cảnh |
| Lời nhắn chủ đạo | 不用做什么，待一会儿就好。 | Không cần làm gì, cứ ở đây một lát thôi. | Hướng dẫn nhẹ hoặc lời kết |

Các lựa chọn 家 / 慢 / 光 / 书 và 小屋里的温柔 là đề xuất mới trong tài liệu; các nhãn còn lại đã có trong repo. Khi triển khai, bổ sung bản dịch vào `src/data/i18n.ts` nếu cần.

### Quy tắc chuyển từ mẫu NineTails

- Dấu nhận diện “chín đuôi” chuyển thành biểu tượng nhà hoặc dấu 家; không gắn số chín vào tên Sữa Bea.
- Watermark hình tượng cáo chuyển thành 慢 hoặc 光 ở bề mặt đọc phù hợp. Mochi là sóc bay, không phải cáo.
- Mục lục chương chuyển thành nhãn đúng ngữ cảnh: “Sách trong nhà”, “Nhật ký căn nhà” hoặc “Chút dịu dàng hôm nay”; không tạo danh mục chương giả.
- Nhãn ưu tiên chuyển thành lời nhắn / khoảnh khắc khi thực sự cần; bỏ dấu priority và cấp bậc hoàn thành.
- Số trang và số lượng dùng số thông thường, lấy từ dữ liệu thực. Không giữ thống kê 9 / 48 / 16 của mẫu.
- Không dùng chữ dọc như đồ trang trí mặc định. Nếu thêm trong phần giới thiệu, cần bản dịch và ẩn trên màn hình hẹp khi ảnh hưởng việc đọc.
- Watermark tối đa một điểm trong một vùng đọc, opacity khoảng .03–.05, `aria-hidden="true"`, không nằm dưới chữ chính.
- Chữ mang ý nghĩa thao tác luôn có nhãn dễ hiểu theo locale; người dùng không cần biết chữ Hán để dùng căn nhà.

## 5. Bố cục sản phẩm

### Căn nhà toàn màn hình

1. Canvas 3D chiếm toàn màn hình; chừa các điểm nhìn đến sách, cửa sổ và Mochi. Mép UI 32px trên desktop, 12px trên mobile dưới 640px, cộng safe area.
2. Góc trái trên: icon nhà, “Nhà nhỏ của”, tên Sữa Bea và một dòng trạng thái ngắn theo thời điểm. Không còn slogan chữ hoa.
3. Góc phải trên: âm thanh, ba thời điểm và chọn ngôn ngữ. Trạng thái đang chọn thể hiện bằng hình dạng / nền cùng `aria-pressed`.
4. Góc trái dưới: nút “Nhật ký”, số đã gặp / tổng theo `discoveries.length`; bỏ lời chào lặp lại. Không có thanh tiến độ.
5. Góc phải dưới: mưa, đặt lại góc nhìn, giới thiệu căn nhà.
6. Trạng thái Mochi ngắn, hướng dẫn một dòng. Hướng dẫn ẩn sau thao tác xoay, zoom hoặc mở đồ vật; reset cho hiện lại. Thời tiết thể hiện qua nút và tooltip, không còn lời dẫn riêng ở góc màn hình.

Không bổ sung landing page, sidebar chương hoặc mục lục bên phải chỉ vì có trong bản tham khảo.

### Khi đọc sách

- Chữ nằm trên trang giấy 3D; ánh sáng và góc nhìn phải giúp đọc rõ cả ban ngày lẫn ban đêm.
- Tên sách, “Đọc thêm một trang” và “Trở về căn nhà” tạo một luồng đọc rõ ràng; Esc trở về góc nhìn trước.
- Vẫn đổi được ngôn ngữ mà không mất góc nhìn hoặc tiến trình đọc.
- Giữ lời nhắn song ngữ theo mô hình nội dung đang có; không dùng watermark làm nền cho đoạn cần đọc.

### Nhật ký và giới thiệu

- Drawer nền giấy đục, tiêu đề serif, ngày địa phương, các khoảnh khắc đã gặp chia bằng nét mảnh theo thứ tự danh mục. Không hiện mục chưa gặp, dấu tick hoặc gợi ý sưu tầm. Desktop rộng tối đa 420px, chừa khoảng cho điều khiển trên/dưới.
- Màn hình nhỏ dùng panel gần đáy, có cuộn và nút đóng dễ thấy; tôn trọng safe area.
- Phần giới thiệu có các nút chọn đồ vật bằng bàn phím và điều khiển nhạc nền.
- Trạng thái trống: “Hôm nay chưa có ghi chép nào.” và “Bạn có thể mở một cuốn sách hoặc ngắm Mochi một lát.” Giữ bộ đếm nhỏ, không thúc giục sưu tầm.
- Giải thích nhẹ rằng nhật ký lưu trên thiết bị và vẫn dùng được trong phiên khi lưu trữ bị chặn.

## 6. Thành phần và chất liệu UI

- **Nút:** nhóm nền giấy bo 8–12px, icon nét mảnh; vùng chạm ít nhất 44 × 44 CSS px. Icon nhỏ được nhưng hit area phải đủ lớn.
- **Panel:** giấy ấm hoặc nền tối dịu theo thời điểm, viền 1px. Nhóm nút không blur hoặc bóng hover; drawer dùng nền giấy đục và bóng mềm nhẹ.
- **Bóng:** bóng mềm rất nhẹ cho panel nổi là phù hợp với repo; giữ bóng và ánh sáng tự nhiên của thế giới 3D. Không áp dụng lệnh cấm mọi bóng của mẫu catalog.
- **Dấu nhận diện:** một dấu 家 viền đất nung trong phần giới thiệu, bo 3px; không dùng watermark trên canvas.
- **Toast:** một lời ngắn, tự ẩn, không che điều khiển; dùng `role="status"` cho thông báo cần được đọc.
- **Hàng nhật ký:** chỉ ghi tên khoảnh khắc đã gặp. Không có trạng thái chưa hoàn thành. Danh sách đồ vật trong giới thiệu dùng hàng có nét mảnh và mũi tên.
- **Loading:** “Đang thắp đèn cho căn nhà”, chuyển cảnh nhẹ; lỗi WebGL có lời giải thích và thao tác thử lại.
- **Media / code / table trong tài liệu tương lai:** ưu tiên đọc rõ và nét mảnh; không đưa block model hoặc placeholder media của NineTails vào UI căn nhà.

## 7. Chuyển động và âm thanh

- Hover / mở panel: `cubic-bezier(0.32,0.72,0,1)`, khoảng 400–600ms; dịch chuyển chỉ 1–3px nếu cần.
- Đổi ánh sáng và thời điểm chuyển dần theo hệ thống hiện có; không ép tốc độ UI lên animation của Mochi hoặc camera.
- Mochi có nhịp riêng: ngủ, vươn vai, đi, leo và lượn nhẹ. Không thêm cơ chế chăm nuôi bắt buộc.
- Tôn trọng `prefers-reduced-motion` cho UI và chuyển động môi trường; tránh nhấp nháy hoặc hiệu ứng xuất hiện liên tục trên chữ đọc.
- Âm thanh mặc định tắt, chỉ khởi động sau thao tác người dùng. Nhạc nền có điều khiển riêng.
- Khi tab bị ẩn, tạm dừng thế giới và âm thanh theo hành vi hiện có.

## 8. Thời điểm và ngôn ngữ

Ba trạng thái `day`, `golden`, `night` điều khiển cả cảnh và màu UI qua `body[data-time]`. Thời điểm ban đầu theo giờ địa phương; người dùng có thể chọn lại. Đây là cơ chế hiện có, không phải theme độc lập theo `prefers-color-scheme`.

- Không mang khóa lưu trữ theme của NineTails sang dự án.
- UI sử dụng `--ink`, `--muted`, `--line`, `--panel`; nếu cần token mới, đặt tên theo vai trò và định nghĩa cho đủ ba thời điểm.
- Locale là `vi` / `zh`, lưu bằng `sua-bea.locale.v1`; dùng luồng `t()` và `localize()` đang có.
- Khi đổi ngôn ngữ, giữ nguyên thế giới, sách đang đọc và các phát hiện; cập nhật nhãn, title, description và `html[lang]`.
- Không thay nội dung tiếng Trung có ý nghĩa của repo chỉ vì mẫu gốc cũng có chữ Hán. Mục tiêu là thay nhận diện vay mượn, giữ trải nghiệm song ngữ của Sữa Bea.

## 9. Kỹ thuật và phạm vi

- Stack: **Vite + TypeScript + Three.js**, icon Lucide; static app, không backend hoặc tài khoản.
- UI và style: `src/ui/UI.ts`, `src/ui/Journal.ts`, `src/ui/localize.ts`, `src/ui/styles.css`.
- Bản dịch và sách: `src/data/i18n.ts`, `src/data/quotes.ts`.
- Chất liệu / cảnh: `src/world/materials.ts`, `src/world/Room.ts`; thời điểm: `src/systems/TimeOfDay.ts`.
- Font tải duy nhất qua Google Fonts trong `index.html`, có fallback hệ thống; không dùng `next/font`, App Router hoặc Tailwind.
- Các đề xuất trang trí trong tài liệu là tùy chọn; ưu tiên khả năng đọc, điều khiển và cảnh 3D trước.
- Đợt refactor đã sửa UI, lời giao diện và tương phản chữ đọc trên giấy 3D. Giữ nguyên nội dung sách, mô hình, camera, ánh sáng, hành vi thú cưng, asset, khóa lưu trữ và API WebMCP; không cài skill vào Codex hoặc deploy.

## 10. Kiểm tra khi triển khai giao diện

- Kiểm tra desktop và mobile, cả Trung / Việt, đủ ban ngày / hoàng hôn / ban đêm, trời quang / mưa.
- Kiểm tra chữ Việt có dấu, chữ Trung đủ glyph, font fallback và lời nhắn trên giấy 3D.
- Kiểm tra focus, thứ tự Tab, nhãn icon, Esc, nút chọn đồ vật và vùng chạm.
- Kiểm tra drawer, loading, lỗi WebGL, toast và trạng thái chưa có phát hiện.
- Kiểm tra đổi ngôn ngữ khi đang đọc, giảm chuyển động, âm thanh tắt / bật và bộ nhớ bị chặn.
- Chạy `pnpm build` và `pnpm test` khi thay đổi mã nguồn; chỉ ghi nhận kiểm tra hình ảnh / hiệu năng đã thực sự làm.
- Không coi số phát hiện là mục tiêu bắt buộc hoặc thêm phần thưởng gây áp lực.

## 11. Token UI đã triển khai

| Token | Ban ngày | Hoàng hôn | Ban đêm |
| --- | --- | --- | --- |
| `--paper` | `#F9F9F0` | `#F7EDDB` | `#28343C` |
| `--hover` | `#EDEEE2` | `#EFE1C7` | `#35434B` |
| `--selected` | `#E0E5D6` | `#E6D5B6` | `#43544F` |
| `--selected-ink` | `#3F5138` | `#59452D` | `#FFF8E5` |
| `--focus` | `#73572E` | `#77502C` | `#E4BC85` |
| `--seal` | `#A15C3B` | `#A15C3B` | `#E2A77F` |

Locale vẫn đổi qua nhóm ngôn ngữ bên ngoài drawer không modal. Đổi locale hoặc cập nhật nhật ký giữ focus theo hành động/đồ vật và giữ scroll. Mobile ẩn các nhóm nút bị sheet che; đọc sách đặt các nhóm khám phá thành `inert`. Nút đóng drawer ở header cố định, thân panel cuộn riêng. Tooltip nằm trong viewport, toast xuống dòng.
