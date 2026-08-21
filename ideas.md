# Ý tưởng thiết kế — Sanrio Sky Dash

## Ba hướng phong cách

### 1. **Mây Bông & Kẹo Ngọt**
**Giới thiệu rất ngắn:** Một thế giới bay trên tầng mây, mềm như len bông và giàu cảm giác thủ công, đặt sự đáng yêu dễ chịu lên trước nhịp độ căng thẳng. Các màu sherbet dịu, chuyển động nảy nhẹ và các bảng UI như sticker tạo cảm giác được sưu tầm.
**Xác suất:** 0.07

### 2. **Nhật Ký Dán Hình Harajuku**
**Giới thiệu rất ngắn:** Game được trình bày như một cuốn scrapbook sống động, dùng băng dính washi, tem nhãn, bút highlight và khung ảnh xé tay. Năng lượng tinh nghịch, nhiều mảng màu và đậm tính cá nhân.
**Xác suất:** 0.03

### 3. **Đêm Lễ Hội Hoshi**
**Giới thiệu rất ngắn:** Một đường chạy giữa lễ hội đèn sao, nền indigo sâu với pháo giấy, đèn lồng và những điểm neon nhỏ. Hướng này mang lại nhịp điệu nhanh và lấp lánh hơn, nhưng vẫn thân thiện.
**Xác suất:** 0.09

---

## Hướng được chọn — **Mây Bông & Kẹo Ngọt**

### Design Movement
**Kawaii editorial game UI** kết hợp giữa minh hoạ sách thiếu nhi Nhật Bản, đồ chơi vinyl mềm mại và bề mặt giấy thủ công. Toàn bộ trò chơi phải trông như một hộp đồ chơi bầu trời cao cấp thay vì một giao diện di động sao chép.

### Core Principles
1. **Silhouette trước chi tiết:** Mỗi nhân vật, chướng ngại vật và vật phẩm cần nhận ra ngay từ đường viền hình dáng.
2. **Độ sâu mềm:** Các lớp mây, nền xa, đường chạy và vật thể gần tạo cảm giác không gian nhưng không dùng hiệu ứng nặng nề.
3. **Sưu tầm có cảm xúc:** Thành tựu, nhân vật và phụ kiện thể hiện như sticker hoặc huy hiệu được trân trọng.
4. **Động tác có độ nảy:** Tất cả phản hồi quan trọng — nhảy, nhặt sao, va chạm, đổi thẻ nhân vật — dùng độ nảy nhẹ và tốc độ rõ ràng.

### Color Philosophy
Nền chủ đạo là **xanh trời sữa** và **kem vanilla** để tạo cảm giác rộng, sáng và dễ đọc. Các màu sherbet (hồng đào, vàng pudding, xanh mint) dùng riêng cho tín hiệu gameplay. Những màu nhấn tối như **mực blueberry** chỉ xuất hiện ở chữ và viền để neo thị giác, không để màn hình trở nên quá ngọt hoặc phẳng.

### Layout Paradigm
Game chiếm toàn màn hình theo cấu trúc **khung postcard đang mở**: HUD bám vào các góc như tem thư, đường chạy xuyên giữa màn hình theo phối cảnh ba làn, còn bộ chọn nhân vật và màn hình kết quả trượt lên như các ngăn kéo sticker. Không dùng một trang đích căn giữa; trạng thái menu và gameplay là các lớp không gian khác nhau.

### Signature Elements
1. **Cloud-ribbon track:** Ba làn đường là dải mây cuộn có viền kem và các vạch sao bay.
2. **Puffy sticker cards:** Nhân vật và nhiệm vụ nằm trên thẻ có viền lượn, lỗ bấm và bóng giấy mềm.
3. **Wish-star confetti:** Sao vàng có vệt lấp lánh xuất hiện khi thu thập, phá kỷ lục hoặc hoàn thành mục tiêu.

### Interaction Philosophy
Người chơi luôn biết cần làm gì trong một nhịp nhìn. Các nút có hình học rõ, phản hồi bằng nén nhẹ khi bấm; thao tác chạy chỉ dùng ba làn, nhảy và trượt. Hệ thống tiến trình được giải thích qua các mẫu hình trực quan, không cần khối hướng dẫn dài.

### Animation
Nhân vật chạy có nhịp bob nhỏ; nhảy có squash-and-stretch; đổi làn dùng easing êm nhưng đáp ngay. Mây nền trôi chậm theo parallax, các vật phẩm xoay tối giản, và banner mục tiêu hoàn thành lướt ngang rồi tan như bụi sao. Tôn trọng `prefers-reduced-motion`: giữ phản hồi trạng thái nhưng giảm các chuyển động trang trí liên tục.

### Typography System
Tiêu đề dùng **Baloo 2** (700–800), tròn, thân thiện và có độ đậm như đồ chơi. Phần UI dùng **Nunito Sans** (600–900) để nhanh, rõ, dễ đọc trên màn hình nhỏ. Số điểm dùng tabular numerals đậm, có viền/đổ bóng giấy tối nhẹ để không chìm vào bầu trời.

### Brand Essence
**Sanrio Sky Dash là chuyến chạy trên mây có thể sưu tầm dành cho người chơi muốn một thử thách nhịp nhanh nhưng mềm mại, vui vẻ và giàu cá tính.**

Tính cách: **ấm áp, tinh nghịch, chăm chút**.

### Brand Voice
Headlines dùng câu ngắn, gợi hành động và thế giới tưởng tượng; CTA tạo cảm giác được mời vào một chuyến phiêu lưu thay vì một thao tác kỹ thuật. Tránh các câu chung chung.

Ví dụ: “Bầu trời đang gọi tên bạn.”

Ví dụ: “Lướt qua mây, gom thật nhiều điều ước.”

### Wordmark & Logo
Logo là **ngôi sao điều ước năm cánh cuộn thành đường mây**, phía dưới có một dấu đuôi ngắn như vệt chạy. Biểu tượng đơn sắc, không chữ, đủ rõ khi ở favicon và xuất hiện lớn trong menu.

### Signature Brand Color
**Sky Pudding — #FFD66B:** vàng pudding ấm dùng cho nút chơi chính, sao điều ước và phần thưởng cấp cao.

## Style Decisions

- Mọi trạng thái chính hiển thị đồng thời ít nhất ba dấu hiệu: dải đường mây, bề mặt thẻ sticker phồng mềm và phần thưởng/star accents Sky Pudding.
- Khung postcard kem, viền mực blueberry và các sherbet accents là lớp nhận diện xuyên suốt; màu xanh bầu trời chỉ tạo không khí nền.
- Biểu tượng ngôi sao điều ước kéo dải mây phải xuất hiện ở menu lẫn lúc chạy để nhận diện game ngay cả khi không đọc chữ.
