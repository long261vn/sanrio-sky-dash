# Hạng mục cập nhật — Chạy Đua Cùng Hana

- [x] Thêm giới hạn gửi điểm theo playerId và kiểm tra tính hợp lệ cơ bản giữa điểm, sao, quãng đường.
- [x] Viết test cho submit điểm mới, chỉ giữ điểm cao nhất, sắp hạng score/stars và giới hạn Top 30.
- [x] Kiểm thử end-to-end lưu điểm từ màn kết quả và hiển thị dữ liệu thật trong Top 30.
- [x] Xác minh reset mùa lười trên dữ liệu mùa mới mà không tạo dữ liệu giả trong bảng công khai.
- [x] Trỏ bundle GitHub Pages đến API leaderboard Manus và giới hạn CORS đúng origin GitHub Pages.
- [x] Kiểm thử các quy tắc thuần: hợp lý điểm–sao–quãng đường, chỉ thay kỷ lục tốt hơn, thứ tự score→stars→submittedAt và giới hạn 30 dòng.
- [x] Viết test mock DB cho `submitScore`/`listLeaderboard` để xác nhận ghi và đọc dữ liệu theo API.
- [x] Chẩn đoán nguyên nhân lượt chơi sau không lưu được điểm vào bảng xếp hạng.
- [x] Tự động gửi điểm hợp lệ khi lượt chơi kết thúc, không yêu cầu bấm nút lưu.
- [x] Hiển thị hạng đạt được trong Top 30 và mở bảng xếp hạng khi người chơi vào bảng.
- [x] Làm mới bảng xếp hạng theo dữ liệu API sau mỗi lượt và xử lý rõ trạng thái ngoài Top 30/lỗi lưu.
- [x] Tự trở về màn hình chọn nhân vật sau thông báo kết quả và bảng xếp hạng.
- [x] Kiểm thử hai lượt liên tiếp bằng cùng người chơi, phản hồi hạng và luồng quay về màn đầu.
- [x] Thiết lập GitHub Pages tự phát hành khi checkpoint đồng bộ lên nhánh main.
- [x] Bỏ cơ chế tự đóng bảng điểm; chỉ trở về menu khi người chơi chủ động bấm nút.
- [x] Xác minh API/DB xếp entry hiện có theo score, stars và thời điểm nộp.
- [x] Làm mới dữ liệu Top 30 thật từ server sau mỗi lượt, không chỉ dựa vào cache cục bộ.
- [x] Hiển thị thông báo rõ ràng khi điểm mới không lọt Top 30 và để người chơi tự quay lại menu.
- [x] Kiểm thử dữ liệu thật có nhiều tên, thay đổi điểm cao và thứ hạng cập nhật ngay trong bảng.
- [x] Tái hiện lỗi không bắt đầu được lượt chơi trên Manus và GitHub Pages.
- [x] Kiểm tra console, network và sự kiện command/state của luồng menu đến gameplay.
- [x] Viết báo cáo QA phân loại lỗi chặn chơi, lỗi logic, lỗi UX và hạng mục không cần sửa.
- [x] Sửa nguyên nhân chặn bắt đầu lượt chơi và thêm kiểm thử hồi quy tương ứng.
- [x] Kiểm tra lại gameplay, game-over, lưu điểm và Top 30 theo một checklist phát hành thống nhất.
- [x] Sửa chồng lấn chữ thương hiệu với nút hướng dẫn ở menu màn hình nhỏ.
- [x] Tái hiện lỗi chặn bắt đầu trên Manus khi tên trống và xác nhận bản sửa start được trên preview cục bộ.
- [x] Kiểm thử trực tiếp GitHub Pages: tên trống vẫn bấm Chạy vào gameplay.
- [x] Ghi nhận network cùng transition command/state từ menu sang playing, bảo đảm không có request API chặn start.
- [x] Thêm kiểm thử hồi quy cho UI: tên trống vẫn start được và game-over hiện form đặt tên để lưu hạng.
- [x] Viết kiểm thử component SkyDashHud: tên trống gửi lệnh Start và snapshot game-over hiển thị form tên.
- [x] Quan sát hoặc kiểm thử rõ chuỗi `skydash:command` tới `skydash:state(status=playing)` không phát sinh request leaderboard.
- [x] Kiểm tra vì sao UI Top 30 chỉ hiển thị vài dòng thay vì khung đầy đủ 30 hạng có thể cuộn.
- [x] Thêm danh sách Top 30 cố định chiều cao với thanh cuộn, số thứ hạng 1–30 và trạng thái trống minh bạch.
- [x] Chẩn đoán và sửa việc tên hợp lệ mới như “Long 3” không được lưu hoặc không nhận đúng player identity.
- [x] Rà soát khiên, vòng đổi hướng và các vật phẩm gameplay: vị trí, collision, silhouette và mô tả hướng dẫn.
- [x] Giải thích rõ giá trị của sao trong HUD/tutorial và liên kết sao với combo, nhiệm vụ hoặc phần thưởng có ý nghĩa.
- [x] Loại bỏ hoặc thay thế các vật thể vàng giữa đường gây nhiễu nếu không phải vật phẩm có mục đích rõ ràng.
- [x] Kiểm thử lại toàn bộ tutorial/vật phẩm/làn đường và Top 30 trên desktop/mobile sau sửa.
- [x] Xác minh trực tiếp đổi tên cùng playerId từ “Long” sang “Long 3” hiển thị đúng trong Top 30 sau submit.
- [x] Quyết định rõ mô hình identity một kỷ lục/mỗi thiết bị và mô tả cách đổi tên/đổi hồ sơ cho người dùng chung máy.
- [x] Chạy QA runtime spawn và nhặt khiên/vòng gió để xác nhận vị trí, collision, thông báo và phần thưởng khớp hướng dẫn.
- [x] Kiểm thử hồi quy desktop/mobile sau batch sửa mới: đổi làn, nhảy đệm thấp, trượt cổng mây, nhặt sao/khiên/vòng gió và mở Top 30 30 hạng.
- [x] Ghi lại bằng chứng QA runtime cho từng nhóm vật thể sau batch sửa mới trên desktop và mobile.
- [x] Kiểm thử runtime mobile: đổi làn, nhảy đệm thấp, trượt cổng mây, nhặt sao, khiên và vòng gió.
- [x] Ghi lại bằng chứng QA runtime mobile cho từng nhóm vật thể sau batch sửa mới.
- [x] Kiểm thử trực tiếp thao tác đổi làn trên desktop/mobile thay vì suy ra từ demo tự chạy hoặc số sao tăng.
- [x] Sửa lỗi minh hoạ thẻ hướng dẫn khiên và vòng gió, bảo đảm asset runtime/tile hiển thị đầy đủ và không méo/cắt.
- [x] Đặt khoảng spawn tối thiểu, thời gian cảnh báo và quy tắc chống vật thể xuất hiện bất thình lình trong làn đang chạy.
- [x] Thiết kế lại mục đích sao: phần thưởng tức thời, mốc combo và mối liên hệ rõ với tổng điểm.
- [x] Viết công thức điểm dễ hiểu, hiển thị trong hướng dẫn và HUD mà không gây rối trong lúc chạy.
- [x] Bổ sung test cho công thức điểm, mốc sao và quy tắc spawn cảnh báo.
- [x] Kiểm thử trực quan power-up/tutorial và nhịp phản ứng sau khi sửa trên desktop/mobile.
- [x] Đổi nút hướng dẫn trên menu thành nhãn trực tiếp, dễ nhận biết nội dung bên trong.
- [x] Bỏ nút “Hồ sơ mới” khỏi menu chính và giữ mô hình một hồ sơ/thiết bị không làm rối người chơi.
- [x] Tái hiện chướng ngại/vật phẩm ở cự ly gần để xác định nguyên nhân méo hình.
- [x] Sửa tỷ lệ/texture/camera-facing của chướng ngại và power-up khi đến gần người chơi.
- [x] Kiểm thử cận cảnh các vật thấp, cổng mây, sao, khiên và vòng gió trên desktop/mobile.

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

