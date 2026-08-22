# Báo cáo QA — Đợt sửa chất lượng giao diện và gameplay

| Mức độ | Hạng mục | Phát hiện | Tiêu chí nghiệm thu sau sửa |
| --- | --- | --- | --- |
| P0 | Nhân vật | Sprite cùng một asset cho mọi nhân vật và orientation theo plane gây cảm giác lộn đầu. | Avatar dựng bằng mesh luôn đứng đúng chiều; mỗi lựa chọn tạo silhouette/màu/phụ kiện khác nhau. |
| P0 | Bộ chọn nhân vật | Lựa chọn chỉ đổi nhãn/điểm màu, không đổi người chạy hay năng lực. | Nhân vật đang chọn hiện rõ trong menu, trên đường chạy và có chỉ số riêng. |
| P1 | HUD | Nhiều cluster định vị tuyệt đối cùng toast, gợi ý và cảm ứng gây chồng chéo. | Trong lượt chạy chỉ còn top bar, status nhỏ và một vùng điều khiển phù hợp thiết bị. |
| P1 | Điều khiển | Giữ phím có thể gửi lệnh lặp; swipe không bắt pointer; hitbox dùng số cố định. | Phím lặp không spam hành động, swipe ổn định, hitbox phân loại theo vật thể/trạng thái. |
| P2 | Menu & onboarding | Tutorial tự bật phủ toàn bộ menu; CTA không phản ánh nhân vật chọn. | Tutorial chỉ mở khi người chơi chủ động chọn; CTA nêu đúng tên nhân vật đang chạy. |

## Hướng sửa được chấp thuận

Thay thế sprite phẳng bằng avatar mesh procedural để kiểm soát tư thế, animation và silhouette. Giao diện được thu gọn về bố cục menu hai vùng cuộn an toàn và HUD chỉ ba khu vực không giao nhau. Gameplay nhận character profile thật cho lực nhảy, thời lượng trượt, điểm thưởng và khiên.

## QA hồi quy — 22/08/2026

| Mức độ | Hạng mục | Phát hiện | Tiêu chí nghiệm thu sau sửa |
| --- | --- | --- | --- |
| P0 | Khởi chạy lượt chơi | Nút “Chạy cùng Cinnamoroll” không gửi lệnh bắt đầu khi trường tên trống. | Tên không được là điều kiện để chơi; bấm Chạy phải luôn mở gameplay. |
| P1 | Luồng lưu điểm | Khi chưa có tên, game cần hỏi tên ở màn kết quả thay vì cấm người chơi trải nghiệm. | Form tên xuất hiện ở kết quả; chỉ gửi điểm khi người chơi xác nhận. |
| P2 | Bảng điểm | Top 30 hiện hiển thị các entry public theo điểm giảm dần. | Giữ kiến trúc xếp hạng; kiểm thử lại dữ liệu sau sửa P0. |

### Phân công khắc phục

Phần **logic** sẽ bỏ validation tên khỏi nút bắt đầu, tách sự kiện bắt đầu game khỏi việc gửi điểm, và chỉ tự lưu khi đã có tên hợp lệ. Phần **giao diện** sẽ biến màn kết quả chưa có tên thành một lời mời rõ ràng để đặt tên và lưu hạng, không tạo dead-end hay ép người chơi quay lại menu. QA sẽ kiểm thử lại menu, gameplay, game-over, lưu điểm và Top 30 trên cả Manus và GitHub Pages.

### Kết quả kiểm thử sau sửa P0

Tại preview cục bộ, nhấn “Chạy cùng Cinnamoroll” khi tên trống đã chuyển ngay sang gameplay: canvas, HUD, điểm và quãng đường cùng hoạt động. Hạng mục P0 được khắc phục ở môi trường phát triển; còn cần xác nhận ở bản public sau build và checkpoint.

Lượt kiểm thử không tên cũng đã đi tới game-over, hiển thị form “Tên hiển thị trên Top 30” cùng nút “Lưu & xem hạng”, và nút “Về màn hình đầu” quay về menu thành công mà không ghi dữ liệu thử. Luồng khách chơi tự do không còn dead-end.

### Phát hiện bổ sung và quyết định

| Mức độ | Hạng mục | Kết quả QA | Quyết định |
| --- | --- | --- | --- |
| P1 | Responsive mobile | Chữ thương hiệu từng chồng lên nút hướng dẫn ở chiều rộng 375px. | **Đã sửa:** ẩn nhãn chữ thương hiệu ở mobile, vẫn giữ biểu tượng; menu không còn chồng lấn. |
| Theo dõi | Renderer preview | Dev log ghi lỗi biên dịch vertex shader của Babylon trong môi trường preview, nhưng gameplay, HUD và game-over vẫn render; browser console trong lượt QA không có lỗi mới. | **Chưa thay đổi:** không đủ bằng chứng đây là lỗi người chơi; tiếp tục theo dõi ở bản production, không thay đổi pipeline render đang hoạt động. |
| Không cần sửa | Tên trống | Trước đây bị coi là lỗi do chặn game. | **Đã đổi thiết kế:** tên là tùy chọn để chơi, bắt buộc chỉ khi lưu điểm. |

### Phát hiện phát hành P0

Ngay sau checkpoint `634209be`, bản Manus tại `https://sanriodash-ygyeg6qd.manus.space/?v=qa-p0-634209be` vẫn hiển thị placeholder cũ “Ví dụ: Mây Nhỏ” và tiếp tục chặn Start khi tên trống. Trong khi đó preview cục bộ đã hoạt động đúng. Đây là **lỗi phát hành/cache P0**, không phải lỗi logic hiện tại; cần xác minh bundle public và chỉ bàn giao khi domain đã nhận đúng bundle mới.

Sau khi bundle `index-D7hS6PMZ.js` được thay thế trên CDN, kiểm thử lại cùng domain với cache-buster xác nhận placeholder mới “Có thể nhập sau khi chơi” và nút Chạy đã mở gameplay, HUD, đường chạy cùng cảnh báo NHẢY khi tên trống. P0 được **khắc phục trên Manus public**.

GitHub Pages cũng nhận bundle tên tùy chọn. Kiểm thử trực tiếp đã chuyển từ menu không tên sang lượt chơi, rồi tới game-over với form đặt tên và nút “Lưu & xem hạng”; không ghi dữ liệu thử. Hình nền của menu được nạp lại sau khi gameplay bắt đầu, xác nhận asset origin Manus vẫn phục vụ được cho Pages.

Để kiểm tra sâu luồng Start, QA đã gắn bộ ghi nhận tạm thời vào `skydash:state` và `window.fetch` **sau khi menu tải xong**, trước một lượt không tên mới. Điều này cô lập event và request phát sinh riêng bởi thao tác bắt đầu lượt chơi.

Kết quả recorder trên GitHub Pages: state lần lượt có `menu → playing → gameover`; danh sách request sau click Start là rỗng. Vì vậy, lệnh bắt đầu được truyền qua cầu event nội bộ và không bị phụ thuộc hay bị chặn bởi API leaderboard.
