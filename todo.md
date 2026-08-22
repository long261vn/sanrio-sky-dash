# Hạng mục cập nhật — Chạy Đua Cùng Hana

- [x] Thêm giới hạn gửi điểm theo playerId và kiểm tra tính hợp lệ cơ bản giữa điểm, sao, quãng đường.
- [x] Viết test cho submit điểm mới, chỉ giữ điểm cao nhất, sắp hạng score/stars và giới hạn Top 30.
- [ ] Kiểm thử end-to-end lưu điểm từ màn kết quả và hiển thị dữ liệu thật trong Top 30.
- [ ] Xác minh reset mùa lười trên dữ liệu mùa mới mà không tạo dữ liệu giả trong bảng công khai.
- [x] Trỏ bundle GitHub Pages đến API leaderboard Manus và giới hạn CORS đúng origin GitHub Pages.
- [x] Kiểm thử các quy tắc thuần: hợp lý điểm–sao–quãng đường, chỉ thay kỷ lục tốt hơn, thứ tự score→stars→submittedAt và giới hạn 30 dòng.
- [x] Viết test mock DB cho `submitScore`/`listLeaderboard` để xác nhận ghi và đọc dữ liệu theo API.
- [x] Chẩn đoán nguyên nhân lượt chơi sau không lưu được điểm vào bảng xếp hạng.
- [x] Tự động gửi điểm hợp lệ khi lượt chơi kết thúc, không yêu cầu bấm nút lưu.
- [x] Hiển thị hạng đạt được trong Top 30 và mở bảng xếp hạng khi người chơi vào bảng.
- [x] Làm mới bảng xếp hạng theo dữ liệu API sau mỗi lượt và xử lý rõ trạng thái ngoài Top 30/lỗi lưu.
- [x] Tự trở về màn hình chọn nhân vật sau thông báo kết quả và bảng xếp hạng.
- [ ] Kiểm thử hai lượt liên tiếp bằng cùng người chơi, phản hồi hạng và luồng quay về màn đầu.

- [x] Nâng cấp game lên hạ tầng có cơ sở dữ liệu và API an toàn.
- [x] Tạo dữ liệu mùa, điểm số, tên người chơi và chỉ mục xếp hạng Top 30.
- [x] Lập API ghi điểm có validation, giới hạn tên và reset mùa khi có lượt đầu tiên sau thứ Bảy.
- [x] Thêm nhập tên người chơi và bảng xếp hạng đẹp ở menu/kết quả game.
- [x] Kiểm thử Top 30, thứ tự điểm, tuần reset và trải nghiệm desktop/mobile.

- [x] Kiểm tra request hình ảnh và audio trên URL GitHub Pages để xác định lỗi tải asset.
- [x] Quyết định không sao chép asset lớn vào bundle GitHub Pages; dùng origin storage Manus công khai, ổn định và đã kiểm thử trực tiếp.
- [x] Sửa helper asset và workflow build để dùng origin asset công khai khi phát hành GitHub.
- [x] Kiểm thử bundle static với hình nền, mascot, vật cản và âm thanh cùng hiển thị.
- [x] Đồng bộ bản sửa và chạy lại workflow GitHub Pages thủ công.

- [x] Thu thập log workflow GitHub Pages thất bại và xác định step gây lỗi.
- [x] Sửa workflow hoặc cấu hình dependency/build tương ứng.
- [x] Kiểm thử lại chính lệnh build dùng trong GitHub Actions.
- [x] Đồng bộ bản sửa và chạy lại workflow GitHub Pages thành công.
- [x] Xác nhận GitHub Pages trả về trang game thay vì 404/lỗi build.

- [x] Rà soát base path, route SPA và nguồn asset để tương thích subpath GitHub Pages.
- [x] Chuẩn bị cấu hình build và workflow GitHub Pages không làm ảnh hưởng bản game đang public.
- [x] Kiểm thử build tĩnh ở đường dẫn `/sanrio-sky-dash/`.
- [x] Đồng bộ cấu hình để workflow Pages được kích hoạt.
- [x] Xác nhận URL `long261vn.github.io/sanrio-sky-dash/` sau khi GitHub hoàn tất deploy.

- [x] Mở domain công khai vừa phát hành và xác nhận trang game tải thành công.
- [x] Kiểm tra menu, lượt chơi và âm thanh khởi tạo trên bản công khai.
- [x] Đánh giá lại nhu cầu GitHub Pages sau khi bản game đã có link chơi ổn định — giữ GitHub làm nơi lưu mã nguồn, dùng domain công khai hiện tại để chơi.

- [x] Xác minh GitHub Pages đã deploy và ghi nhận URL công khai thực tế.
- [x] Kiểm tra asset, đường dẫn base và fallback SPA khi chạy dưới đường dẫn repository.
- [x] Xác nhận game tải, điều khiển và âm thanh khởi tạo đúng qua URL Pages.
- [x] Đồng bộ mọi cấu hình cần thiết và xác nhận liên kết chơi trực tuyến.

- [x] Xác minh repository công khai và trạng thái đồng bộ nhánh mặc định.
- [x] Kiểm tra xem GitHub Pages đã được cấu hình cho repository hay chưa — hiện chưa có GitHub Pages site.
- [x] Xác nhận bản game build thành công và sẵn sàng phục vụ tĩnh.
- [x] Xác định liên kết chơi trực tuyến hợp lệ hoặc hướng dẫn thao tác phát hành còn lại.