- [x] Thu gọn cảnh báo Nhảy/Trượt để không che nhân vật, làn chạy hoặc vật thể đang tới.
- [x] Cân bằng lại độ khó theo quãng đường: tăng tốc, rút nhịp spawn và tăng tổ hợp thử thách theo cấp nhưng vẫn công bằng.
- [x] Làm lại điểm số để sao không còn tạo combo hoặc thưởng mốc 10 sao làm điểm tăng quá nhanh.
- [x] Reset toàn bộ dữ liệu Top 30 theo yêu cầu và xác minh danh sách trống 30 hạng.
- [x] Kiểm thử công thức điểm, nhịp độ và cảnh báo mới trên desktop/mobile trước phát hành.

- [x] Làm rõ trong UI rằng mỗi thiết bị chỉ giữ một kỷ lục cao nhất/tuần, nên hai lượt cùng tên không tạo hai dòng Top 30.
- [x] Đưa nút hướng dẫn lên vị trí cao hơn, tách rõ khỏi vùng nhìn đường chạy và vẫn vừa màn hình mobile.
- [x] Tăng dần mật độ chướng ngại và vật phẩm theo cấp để lượt chơi đầu không thưa, nhưng giữ khoảng phản ứng an toàn.
- [x] Đưa sao/xu trở lại như vật phẩm nhặt có phần thưởng nhỏ cố định, không combo và không thưởng mốc 10 sao.
- [x] Kiểm thử nhịp spawn, hướng dẫn và Top 30 mới trên desktop/mobile trước phát hành.
- [x] Kiểm tra lại Top 30 trên desktop và mobile sau batch spawn/sao mới, ghi nhận screenshot hoặc bằng chứng browser rõ ràng.
- [x] Chạy QA runtime mobile cho nhịp spawn mới ở vài mốc cấp để xác nhận vật thể dày hơn nhưng vẫn có cảnh báo sớm và khoảng phản ứng an toàn.

