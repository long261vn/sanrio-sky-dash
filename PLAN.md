# Game Plan: Sanrio Sky Dash

## Risk Tasks

### 1. Đường chạy sinh vô hạn và tăng độ khó
- **Why isolated:** Nhịp sinh chướng ngại, vật phẩm và tốc độ phải tạo được áp lực nhưng không tạo tình huống không thể vượt qua.
- **Approach:** Dùng hàng đợi thực thể đơn giản theo ba làn, seed giả ngẫu nhiên khi `?demo`, khoảng cách sinh tối thiểu và quy tắc một chướng ngại chính trên mỗi nhịp.
- **Verify:** Khoảng cách giữa vật thể hợp lý ở tốc độ đầu và cuối, ba làn có thể tiếp cận, màn demo tự né được các va chạm gần.

### 2. Chuyển trạng thái chạy, nhảy, trượt và va chạm
- **Why isolated:** Jump/slide cần phản hồi lập tức và xét va chạm khác nhau theo từng loại chướng ngại.
- **Approach:** Player có state tối giản gồm làn hiện tại, vận tốc dọc, bộ đếm trượt và khiên; va chạm dùng khoảng cách theo trục Z/X thay vì physics engine.
- **Verify:** Chuyển chạy → nhảy → đáp mượt; chạy → trượt → chạy mượt; macaron chỉ vượt an toàn khi nhảy, mây mưa chỉ vượt an toàn khi trượt hoặc có khiên.

## Main Build

- Dựng cảnh Babylon 2.5D với camera cố định, đường chạy mây ba làn, lớp mây trang trí và ánh sáng dịu.
- Xây dựng nhân vật chibi thay đổi màu/silhouette theo tám lựa chọn: Cinnamoroll, Pompompurin, My Melody, Kuromi, Badtz-Maru, Keroppi, Gudetama và Hello Kitty.
- Xây dựng HUD DOM gồm điểm, khoảng cách, sao điều ước, nhiệm vụ, pausing, chọn nhân vật, hướng dẫn và màn hình kết quả.
- Thêm vật phẩm sao, khiên cầu vồng, streak, kỷ lục cục bộ, tiến trình nhiệm vụ và điều khiển bàn phím/chạm.
- Thêm `?demo` chạy tự động có seed để kiểm tra hình ảnh gameplay không cần thao tác tay.
- **Assets needed:** Nền bầu trời 1920×1080, hình tham chiếu gameplay 16:9, logo ngôi sao, bộ nhân vật và bộ chướng ngại/vật phẩm theo phong cách kawaii.
- **Verify:**
  - Phím mũi tên/A-D, Space/W, S hoạt động và cảm ứng vuốt/các nút HUD đưa nhân vật phản hồi đúng.
  - Điểm, sao, quãng đường và nhiệm vụ cập nhật khi chạy.
  - Màn tạm dừng, game over, retry và chọn nhân vật hoạt động, kỷ lục được lưu cục bộ.
  - Không có UI tràn/chồng lấn rõ rệt ở desktop và mobile.
  - Không có texture hay asset bị thiếu, không có lỗi console trong lượt chạy.
  - Bố cục, tỉ lệ camera, mật độ đối tượng và bảng màu nhất quán với visual target.