- [x] Thêm chế độ luyện tập an toàn theo ba bài: đổi làn lấy sao, nhảy qua đệm thấp và trượt dưới cổng mây.
- [x] Thêm nhãn hành động lớn, đúng màu và có hoạt ảnh khi vật cản đến gần.
- [x] Thêm chuyển động minh hoạ ngắn cho ba thẻ hướng dẫn Lấy–Nhảy–Trượt.
- [x] Bổ sung lối vào chế độ luyện tập từ menu và lối thoát rõ ràng về màn hình chọn nhân vật.
- [x] Kiểm thử luồng luyện tập, onboarding và build trước khi đồng bộ GitHub.
- [x] Lưu checkpoint để đồng bộ thay đổi với repository GitHub đã liên kết.

- [x] Xác định và sửa phép biến đổi texture làm lật hướng đệm dâu hoặc cổng mây trong canvas.
- [x] Làm lại bảng hướng dẫn thành ba thẻ hành động lớn: LẤY, NHẢY, TRƯỢT.
- [x] Dùng cùng hình asset, màu, chiều cao và mô tả ngắn với gameplay runtime.
- [x] Kiểm thử trực quan chướng ngại low/high và bảng hướng dẫn trên desktop/mobile.

- [x] Viết đặc tả một luật–một tín hiệu: vật thấp nhảy qua, vật cao trượt dưới, vật phẩm lấy bằng đổi làn.
- [x] Thay macaron hiện tại bằng vật cản thấp có vòm nhảy rõ; thay mây giông bằng cổng mây cao có khoảng trống trượt phía dưới.
- [x] Thiết kế lại biển báo, màu cảnh báo và thẻ hướng dẫn dùng cùng silhouette với gameplay.
- [x] Xây lại spawn/va chạm để chỉ yêu cầu đúng một thao tác dễ hiểu trong từng tình huống.
- [x] Kiểm thử lượt chơi từ đầu đến cấp khó cao để xác nhận mọi luật trực quan nhất quán.

- [x] Kiểm tra và sửa tài sản/đường dẫn nhạc nền cùng cơ chế khởi phát âm thanh sau thao tác chơi.
- [x] Thay hướng dẫn minh hoạ bằng thẻ dùng đúng vật thể thật: sao, macaron và mây giông.
- [x] Ghi rõ hành động theo từng vật thể: lấy, nhảy qua, trượt dưới hoặc đổi làn né tránh.
- [x] Tối ưu menu để toàn bộ chọn nhân vật và CTA vừa một viewport desktop/mobile, không phải cuộn.
- [x] Kiểm thử âm thanh và độ rõ của onboarding trên desktop/mobile.

- [x] Hoàn tất audit QA về chồng chéo giao diện, khả năng đọc và luồng gameplay.
- [x] Loại bỏ sprite nhân vật sai tư thế; thay bằng avatar procedural đứng đúng chiều, có silhouette rõ.
- [x] Khôi phục bộ chọn tám nhân vật hoạt động thực sự với tạo hình, màu và khả năng riêng.
- [x] Thiết kế lại HUD/menu theo vùng an toàn, không chồng lớp và ưu tiên thông tin khi chơi.
- [x] Sửa vòng lặp điều khiển, collision, animation và độ khó bằng kiểm thử hồi quy desktop/mobile.
- [x] Lập báo cáo QA sau sửa cùng checklist nghiệm thu trực quan và chức năng.

- [x] Xác định nhịp chuyển động chạy, nhảy và trượt riêng cho Hana.
- [x] Thêm chuyển động chạy với nảy thân, vung tai, vẫy cape và nhịp sneaker.
- [x] Thêm animation nhảy gồm take-off, tư thế trên không và nén mềm khi tiếp đất.
- [x] Thêm animation trượt với dáng thu người, nghiêng lướt và cape kéo dài theo hướng chạy.
- [x] Kiểm thử animation trong gameplay và cập nhật checkpoint bàn giao.

- [x] Thêm hướng dẫn chơi tương tác cho đổi làn, nhảy, trượt và cách đọc tín hiệu vật thể.
- [x] Thiết lập ngôn ngữ nhận diện riêng: vật phẩm sáng có viền mint/star, chướng ngại có biển cảnh báo berry/navy.
- [x] Tạo tạo hình mascot Hana mới, đáng yêu hơn với silhouette dễ đọc trong lúc chạy.
- [x] Thiết kế cấp độ khó theo quãng đường: tốc độ, nhịp spawn và tổ hợp chướng ngại tăng dần nhưng không tạo tình huống bất khả thi.
- [x] Kiểm thử tutorial, khả năng phân biệt vật thể và nhịp độ trên desktop/mobile.

- [x] Đổi tên hiển thị, metadata và các câu chữ thương hiệu thành **Chạy Đua Cùng Hana**.
- [x] Tăng tương phản đường chạy, làn, chướng ngại vật và nhân vật trong gameplay.
- [x] Tạo nhạc nền vui nhộn và bộ hiệu ứng âm thanh kawaii phù hợp.
- [x] Tích hợp âm thanh có nút bật/tắt, chỉ bắt đầu sau thao tác người chơi đầu tiên.
- [x] Kiểm thử desktop/mobile, độ tương phản, tương tác âm thanh và build cuối.