- [x] Đổi leaderboard để lưu mọi lượt hợp lệ vào Top 30, kể cả nhiều lượt cùng tên/cùng thiết bị; bỏ logic chỉ giữ personal best.
- [x] Cập nhật mô tả, gửi điểm và logic kỷ lục màn đầu để phản ánh Top 30 theo mọi lượt chơi.
- [x] Cho chướng ngại/vật phẩm nối tiếp nhau theo nhịp spawn liên tục có giới hạn an toàn, không chia thành từng đợt chờ.
- [x] Nâng cổng mây cao lên khỏi mặt đường và làm silhouette/khoảng chui dễ nhận biết hơn.
- [x] Thiết kế lại màn đầu thành luồng hai bước gọn: giới thiệu → chọn nhân vật và đặt tên → chạy.
- [x] Kiểm thử dữ liệu Top 30 nhiều lượt cùng tên, spawn liên tục, cổng mây và menu hai bước trên desktop/mobile.
- [x] Kiểm thử trực tiếp mobile runtime đủ sáu hành vi: đổi làn, nhảy, trượt, nhặt sao, khiên và vòng gió; lưu bằng chứng riêng từng hành vi.
- [x] Cập nhật QA checklist phát hành hợp nhất cho tutorial, vật phẩm, ba làn và Top 30 trên desktop/mobile của bản mới nhất.

- [x] Chẩn đoán và sửa các vùng chồng lấn hoặc tỷ lệ bất hợp lý của landing trên khung desktop.
- [x] Chuyển hướng dẫn thành các cửa sổ từng bước, có tiến độ, nút tiếp và bỏ qua ở mọi bước.
- [x] Bắt buộc người chơi nhập tên và chọn nhân vật trong bước thiết lập trước khi bắt đầu lượt chạy.
- [x] Đưa nút xem Top 30 cạnh khối Kỷ lục bầu trời, giữ rõ ràng trên desktop và mobile.
- [x] Nâng cổng mây hoặc hạ tỷ lệ nhân vật để khoảng trượt cao, dễ nhận biết và không tạo va chạm trực quan.
- [x] Kiểm thử desktop/mobile cho landing, setup, hướng dẫn bỏ qua, điều kiện bắt đầu và cổng mây mới.

- [x] Gộp hướng dẫn thành hai phần: vật phẩm nên lấy kèm công dụng và chướng ngại cần vượt kèm hành động nhảy/trượt.
- [x] Chuyển toàn bộ quy tắc, API, UI, placeholder và câu chữ từ Top 30 sang Top 20 mà vẫn giữ entry thật đang có.
- [x] Tối ưu bước nhập tên/chọn nhân vật cho 390×844, ưu tiên form, lựa chọn và CTA không che nhau hoặc tạo cuộn ngang.
- [x] Thêm lời chào game-over phân bậc theo điểm, khen theo thứ hạng Top 20 và khuyến khích cụ thể khi chưa vào hạng.
- [x] Kiểm thử Top 20, hướng dẫn nhóm, thông điệp kết quả và setup mobile trên desktop/mobile.

