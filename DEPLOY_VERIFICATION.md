# Xác minh phát hành 9c05ba6a

## Manus public

Hai lần mở `https://sanriodash-ygyeg6qd.manus.space/` với cache-buster `?v=9c05ba6a` và `?v=9c05ba6a-r2` lúc 01:30–01:31 UTC ngày 23/08/2026 vẫn trả **bundle menu cũ**: tiêu đề “Chọn người bạn dẫn đường”, trường tên ngay màn đầu và ghi chú một thiết bị/một kỷ lục.

Điều này chưa phản ánh checkpoint `9c05ba6a`, nơi preview cục bộ hiển thị landing “Bay xa hơn cùng Hana”, CTA “Bắt đầu hành trình”, Kỷ lục bầu trời 3.999 từ Top 30 và bước thiết lập riêng. Không có dữ liệu leaderboard bị chỉnh sửa trong các lần kiểm tra này.

## Kết quả sau đồng bộ CDN

Lần mở thứ ba với `?v=9c05ba6a-r3` đã nhận đúng bundle mới: landing “Bay xa hơn cùng Hana”, CTA “Bắt đầu hành trình”, nút “Hướng dẫn chơi” ở thanh trên, số **3.999** kèm nhãn “Điểm dẫn đầu Top 30 tuần” và ghi chú mỗi lượt Top 30 được lưu riêng.

Nút “Xem Top 30” trên bản public mở panel đầy đủ 30 hạng. Dữ liệu thật giữ nguyên: `Long 2`, 595m, 3.999 ở hạng 1; 29 hạng còn lại là placeholder minh bạch. Footer panel đã hiển thị đúng quy tắc mới: nhiều lượt cùng tên vẫn là các dòng riêng khi vào Top 30.

## GitHub Pages

`https://long261vn.github.io/sanrio-sky-dash/?v=9c05ba6a` đã tải landing hai bước mới và các asset từ origin Manus. Ở ảnh đầu, Kỷ lục bầu trời là 0 khi truy vấn Top 30 còn đang tải; lần xem lại sau khi query hoàn tất hiển thị đúng **3.999** cùng nhãn điểm dẫn đầu. Điều này xác nhận bundle tĩnh, CORS/API leaderboard và đồng bộ điểm kỷ lục trên Pages đều hoạt động.
