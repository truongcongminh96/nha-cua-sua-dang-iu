-- Đổi mã phòng chung của Milk Cinema.
-- Chạy trong Supabase SQL Editor (hosted) hoặc `psql` (local). KHÔNG commit mã thật.
-- Thay 000000 bằng mã 6 chữ số mới, chạy, rồi gửi mã cho người kia qua kênh riêng.
update milk_private.shared_cinema
set pin_digest = extensions.digest('000000', 'sha256')
where id;