- [x] Thêm âm thanh phản hồi riêng khi nhảy, nhặt vật phẩm và kết thúc lượt chơi, tôn trọng trạng thái tắt nhạc/âm thanh.
- [x] Thêm nút chia sẻ thành tích ở màn kết quả với Web Share API và phương án sao chép nội dung khi không được hỗ trợ.
- [x] Kiểm thử unit/UI cho hiệu ứng âm thanh, nội dung chia sẻ, trạng thái fallback và bố cục màn kết quả desktop/mobile.

- [x] Thiết kế và tạo thẻ thành tích PNG chứa nhân vật, điểm, quãng đường, cấp độ và hạng Top 20 nếu có.
- [x] Thêm nút tải thẻ thành tích và ưu tiên gửi file ảnh qua Web Share API khi thiết bị hỗ trợ.
- [x] Thêm âm thanh riêng khi vượt thành công đệm thấp hoặc cổng mây cao, không trùng âm thanh va chạm/vật phẩm.
- [x] Kiểm thử xuất/tải thẻ, nội dung ảnh, chia sẻ file, âm thanh clear và bố cục màn kết quả desktop/mobile.

- [x] Tối ưu toàn bộ menu, setup, hướng dẫn và kết quả cho Galaxy S22 360×780, không cắt thông tin hoặc CTA.
- [x] Tăng tốc sớm hơn và giảm nhịp spawn theo cấp để lượt chơi năng động hơn, vẫn giữ làn an toàn và cảnh báo phản xạ.
- [x] Bỏ câu giải thích Top 20 dư thừa ở landing, giữ nội dung ngắn gọn và hữu ích.
- [x] Nâng tạo hình 8 nhân vật mascot theo phong cách kawaii chi tiết hơn, giữ tên và nhận diện riêng từng nhân vật.
- [x] Kiểm thử Galaxy S22, độ khó mới, lựa chọn nhân vật và build production trước phát hành.

