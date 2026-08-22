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

### Kiểm tra dữ liệu thật

Mùa hiện hành có khóa `2026-08-22`, bắt đầu đúng thứ Bảy và có mốc reset kế tiếp được lưu. Ba entry thật đang được đọc theo thứ tự điểm giảm dần là Nancy (25.838), Long (7.211) và Long (4.033). Điều này xác nhận truy vấn Top 30 đọc được data công khai và thứ tự hiện thời phản ánh điểm số.

### QA vật phẩm và chỉ dẫn — vòng sửa mới

Đã xác định ba nguyên nhân trực tiếp: bảng cũ chỉ render số entry thật; cùng `playerId` chỉ đổi tên nếu điểm cải thiện; và các vật vàng giữa là sao trang trí cố định ở làn giữa. Bản sửa chuyển Top 30 thành 30 hạng có placeholder “Đang chờ chuyến bay”, giữ một kỷ lục/mùa nhưng luôn cập nhật tên hiển thị, bỏ sao trang trí gây nhiễu, nâng khiên/vòng gió lên cao hơn mặt đường và thêm hướng dẫn năm vật phẩm. Ảnh QA cho thấy ba thẻ hành động cốt lõi cùng các thẻ khiên/gió đã xuất hiện theo một ngôn ngữ hình ảnh chung; phần dưới của hướng dẫn có thể cuộn để đọc trọn nội dung.

Kiểm tra trực tiếp preview xác nhận panel Top 30 hiển thị bốn entry thật ở hạng 1–4 và các hạng 5–30 là ô chờ rõ ràng, không phải người chơi giả. Thanh cuộn dọc xuất hiện bên trong danh sách, còn header/footer giữ cố định để người chơi kéo xem toàn bộ danh sách.

Demo khiên ban đầu di chuyển quá nhanh để lưu ảnh trong khung kiểm tra. Đã hạ tốc độ và đưa vật phẩm gần hơn riêng cho URL QA `?demo&pickup=shield` hoặc `?demo&pickup=gust`, không ảnh hưởng nhịp game thật; mục tiêu là xác nhận trực quan chiều cao, silhouette và phản hồi nhặt vật phẩm.

Kiểm tra hướng dẫn sau khi thay sprite xác nhận cả khiên cầu vồng và vòng gió mint xuất hiện với silhouette lớn, đầy đủ và tách biệt màu sắc. Hai thẻ này dùng đúng sprite runtime, nên phần mô tả và vật thể người chơi gặp không còn là hai hệ minh hoạ khác nhau.

Sau checkpoint `10c2f8a9`, bản public Manus tại thời điểm kiểm tra đầu tiên vẫn đang trả bundle menu trước đó (chưa thấy nút “Hồ sơ mới”). Đây là độ trễ CDN/deploy cần chờ và xác minh lại bằng fingerprint bundle trước khi yêu cầu người chơi kiểm thử; không coi đó là lỗi UI của mã nguồn mới.

Fingerprint bundle công khai sau đó đã đổi và chứa nhãn “Hồ sơ mới”. Kiểm tra trực tiếp bản Manus xác nhận menu có hướng dẫn một hồ sơ–một kỷ lục, còn panel Top 30 hiển thị đủ hạng 1–30 với bốn entry thật và các ô chờ có nhãn minh bạch, thanh cuộn nằm trong panel.

QA runtime public qua demo đã nhặt thành công cả hai power-up. Khiên hiển thị timer 5 giây trên HUD và vòng năng lượng quanh người chạy; vòng gió trả message `+90 điểm · combo +0.5` và HUD chuyển multiplier từ ×1.0 sang ×1.5. Điều này xác nhận collision, tín hiệu và phần thưởng khớp tutorial mới.

Ảnh mobile 390×844 xác nhận menu vẫn giữ CTA chạy, “Hồ sơ mới” và Top 30 trong vùng nhìn thấy; guide v2 cuộn dọc, hiển thị lần lượt năm thẻ mà không chồng chữ hay cắt vật thể. Đây là hành vi mong muốn cho màn hình hẹp.

Panel Top 30 tại mobile giữ header/footer trong vùng nhìn thấy, nội dung danh sách cuộn bên trong và có cue “kéo để xem đủ 30 hạng”. Các ô hạng 5–30 được trình bày mờ có chủ đích để phân biệt với entry thật, không làm người chơi hiểu nhầm là điểm giả.

Hồi quy runtime desktop sau batch mới: demo chạy liên tục qua low hurdle khi nhận chuỗi lệnh nhảy, sau đó vẫn đạt 220m và chuyển sang prompt trượt cho cloud gate thay vì game-over. HUD cũng xác nhận sao tăng multiplier (×3.7) và hoàn tất mốc 10/10 với thưởng 250 điểm. Đây là bằng chứng các nhóm sao–nhảy–trượt vẫn vận hành cùng khiên/vòng gió sau thay đổi UI/asset.

Phiên kiểm thử trượt liên tục bị chuyển sang trang trống sau khi gửi phím, nên chưa dùng làm bằng chứng pass cho cloud gate; hạng mục trượt vẫn giữ mở trong checklist cho lượt QA kế tiếp.

Đã chạy lại cổng mây trong preview cục bộ với chế độ QA chậm và chuỗi lệnh `ArrowDown`; game vẫn ở trạng thái playing sau khi vật thể đi qua, điểm tăng lên 110 và không xuất hiện game-over. Như vậy thao tác trượt–cloud gate vượt qua hồi quy runtime.

Ảnh runtime mobile xác nhận HUD gọn, prompt nhảy và bốn nút điều khiển cảm ứng có vùng chạm riêng, không chồng lấn trên canvas. Demo khiên cũng hiển thị nhân vật, làn đường và nút đổi làn/nhảy/trượt đúng vị trí trên 390×844. Các lượt nhặt/tương tác trên mobile cần tiếp tục được xác nhận bằng thao tác chạm trực tiếp trước khi đóng checklist.

Hướng dẫn desktop sau sửa hiển thị khiên cầu vồng và vòng gió mint bằng asset đầy đủ, căn giữa trong hai thẻ riêng, không bị cắt hoặc dùng nền sai. Panel có thể cuộn để xem phần “Điểm tính thế nào?”, bao gồm điểm chạy, sao, combo, mốc 10 sao, nhảy/trượt, vòng gió và vai trò bảo vệ của khiên.

Lượt demo với spawn mới bắt đầu không có vật thể nằm sẵn giữa đường. Sau đó sao tiến dần từ xa và khi được lấy, HUD đổi từ 0 lên 1 sao, combo tăng từ ×1.0 lên ×1.2, đồng thời toast hiển thị chính xác `Sao điều ước: +32 · combo +0.2`. Điều này khớp công thức hiển thị và quy tắc spawn đã kiểm thử đơn vị.
