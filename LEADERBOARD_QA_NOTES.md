# Ghi nhận QA leaderboard

- Ngày kiểm tra: 22-08-2026 (GMT+7).
- Menu desktop hiển thị trường **Tên người chơi** và nút **Top 30 tuần** đầy đủ, không chồng lấp với bộ chọn nhân vật.
- Modal Top 30 ở trạng thái chưa có dữ liệu hiển thị rõ mùa `2026-08-22` và thông điệp trống thân thiện.
- Một lượt chơi thử đã đi tới màn kết quả với điểm 168, 0 sao và 20 m. Vùng **Lưu điểm dưới tên** gồm input và nút lưu cạnh nhau, các nút xem bảng / chơi thêm / đổi bạn đồng hành vẫn đọc được.
- Không gửi dữ liệu thử vào bảng công khai; dữ liệu database được xác nhận đang có 0 mùa và 0 entry trước kiểm tra.
- Sau checkpoint `1091aead`, URL Manus công khai vẫn trả bundle menu cũ (chưa có input tên hoặc Top 30) và endpoint API trả 500. Đã bắt đầu xử lý bằng cách tách chunk Babylon để build fullstack không bị dừng khi render.
- Sau khi tách chunk Babylon, build production và bundle GitHub Pages đều thành công. Bản Manus public và `long261vn.github.io/sanrio-sky-dash/` đã hiển thị trường nhập tên cùng nút **Top 30 tuần**; GitHub Pages vẫn tải ảnh từ Manus storage đúng cách.
- Trên GitHub Pages, modal **Top 30 tuần** mở thành công và đọc API cross-origin: hiển thị mùa `2026-08-22`, trạng thái rỗng và nội dung reset lười. Không có lỗi CORS hay lỗi tải ảnh được quan sát.
- Một lượt chơi trực tiếp trên GitHub Pages đã tải canvas 3D, mascot, đường chạy, sao, đệm thấp, biển nhắc **NHẢY** và điều khiển bàn phím. Lượt kết thúc hiển thị lại form lưu điểm; không nhập tên hoặc gửi entry thử vào bảng công khai.
- Console của GitHub Pages sau lượt thử không ghi lỗi runtime hoặc tải audio. Đã bổ sung `404.html` để đường dẫn con của Pages quay lại base `/sanrio-sky-dash/`.
- Workflow Pages của commit `e2215a59` hoàn tất thành công. Truy cập đường dẫn con `/sanrio-sky-dash/duong-dan-kiem-thu` đã tự quay về menu game, xác nhận fallback hoạt động.
- Bản Manus công khai sau checkpoint `53f776f3` tải menu có trường tên người chơi và nút Top 30. Luồng tự lưu cần được xác minh với hai lượt thật của người chơi sau bản phát hành này.
- QA local với dữ liệu thật: Top 30 hiển thị hai entry theo đúng thứ tự `7.211` rồi `4.033`. Modal chỉ có nút đóng và nút “Về màn hình đầu”, không tự đóng.
- Bản Manus công khai checkpoint `10fa9891` hiển thị ba entry thật theo thứ tự `7.211`, `4.033`, `1.012`; entry mới của Nancy xuất hiện ở hạng 3. Modal vẫn giữ mở cho đến khi người chơi bấm đóng hoặc “Quay lại game”.
- Sau làm mới cache bằng tham số truy vấn mới, bản Manus vẫn tải menu và dữ liệu mùa hiện hành. Một phiên trình duyệt tự chuyển về trang trống sau thao tác click bị stale; không ảnh hưởng dữ liệu hoặc bundle.
- Kiểm tra trực tiếp bundle đang phục vụ bằng HTTP xác nhận cả Manus và GitHub Pages đều chứa nhãn “Về màn hình đầu”, tức đã nhận luồng bảng điểm mới; ảnh browser cũ giữ chuỗi “Quay lại game” là cache hiển thị.