- [x] Sửa lưới chọn nhân vật để luôn hiện nhận diện dự phòng đẹp khi chân dung ảnh chưa tải hoặc lỗi tải.
- [x] Hiển thị đồng thời điểm và quãng đường rõ ràng, liên tục trong HUD khi người chơi đang chạy.
- [x] Tự cuộn Top 20 tới đúng hàng điểm vừa nộp, tô nổi bật hạng đó và hiển thị lời chúc mừng theo hạng.
- [x] Giữ lời động viên rõ ràng khi lượt chơi không lọt Top 20.
- [x] Kiểm thử desktop/mobile cho fallback mascot, HUD điểm/quãng đường và cuộn hạng tự động Top 20.
- [x] Sửa resolver URL chân dung mascot để GitHub Pages tải ảnh chi tiết từ origin công khai thay vì chỉ dùng fallback biểu tượng.
- [x] Kiểm thử lại Manus public và GitHub Pages cho đủ tám chân dung sau khi phát hành.
- [x] QA nghiêm khắc tái hiện lỗi chân dung mascot đè chữ ở màn thiết lập trên desktop và mobile.
- [x] QA end-to-end đồ họa, responsive, gameplay, điều khiển, leaderboard, âm thanh và bản công khai.
- [x] Lập báo cáo lỗi/cải tiến có mức ưu tiên, bằng chứng và khuyến nghị xử lý; không tự sửa mã trong đợt audit.
- [x] Sửa P0 lưới chọn nhân vật 391–560px để ảnh mascot không đè tên, giữ target chạm tối thiểu 44px và thêm regression responsive.
- [x] Gỡ CSS `background-image` chân dung theo nth-child, giữ một nguồn ảnh `assetUrl()` cùng fallback đã kiểm thử.
- [x] Đồng nhất đường chạy runtime với nhận diện mây–kem–blueberry–sao điều ước của landing và phản ánh màu/nhận diện nhân vật trong gameplay.
- [x] Nâng typography mobile, focus ring, nhãn aria và điều khiển một tay cho setup, HUD, hướng dẫn, kết quả và Top 20.
- [x] Tách công tắc nhạc nền/hiệu ứng, lưu tùy chọn người chơi và cân lại mức âm lượng các nhóm âm thanh.
- [x] Lazy-load Babylon/game canvas sau ý định bắt đầu chơi để giảm tải đầu; kiểm tra lại bundle và nhịp render.
- [x] Bảo đảm debug logging không lưu header hay token nhạy cảm ở client; giữ đủ dữ liệu chẩn đoán an toàn.
- [x] Bổ sung regression cho viewport 393×852/412×915, chọn nhân vật, audio preference, accessibility và phân tách tải game.
- [x] QA lại trên desktop, 360×780, 393×852, 412×915 và hai liên kết công khai; cập nhật báo cáo và phát hành.
- [x] Khôi phục nhạc nền có khởi phát sau thao tác người chơi ở landing/setup, tôn trọng lựa chọn tắt nhạc đã lưu.
- [x] Sửa thẻ nhân vật để tên, mô tả và ba chỉ số Nhảy/Trượt/Khiên không chồng lấn ở mobile và desktop.
- [x] Dựng avatar 3D khác biệt, dễ nhận diện theo từng mascot đã chọn thay cho mô hình chung chỉ đổi màu.
- [x] Bổ sung regression cho âm thanh menu, bố cục thẻ mascot và profile avatar runtime.
- [x] QA lại âm thanh/bố cục/avatar trên 360×780, 412×915, Manus public và GitHub Pages rồi phát hành.
- [x] Thêm preview mascot 3D xoay 360° trong bước chọn nhân vật, có tự xoay nhẹ và thao tác kéo/chạm.
- [x] Làm rõ trạng thái autoplay bị chặn và bảo đảm nhạc menu bắt đầu lại từ lần chạm hợp lệ tiếp theo khi đã bật nhạc.
- [x] Bổ sung regression cho preview 360° và retry audio, kiểm thử 360×780/412×915 cùng hai bản public.
- [x] Tách factory mascot 3D duy nhất để gameplay và preview 360° dùng đúng cùng mesh, màu và phụ kiện.
- [x] Thay preview CSS hiện tại bằng model runtime thật có xoay 360°/kéo chạm, không còn dùng minh hoạ chân dung thay thế.
- [x] Kiểm thử đối chiếu từng silhouette mascot, mobile và hai bản public rồi phát hành.
- [x] Nâng factory mascot runtime với tỷ lệ, mắt/má, tai, phụ kiện và dấu hiệu nhận diện riêng rõ hơn cho tám nhân vật.
- [x] Bảo đảm preview 360° tiếp tục render đúng cùng factory nâng cấp, không tạo model thay thế.
- [x] Kiểm thử trực quan gameplay/preview của các silhouette, regression, mobile và hai bản public trước phát hành.
- [x] Nghiên cứu nguồn đáng tin cậy và lập bảng đặc điểm nhận dạng cho Cinnamoroll, Pompompurin, My Melody, Kuromi, Badtz-Maru, Keroppi, Gudetama và Hello Kitty.
- [x] Chuyển bảng nhận dạng thành đặc tả tạo hình mascot runtime, ưu tiên Cinnamoroll trắng/tai dài và dấu hiệu gương mặt đúng nhận diện.
- [x] Dựng lại factory mascot chung để gameplay và preview 360° cùng bám sát bảng đặc điểm, không dùng model thay thế.
- [x] Kiểm thử silhouette, mobile, regression và hai bản public; cập nhật tài liệu đặc tả trước phát hành.
- [x] Nghiên cứu và lập bảng đặc điểm mặt trước–mặt sau cho tám mascot, đối chiếu nguồn tham chiếu và ảnh chọn nhân vật hiện có.
- [x] Chẩn đoán orientation camera/model khiến mascot quay lưng khi chạy và lập hợp đồng trục hướng chạy thống nhất.
- [x] Sửa factory mascot và gameplay để mặt nhân vật chạy theo hướng đường chạy, còn mặt sau hiển thị đúng khi camera gameplay theo sau.
- [x] Cập nhật hình ảnh chọn nhân vật theo đặc tả trước–sau, giữ ảnh 2D mặt trước đúng orientation và gắn nhãn rõ ràng.
- [ ] Kiểm thử cả tám mascot trong preview/gameplay, regression, mobile và hai bản public trước phát hành.
