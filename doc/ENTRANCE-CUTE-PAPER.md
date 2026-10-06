# Hai cánh cửa — Cute Xuan Paper

Ngày cập nhật và kiểm tra: 06/10/2026. Hướng mới theo yêu cầu: dễ thương, nhẹ và ấm; giữ kiến trúc Trung Hoa và nền giấy Xuan Paper.

## Giao diện

- Gỗ màu mật ong sáng, tường kem sạch, ngói bo mềm và nét vẽ màu nước nhẹ.
- Đèn giấy tròn, ghế rạp hồng đất mềm, màn hình phong cảnh sáng; sách, chén trà và bé mèo cam mũm mĩm.
- Cây trúc và hoa trắng nhỏ, màu sage/peach nhẹ trong minh họa; màu UI và typography tiếp tục theo DESIGN.md.
- Bản tối dùng nền Night Ink nhưng giữ cả mặt nhà và nội thất sáng rõ, cây xanh và mèo cùng nét vẽ truyện tranh.
- Asset mới được dùng trong CSS nền desktop và hai ảnh cắt trên mobile.

## Kiểm chứng

- `pnpm build`, `pnpm lint`, `git diff --check`: đạt.
- Playwright 320/390/768/1440px × Việt/Trung × sáng/tối: 16 tổ hợp; không tràn ngang, đúng asset theo theme, đúng locale, đúng liên kết rạp/nhà.
- Không có page error hoặc response lỗi tài nguyên local trong luồng kiểm tra.
- 8 ảnh desktop/tablet/mobile và phần cuối mobile; footer mobile hiển thị đủ.
- Fixture: `output/playwright/check-cute.cjs`; ảnh `output/playwright/cute-*.png`, được gitignore.

Kiểm tra Chromium với viewport mô phỏng. Chưa thử thiết bị thật hoặc Safari/Firefox. Trong đợt chỉnh minh họa này, các liên kết được kiểm tra bằng đích URL; không kiểm tra lại phát phim/backend hay tương tác căn nhà 3D.

## Asset và prompt

Dùng **imagegen tích hợp**; chuyển PNG sang JPEG chất lượng 88 bằng `sips`. Hai asset production:

- [Cute Paper sáng](../public/images/entrance-cute-paper.jpg): 1586 × 992px, khoảng 588KB.
- [Cute Paper tối](../public/images/entrance-cute-paper-night.jpg): 1586 × 992px, khoảng 603KB.

Prompt cuối cho bản sáng (bản kiến trúc Trung Hoa trước đó là edit target):

> Use case: style-transfer. Asset type: cute welcoming website hero illustration on Xuan rice paper. Edit target: attached Chinese two-door courtyard picture. Completely redraw its visual style as a gentle, very cute hand-painted children's storybook gouache/watercolor illustration with simple clean rounded forms, delicate warm ink outlines, airy creamy paper and very soft shadows. Retain traditional Chinese architecture: two timber lattice door entrances, subtly upturned grey tiled mini awnings, paper lanterns, small wooden 影 / 家 plaques. Keep exact wide 1586:992 canvas, same approximate centers x530 and x1070, eave tops near y150 and thresholds y740; blank paper above scene and below y790 for real HTML text. Make timber pale honey oak, clean smooth surfaces, neat cream plaster, simplified rounded grey-beige roof tiles with only a few strokes, a friendly cozy miniature house feeling. Doors open wide and interiors are BRIGHT, warm, inviting. Left cinema: two plush rounded dusty-rose seats and a softly glowing screen showing an adorable simple illustrated landscape with rounded clouds; no human silhouettes or mysterious monochrome film. Right reading room: a small wooden reading desk, a few colorful cream-spined books, a cushioned chair, a teacup, warm round paper lantern; a VERY CUTE plump sleeping cream-and-ginger cat prominently curled on a little round mat, tiny pink nose and soft rounded ears. Exterior: a few small round ceramic pots of delicate sage-green leaves and tiny white flowers, one small bamboo sprig; generous empty paper around everything. Palette: warm Xuan Paper #F6F2E9, pale honey wood, warm diluted ink, very soft sage and peach accents; tiny cinnabar seal-red only as small accent. Chinese courtyard identity but sweet, light and cozy, like a friendly illustrated picture book. Reduce small details drastically. NO aged dark wood, scratches, decay, dirt, cracks, black ink splatter, gritty texture, dense vegetation, dramatic dark interiors, heavy cinematic shadows, hard lighting, spooky or abandoned-house feeling, photorealism or 3D render. No European arches, Japanese torii, imperial palace, gold opulence, neon. No website UI, captions, headline or watermark. Paper margins should blend into #F6F2E9.

Prompt cuối cho bản tối (bản cute sáng là edit target):

> Use case: lighting-weather. Asset type: cute cozy evening variant for a Xuan Paper website dark theme. Edit target: the attached cheerful storybook Chinese two-door illustration. Keep the EXACT same 1586:992 aspect ratio, architecture, scale and object placement, roof silhouette, two open honey-wood lattice doors, bamboo and tiny white flowers, 影 and 家 plaques, rosy rounded cinema seats, cheerful landscape screen, book room and cute plump orange-and-cream sleeping cat. Change only surrounding paper background to warm dark ink #131010 with very subtle paper grain, and make lighting feel like a friendly illustrated bedtime story. CRITICAL: the two houses and both interiors remain BRIGHT, evenly lit, and pastel; pale honey wood, creamy walls and sage foliage stay clearly visible, almost as light and cute as the original. Light all facade surfaces gently and evenly, not just the lanterns. Round paper lanterns give small soft creamy apricot glows, not strong orange spotlights. Keep the screen bright and cheerful and books easy to see. Rendering stays flat, delicate, simple children's gouache/watercolor with soft rounded contours and warm fine linework. Foliage remains pastel sage green rather than black or metallic gold. Keep the cat extra sweet, round face, tiny pink nose. No ominous mood, darkened doorway interiors, black silhouettes, dramatic shadows, dark amber wash, high contrast, eerie light, desaturated sepia, gritty aging, realistic night lighting, 3D render, photorealism, stars or moons. No added objects or text, no website UI, no watermark. It should feel safe, soft, warmly welcoming and cute at a glance in dark mode.

