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

Xác minh bản Manus sau checkpoint `2514d6ce` cho thấy hướng dẫn công khai đã nhận đủ năm thẻ: sao, đệm thấp, cổng mây, khiên cầu vồng và vòng gió mint. Tóm tắt “Điểm = chạy 8 điểm/m × combo + sao/vật phẩm + thưởng mốc” xuất hiện trước các thẻ; bảng chi tiết bên dưới liệt kê toàn bộ công thức.

Menu đã được làm gọn: nút “Hướng dẫn chơi” hiển thị chữ rõ ràng trong vùng trống bên phải tiêu đề trên desktop và trong hàng đầu trên mobile; nút “Hồ sơ mới” đã được loại bỏ. Trường tên hiện chỉ nhắc tên sẽ cập nhật kỷ lục trên thiết bị hiện tại, giảm một thao tác không cần thiết.

### QA cận cảnh vật thể — 22/08/2026

| Nhóm vật thể | Desktop 1280×720 | Mobile 390×844 | Kết luận quan sát |
| --- | --- | --- | --- |
| Đệm thấp | Đệm dâu đỏ giữ cạnh trên, lỗ nhảy và chiều cao thấp; không dẹt thành một dải ngang. | Hình đệm đầy đủ nằm ở làn trái, không bị nút cảm ứng che. | Đạt. |
| Cổng mây | Cổng tím giữ vòm, khoảng trống phía dưới và biển cảnh báo rõ ràng. | Cổng giữ vòm trọn vẹn phía trước nhân vật; HUD và dãy nút không che cổng. | Đạt. |
| Sao điều ước | Sao tròn viền mint, các tia sao và nền trong suốt đầy đủ. | Sao còn nguyên silhouette, tách biệt rõ với nền đường. | Đạt. |
| Khiên cầu vồng | Biểu tượng khiên tròn, viền sắc nét và không có nền hình chữ nhật. | Khiên giữ hình tròn đầy đủ tại làn trái, không bị HUD che. | Đạt. |
| Vòng gió mint | Vòng gió xoáy, ngôi sao giữa và các xoắn mây đều nguyên hình. | Vòng gió giữ đủ xoắn và ngôi sao giữa, không méo/cắt. | Đạt. |

Nguyên nhân là plane texture trước đây quay theo trục Y của node cha nên có lúc quay cạnh với camera. Bản sửa để mọi sticker luôn đối diện camera và chỉ xoay Z để tạo chuyển động nhẹ. Các ảnh cận cảnh trên xác nhận cả năm nhóm vật thể giữ tỷ lệ, alpha và silhouette ở cả hai breakpoint.

### Hồi quy input và identity — 22/08/2026

Kiểm thử giao diện gọi trực tiếp bốn nút cảm ứng khi HUD ở trạng thái chạy, xác nhận chúng lần lượt phát đúng lệnh **sang trái, nhảy, sang phải, trượt** qua cầu `skydash:command`. Kiểm thử GameWorld tương ứng gọi trực tiếp các phím `ArrowLeft`, `ArrowRight`, `Space` và `ArrowDown`, cho cùng bốn lệnh gameplay. Hai đường input desktop và mobile vì vậy dùng cùng hợp đồng lệnh, không suy ra gián tiếp từ điểm hoặc demo tự chạy.

Recorder trước đó đã ghi chuỗi `menu → playing → gameover` trên GitHub Pages mà không có request leaderboard ở thao tác Start; việc bắt đầu lượt chạy không bị API xếp hạng chặn. Sửa server cho phép một `playerId` cập nhật tên dù lượt mới không vượt kỷ lục cũng đã được test repository; người dùng đã xác nhận trực tiếp tên **“Long 3”** hiển thị đúng sau sửa.

### QA runtime và Top 30 — 22/08/2026

Runtime desktop đã vượt thành công đệm thấp bằng nhảy và cổng mây bằng trượt; sau mỗi vật cản, trạng thái vẫn là `playing`, quãng đường tiếp tục tăng qua 5m và không xuất hiện màn game-over. Ở khung 390×844, HUD giữ bốn nút cảm ứng tách biệt. Lượt nhặt sao cập nhật `Sao 1/10`; lượt nhặt khiên hiện timer trên HUD và vòng bảo vệ quanh nhân vật. Kiểm thử unit va chạm cùng hợp đồng input xác nhận vòng gió cộng 90 điểm, combo +0.5, và cả nhảy/trượt đều cộng đúng 18 điểm khi vượt qua.

Top 30 được đọc trực tiếp từ dữ liệu hiện có, không chèn dữ liệu QA: Alibaba 34.811, Nancy 25.838 và Long 3 12.639 hiện ở ba hạng đầu; cả desktop lẫn mobile cùng thể hiện đúng thứ tự này, sau đó là các ô “Đang chờ chuyến bay”. Ở mobile, header/footer vẫn trong viewport và danh sách có vùng cuộn riêng.

### Khắc phục render desktop — 22/08/2026

QA phát hiện một lỗi chỉ xuất hiện ở viewport desktop: HUD vẫn tăng điểm nhưng canvas Babylon trong suốt, log ghi `VERTEX SHADER ERROR` với ký tự `<`. Nguyên nhân là nhánh nạp động shader mặc định nhận nội dung HTML thay vì GLSL. Scene hiện nạp sẵn `default.vertex` và `default.fragment` của Babylon trong bundle, nhờ vậy shader/include được đăng ký nội bộ trước khi tạo `StandardMaterial`. Kiểm tra lại ở 1280×720 cho thấy nhân vật, làn màu hồng, sao và cổng mây cùng hiển thị; khung 390×844 vẫn giữ nhân vật, cổng và bốn nút cảm ứng đúng bố cục.

Sau checkpoint `a894ceb8`, cả **Manus public** và **GitHub Pages** đã nạp được bundle shader mới trên desktop: nhân vật Cinnamoroll, đường chạy hồng, mây 3D và HUD cùng xuất hiện. Lượt demo nhặt sao trên cả hai URL cập nhật `Sao 1/10`, điểm và combo `×1.2`; GitHub Pages cũng tiếp tục lấy ảnh nền từ origin Manus đúng cấu hình CORS/asset hiện có.

### Cân bằng lượt chạy và reset Top 30 — 22/08/2026

Theo phản hồi người chơi, banner Nhảy/Trượt lớn giữa màn hình đã được bỏ. Cảnh báo giờ là toast nhỏ sát HUD, không che người chạy, ba làn hoặc vật cản. Hệ điểm mới không còn combo, thưởng sao hay mốc 10 sao: chạy nhận **6 điểm/m**, nhảy/trượt đúng nhận **32 điểm**, vòng gió nhận **40 điểm cố định**, còn khiên chỉ bảo vệ. Sao không còn xuất hiện trong nhịp spawn thường và không tác động vào điểm hay Top 30.

Nhịp đầu lượt khởi đầu ở 8,4 km/h; cứ mỗi 110m tăng một cấp, đồng thời rút khoảng spawn có giới hạn an toàn 1,05 giây. Chướng ngại xuất hiện xa hơn (58–78 đơn vị) và cảnh báo tối thiểu 2,1 giây, vì vậy độ khó tăng dần bằng phản xạ chứ không phải vật thể xuất hiện đột ngột. Hồi quy xác nhận 25 test đạt, gồm score cố định, tốc độ/cấp tăng dần, giới hạn tốc độ cuối lượt và quy tắc spawn.

Đã reset theo yêu cầu bằng cách xoá toàn bộ entry Top 30 nhưng giữ dữ liệu mùa. SQL xác nhận còn **0** entry; giao diện xác nhận các hạng 1–30 đều là “Đang chờ chuyến bay”.

QA runtime cuối sau khi bỏ banner xác nhận ở 390×844 nhân vật nhảy qua đệm thấp, HUD chỉ có toast nhỏ “Nhảy qua đệm thấp!” ở sát phía trên đường chạy; bốn nút cảm ứng, nhân vật và làn đường đều không bị che. Ở 1280×720, lượt trượt tiếp tục chạy với HUD gọn, toast “Lướt qua nào!” và điểm 48 sau vượt vật cản; không còn callout Nhảy/Trượt lớn giữa màn hình. HUD mới chỉ hiển thị điểm, quãng đường/cấp, tốc độ và trạng thái khiên; không còn sao hay combo.

Lượt QA desktop dài tiếp tục đến 414m, đạt cấp 4 và 2.614 điểm trước khi kết thúc; HUD đã tăng từ cấp 1 / 8 km/h sang các cấp cao hơn trong khi toast cảnh báo vẫn nhỏ. Trên 390×844, kiểm tra runtime tại mốc 330m hiển thị tốc độ cấp cao 14 km/h cùng đường chạy, nhân vật và bốn điều khiển cảm ứng còn đầy đủ. Các kiểm thử cũng xác nhận tốc độ khởi đầu 8,4 km/h, tăng cấp mỗi 110m, và không vượt giới hạn 21 km/h.

Browser QA sau cùng ở mốc 361–372m xác nhận HUD runtime mới hiển thị **Cấp 4**, **14 km/h**, điểm tăng theo quãng đường và dòng “Vượt vật cản để tăng điểm”; không còn sao, combo hay mốc 10 sao. Canvas vẫn hiển thị nhân vật, cổng mây và ba làn rõ ràng, còn cảnh báo chỉ là toast nhỏ khi có vật cản tới.

Top 30 trống cũng được kiểm tra ở khung 390×844 sau reset: các ô hạng hiển thị rõ dữ liệu chờ, danh sách cuộn độc lập và footer “Về màn hình đầu” không che các dòng xếp hạng.

GitHub Pages sau checkpoint `15d0b81f` cũng trả Top 30 trống đủ 30 hạng và dùng đúng bản menu/hướng dẫn mới: lời giới thiệu tập trung vào nhảy, trượt và đổi làn; thẻ nhân vật hiển thị nhảy, trượt, khiên thay vì thưởng sao. Không có entry cũ xuất hiện trở lại sau reset.

Hướng dẫn desktop hiển thị bốn thẻ Nhảy, Trượt, Khiên và Vòng gió theo lưới 2×2; phần công thức ghi rõ “Điểm = quãng đường + vượt vật cản đúng lúc + vòng gió” và sao không còn tác động đến điểm hoặc combo.

Hồi quy leaderboard hiện mô phỏng lượt chơi cuối thứ Sáu rồi lượt đầu tiên sau nửa đêm thứ Bảy trong repository bộ nhớ. Lượt sau tạo mùa `2026-08-22`, xếp hạng mới từ đầu và không làm thay đổi entry của mùa cũ; kiểm thử này không ghi dữ liệu vào Top 30 công khai.

Hồi quy HUD xác nhận trạng thái hành động nhảy vẫn hiện toast “Nhảy qua đệm thấp!” nhưng không còn render `.action-callout`; bốn nút cảm ứng tiếp tục phát đúng bốn lệnh làn trái, nhảy, làn phải và trượt. Bộ test hiện có 27 case đạt cùng kiểm tra kiểu.

Manus public sau checkpoint `fa565694` và GitHub Pages đều trả cùng mùa `2026-08-22` với đủ 30 placeholder “Đang chờ chuyến bay”; không có entry cũ, sao hoặc combo nào xuất hiện trong bảng hạng đã reset.

Để khớp hoàn toàn với quyết định không tính sao, dòng có người chơi trong Top 30 nay chỉ hiển thị quãng đường và điểm; sao đã bị loại khỏi tiêu chí xếp hạng, điều kiện giữ kỷ lục và phần hiển thị từng hạng. Hồi quy HUD đạt 27 test và build production đạt sau thay đổi này.

Hồi quy UI mới mô phỏng hai game-over liên tiếp cùng hồ sơ “Hana Test”: cả hai lượt tự gửi điểm, lượt thứ hai dùng đúng điểm/quãng đường mới, callback hạng mở bảng Top 30 và nút “Về màn hình đầu” gửi lệnh menu đúng một lần. Bộ test hiện có 28 case đạt cùng TypeScript.

Trong QA mobile, tư thế trượt đã được giảm nén ngang và cân chỉnh lại thân/huy hiệu để gương mặt không còn bị một dải mesh cắt ngang khi đi dưới cổng mây. Lượt QA 390×844 sau sửa giữ mascot, toast “Lướt qua nào!”, cổng mây và bốn nút cảm ứng rõ ràng. Full test (28), TypeScript và build production đạt.

Manus public sau checkpoint `f411bf0f` xác nhận lượt trượt vẫn tiếp tục ở cấp 1 với HUD gọn, điểm tăng từ quãng đường/vượt cổng, toast “Lướt qua nào!” và canvas render được mascot rõ ràng.

### Nhịp thử thách và sao xu — 22/08/2026

Màn menu nay ghi rõ: mỗi thiết bị giữ **một kỷ lục cao nhất mỗi tuần**, vì vậy hai lượt dưới tên Long sẽ cập nhật cùng một dòng thay vì sinh hai người chơi Long. Nút hướng dẫn và toast runtime được đưa lên sát HUD để giữ vùng ba làn trống.

Sao xu đã trở lại trong nhịp spawn thường, nhận **+4 điểm cố định** mỗi lần nhặt; không tạo combo và không có thưởng 10 sao. Nhịp spawn đầu lượt giảm từ 2,50 giây xuống 2,05 giây trước độ lệch ngẫu nhiên, giảm dần theo cấp nhưng vẫn chặn ở sàn an toàn 0,92 giây. Demo desktop cho thấy cổng mây được cảnh báo sớm và sao xu xuất hiện lại; hướng dẫn mobile hiển thị năm thẻ Sao xu, Nhảy, Trượt, Khiên và Vòng gió. Toàn bộ 28 test, TypeScript và build production đạt.

Sau batch này, Top 30 thật hiển thị cùng một dòng **Long** ở hạng 1 trên cả desktop và 390×844, với 553m / 3.611 điểm và không có số sao; các hạng còn lại là placeholder. Cảnh QA mobile ở cấp 3 / 12 km/h hiển thị đồng thời đệm thấp ở làn trái, cổng mây ở làn phải và sao xu ở làn giữa, để xác nhận nhịp dày hơn vẫn giữ một lựa chọn làn rõ ràng. Build production tiếp tục đạt.

GitHub Pages sau khi đồng bộ checkpoint `0ccbdd42` đã hiển thị lượt nhặt sao xu theo bundle mới: điểm tăng từ quãng đường cộng phần thưởng nhỏ, không có combo hay mốc 10 sao; HUD/canvas và asset Manus tiếp tục tải đúng.

Hồi quy GameWorld bổ sung xác nhận mẫu chướng ngại dày ở cấp 3 đặt hai vật cản ở hai làn ngoài, giữ làn giữa an toàn; nhánh vật phẩm cùng cấp sinh lại sao xu. Tổng bộ test tăng lên 29 và kiểm tra kiểu đạt.

Manus public sau checkpoint `3de59571` tiếp tục hiển thị ghi chú một kỷ lục mỗi thiết bị/tuần và Top 30 chỉ có một dòng Long ở hạng 1 (553m / 3.611 điểm), không có số sao ở từng hạng.

Phản hồi của người chơi xác nhận một lượt thực tên Long đã lưu và xuất hiện trong Top 30; lượt thứ hai cùng tên chỉ cập nhật kỷ lục của cùng hồ sơ, đúng mô hình một thiết bị/một điểm cao nhất mỗi tuần. Ảnh Top 30 desktop/mobile sau đó cùng hiển thị một dòng Long với 3.611 điểm.

### Bản Top 30 theo từng lượt và menu hai bước — 23/08/2026

> Phần này **thay thế mô hình một thiết bị/một kỷ lục** ở các ghi chú lịch sử phía trên. Mỗi lượt hợp lệ hiện được ghi độc lập; chỉ 30 điểm cao nhất của mùa được hiển thị trên bảng công khai.

| Hạng mục | Bằng chứng kiểm tra | Kết quả hiện tại |
| --- | --- | --- |
| Migration leaderboard | Migration chỉ thực hiện `DROP INDEX leaderboard_entry_season_player_idx`, không xoá hay đổi cột dữ liệu. Truy vấn sau migration vẫn đọc được entry thật `Long 2`, 3.999 điểm, 595m, ID 180001. | Đạt; dữ liệu thật được giữ nguyên và cùng thiết bị/tên có thể có nhiều entry mới. |
| Hợp đồng Top 30 | Repository test có hai lượt cùng người chơi, tên trùng từ nhiều lượt, hoà điểm theo thời điểm nộp, lượt hạng 31 và reset thứ Bảy. Lượt vừa lưu trả `entryId` riêng để UI tô đúng dòng. | Đạt trong 12 test leaderboard. |
| Landing bước 1 | Ảnh preview desktop 1280×720 và mobile 390×844 cho thấy hướng dẫn đặt ở thanh đầu trang, Kỷ lục bầu trời lấy điểm hạng 1 Top 30 (3.999 khi có dữ liệu), CTA và Top 30 nằm trong vùng nhìn thấy. | Đạt; không còn gộp tên/chọn nhân vật vào landing. |
| Thiết lập bước 2 | UI test đi qua “Bắt đầu hành trình” rồi khởi chạy Cinnamoroll; bước này giữ trường tên, 8 nhân vật, luyện tập, nút quay lại và CTA chạy riêng. | Đạt trong test HUD; cần xác nhận public sau checkpoint. |
| Nhịp thử thách | Scheduler không còn chờ một hazard đi qua vùng approach guard. Mỗi nhịp spawn tiếp theo xuất hiện liên tục, nhưng helper kiểm tra khoảng cách tối thiểu 18 đơn vị cho hazard cùng làn và vẫn dành làn an toàn cho beat dày. | Đạt trong test spawn/GameWorld; cần quan sát thêm ở bản public ở các cấp cao. |
| Cổng mây cao | Ảnh desktop `?demo=1&lesson=slide&inspect=1` cho thấy cổng tím được nâng lên, vòm và khoảng trống dưới cổng rõ ràng, có biển cảnh báo; cổng không che nhân vật hay HUD. | Đạt ở preview desktop; sẽ xác nhận lại trên mobile public. |

Toàn bộ **30 test** hiện đạt, gồm leaderboard, spawn rules, GameWorld, HUD, scoring, run flow và auth. TypeScript đã đạt; build production và kiểm tra cache công khai còn được thực hiện trước khi phát hành.

### Bổ sung QA mobile runtime — 23/08/2026

Ảnh preview 390×844 theo các URL kiểm tra riêng xác nhận **sao xu**, **khiên cầu vồng** và **vòng gió mint** xuất hiện ở làn trái, không bị thanh HUD hay bốn nút cảm ứng che; sao có viền mint/vàng, khiên giữ silhouette cầu vồng tròn, còn vòng gió giữ các xoắn mint và ngôi sao tâm. Ảnh desktop `?demo=1&lesson=slide&inspect=1` xác nhận cổng mây cao có vòm treo, khoảng hở bên dưới và biển báo riêng; cổng được nâng rõ khỏi mặt đường.

Chuỗi hành vi được bao phủ qua hai tầng kiểm tra: test HUD gọi trực tiếp bốn nút cảm ứng và xác nhận lệnh sang trái, nhảy, sang phải, trượt; test va chạm GameWorld xác nhận sao tăng 4 điểm cố định, khiên kích hoạt timer, vòng gió tăng 40 điểm, đệm thấp và cổng mây đều cộng 32 điểm khi hành động hợp lệ. Test Top 30 giữ đủ 30 slot ở menu mobile/desktop và thao tác bước 1 → bước 2 → chạy được kiểm tra với Cinnamoroll. Đây là bằng chứng kỹ thuật cho sáu hành vi cùng giao diện mobile; kiểm tra public sau checkpoint vẫn được thực hiện riêng để loại trừ độ trễ CDN.

### Checklist phát hành E2E không chèn dữ liệu giả — 23/08/2026

Test HUD end-to-end mới mô phỏng chuỗi **game-over → tự gửi điểm → callback Top 30** cho tên `Long`: phản hồi gồm hai entry `Long` có ID khác nhau, hạng 1 và hạng 2; UI hiển thị cả hai dòng và chỉ tô dòng ID của lượt mới nhất. Test repository server đồng thời xác nhận cùng `playerId` có thể lưu hai lượt độc lập, lượt ngoài Top 30 vẫn được lưu nhưng không bị báo nhầm là đã vào hạng. Toàn bộ suite hiện có **31 test** đạt.

Trên bản public, không tạo điểm thử để bảo vệ bảng hạng đang có người chơi thật. Thay vào đó, Manus public đã xác nhận landing mới, Top 30 đủ 30 slot và entry thật `Long 2` (3.999 điểm); GitHub Pages cũng đã tải bundle mới và đồng bộ đúng Kỷ lục bầu trời 3.999 sau khi API hoàn tất. Kết hợp với migration không mất dữ liệu và test E2E cục bộ, checklist phát hành cho gameplay, game-over, save flow và Top 30 được đóng mà không làm bẩn dữ liệu công khai.

### Sửa layout desktop, hướng dẫn phân bước và setup bắt buộc — 23/08/2026

| Hạng mục | Bằng chứng kiểm tra | Kết quả |
| --- | --- | --- |
| Landing desktop | Ảnh preview 1440×900 cho thấy Kỷ lục bầu trời và nút Top 30 nằm cùng một hàng, CTA tách rõ phía dưới; phần copy, hình minh hoạ và footer đều vừa một viewport. | Đạt. |
| Setup desktop | QA tái hiện panel cũ để lộ khoảng trống lớn và cuộn ngang. Sau khi reset lưới panel cha về một cột, ảnh preview cho thấy form, 8 nhân vật và CTA dùng đủ chiều ngang, không còn thanh cuộn ngang. | Đạt. |
| Hướng dẫn | Ảnh desktop và 390×844 thể hiện cửa sổ 1/4 với nút Bỏ qua, chỉ báo tiến độ, Trước/Tiếp; nội dung mỗi cửa sổ vừa panel, không cần cuộn qua năm thẻ dài. | Đạt. |
| Điều kiện chạy | UI test xác nhận nút Chạy/Luyện tập bị khoá cho đến khi tên có từ hai ký tự và người chơi chạm chọn một nhân vật; sau đó cầu event gửi `select` rồi `start`. | Đạt. |
| Cổng mây | Demo cổng mây ở desktop/mobile dùng hình học 2,78 × 3,04 tại y=2,12; tư thế trượt hạ visual xuống và nén còn 65%. Cổng, khoảng hở, biển cảnh báo, nhân vật và HUD cùng thấy rõ. | Đạt. |

Toàn bộ suite hiện có **33 test** đạt, TypeScript đạt và build production hoàn thành. Xác minh CDN/public sẽ thực hiện sau checkpoint, không tạo điểm thử trên bảng xếp hạng thật.

### Hướng dẫn theo nhóm, Top 20 và phản hồi thành tích — 23/08/2026

| Hạng mục | Bằng chứng kiểm tra | Kết quả |
| --- | --- | --- |
| Hướng dẫn | Ảnh desktop 1440×900 hiển thị Nhóm 1 với sao xu, khiên và vòng gió cùng công dụng; Nhóm 2 tách riêng đệm thấp/cổng cao cùng thao tác vượt. Ảnh 390×844 xếp các item theo hàng dọc, không cắt nội dung và vẫn có Bỏ qua/Trước/Xem chướng ngại. | Đạt. |
| Top 20 | Repository giới hạn xếp hạng, query DB, API tRPC, UI modal, CTA, placeholder và phản hồi submit đều dùng 20. Không có migration vì chỉ thay đổi giới hạn truy vấn; các entry thật vẫn nguyên vẹn, chỉ 20 điểm cao nhất được hiển thị. | Đạt trong 12 test leaderboard. |
| Setup mobile | Ảnh `?setup=1` ở 390×844 xác nhận tên, nhân vật đã chọn, ô nhập, lưới 2 cột tám nhân vật và hai CTA cùng nằm trong panel; CTA dính đáy nội bộ để không bị che khi cuộn. | Đạt. |
| Kết quả | Test HUD kiểm tra lời chào điểm thấp ngoài Top 20 và lời khen hạng #2 Top 3. Các mức điểm cao/trung bình/thấp cùng phản hồi hạng #1, Top 3, Top 10 hoặc Top 20 được chọn qua helper xác định. | Đạt trong 9 test HUD. |

Toàn bộ suite hiện có **34 test** đạt, TypeScript và build production đạt. Kiểm tra public được thực hiện sau checkpoint để bảo vệ dữ liệu bảng hạng thật.

### Âm thanh phản hồi và chia sẻ thành tích — 23/08/2026

| Hạng mục | Bằng chứng kiểm tra | Kết quả |
| --- | --- | --- |
| Âm thanh hành động | Audio manager dùng ba voice luân phiên cho hiệu ứng lặp nhanh; âm lượng nhảy/nhặt được nâng để rõ hơn, còn game-over có voice riêng. GameWorld test xác nhận nhảy gọi `jump`, sao/vòng gió gọi `pickup`, và kết thúc lượt gọi `gameover`; khi tắt âm thanh, manager không phát effect. | Đạt trong 6 test GameWorld. |
| Chia sẻ thành tích | Nút “Chia sẻ kết quả” tạo nội dung gồm điểm, quãng đường, hạng Top 20 (nếu có) và URL game. Test HUD xác nhận Web Share API nhận title/nội dung; khi API không có, Clipboard API sao chép lời khoe và UI báo rõ. | Đạt trong 11 test HUD. |
| Bố cục kết quả | Ảnh QA `?result=1` ở desktop 1280×720 và mobile 390×844 cho thấy nút chia sẻ không che form ghi hạng hoặc CTA về màn đầu; trên điện thoại các nút xếp một cột. Cờ QA chỉ tạo màn kết quả cục bộ, không nộp điểm. | Đạt. |

Toàn bộ suite hiện có **37 test** đạt, TypeScript và build production đạt.

### Thẻ thành tích và âm thanh vượt chướng ngại — 23/08/2026

| Hạng mục | Bằng chứng kiểm tra | Kết quả |
| --- | --- | --- |
| Thẻ PNG | Thẻ được dựng trực tiếp từ lượt chơi, khung dọc 1080×1350 có mascot, tên, điểm, quãng đường, cấp độ và hạng Top 20 nếu có. UI test xác nhận dữ liệu điểm 1.760, 214m và cấp 3 được đưa vào bộ dựng, sau đó gọi tải blob PNG với tên file đúng. | Đạt trong 13 test HUD. |
| Chia sẻ ảnh | Khi `navigator.canShare` hỗ trợ file, app đóng blob thành file PNG rồi mở bảng chia sẻ hệ thống; nếu không, app tải PNG về để người chơi tự đăng lên mạng xã hội. | Đạt trong test HUD. |
| Âm thanh clear | Tạo chime kawaii ba nốt độc lập, cắt còn 1,44 giây và tải lên kho tài sản web. GameWorld gọi `clear` khi nhảy qua đệm thấp hoặc trượt qua cổng mây thành công, khác với âm thanh va chạm/vật phẩm. | Đạt trong 6 test GameWorld. |
| Bố cục kết quả | Ảnh QA `?result=1` trên desktop 1280×720 và mobile 390×844 xác nhận Tải thẻ PNG, Chia sẻ thẻ, Chia sẻ kết quả và quay lại nằm gọn; mobile xếp chúng thành một cột. | Đạt. |

Toàn bộ suite hiện có **39 test** đạt, TypeScript và build production đạt.

### Xác minh Galaxy S22 và mascot v3 — 23/08/2026

Ảnh preview 360×780 cho thấy landing, setup và màn kết quả mới đều vừa viewport: CTA, tên, chọn nhân vật và hành động kết quả nằm trọn trong panel. Đã xác minh đủ tám chân dung mascot 3D mới của Cinnamoroll, Pompompurin, My Melody, Kuromi, Badtz-Maru, Keroppi, Gudetama và Hello Kitty hiển thị rõ trong lưới hai cột, không che tên hoặc điều kiện bắt đầu.

### HUD rõ thành tích và Top 20 tự định vị — 23/08/2026

Ảnh runtime 360×780 xác nhận top bar luôn hiện đồng thời **Điểm 162** và **Quãng đường 27m**, cạnh tên nhân vật, loa và tạm dừng; không còn ẩn điểm/quãng đường ở mobile. Khi callback gửi `entryId` lượt vừa xếp hạng, modal Top 20 mở và `scrollIntoView({ block: "center" })` định vị dòng có ID đó ở trung tâm vùng cuộn. Regression HUD mô phỏng hai lượt tên Long, hạng #2: dòng vừa nộp được tô sáng, lời khen Top 3 xuất hiện ở kết quả/footer và mock xác nhận lệnh cuộn được gọi. Luồng ngoài Top 20 vẫn giữ câu khuyến khích theo mức điểm.

### Khắc phục lưới mascot, HUD và hạng #17 — 23/08/2026

| Hạng mục | Bằng chứng kiểm tra | Kết quả |
| --- | --- | --- |
| Chân dung chọn nhân vật | Ảnh preview Galaxy S22 360×780 tại `?setup=1` hiển thị đủ tám thẻ Cinnamoroll, Pompompurin, My Melody, Kuromi, Badtz-Maru, Keroppi, Gudetama và Hello Kitty; ảnh chân dung, tên và viền chọn đều không bị cắt. Component ảnh mới đổi sang biểu tượng nhận diện trên nền màu riêng nếu tải ảnh thất bại; test chủ động phát sự kiện lỗi ảnh xác nhận lớp fallback được kích hoạt. | Đạt. |
| HUD khi chạy | Ảnh 360×780 tại `?demo=1` hiển thị đồng thời **Điểm 189** và dòng **Quãng đường 31m · Cấp 1** ở top bar, cạnh tên mascot, âm thanh và tạm dừng. Không còn ẩn thông tin này ở breakpoint mobile. | Đạt. |
| Top 20 hạng sâu | Regression HUD dựng đủ 20 entry, phản hồi điểm mới ở **hạng #17** với `entryId` riêng. Dòng hạng 17 nhận lớp `just-ranked`, hiện lời chúc “bạn đã chinh phục Top 20 tuần này!” và mock xác nhận `scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })`. | Đạt trong test; không chèn entry kiểm thử vào bảng công khai. |
| Ngoài Top 20 | Test game-over điểm thấp xác nhận tiêu đề “Chưa vào Top 20 tuần này.” cùng lời động viên thực tế theo điểm; không tự đóng bảng kết quả. | Đạt. |

Suite cuối có **40 test** đạt, TypeScript đạt và build production hoàn tất. Cảnh báo Vite về URL `/manus-storage` là cảnh báo resolve lúc build đã biết; chúng được giữ nguyên để runtime lấy asset công khai, đồng thời UI hiện có fallback an toàn nếu một chân dung không tải được.

### Theo dõi asset public — 23/08/2026

Bản Manus của checkpoint `458f9b25` hiển thị đủ tám chân dung chi tiết trong lưới setup. GitHub Pages của cùng checkpoint trả markup dùng URL tuyệt đối `https://sanriodash-ygyeg6qd.manus.space/manus-storage/...` cho toàn bộ tám ảnh, thay cho path tương đối cũ. Lượt kiểm tra lại sau khi ảnh hoàn tất tải xác nhận Cinnamoroll, Pompompurin, My Melody, Kuromi, Badtz-Maru, Keroppi, Gudetama và Hello Kitty đều hiện chân dung chi tiết; không còn chuyển sang biểu tượng fallback trong điều kiện tải bình thường. Hạng mục public đạt.

### Batch cải thiện sau audit nghiêm khắc — 23/08/2026

| Hạng mục | Bằng chứng hiện tại | Kết quả |
| --- | --- | --- |
| Lưới mascot P0 | Ảnh local `?setup=1` tại 360×780, 393×852 và 412×915 xác nhận tám chân dung và nhãn được phân vùng riêng; ảnh 34px nằm hoàn toàn trong cột 40px tại 391–560px, không còn đè chữ. CSS `background-image` theo `nth-child` đã bị xoá, chỉ còn `<img>` đi qua `assetUrl()` với fallback. | Đạt. |
| Đường chạy runtime | Demo 360×780 hiển thị ba dải mây cream có chiều sâu, seam blueberry, viền sao-vàng và đệm mây; ánh sáng scene đã hạ để mascot, cổng tím và các làn còn tương phản. | Đạt ở local. |
| Audio & accessibility | HUD/landing có công tắc riêng nhạc nền và hiệu ứng, giữ preference trong localStorage; focus ring thấy rõ, các control có nhãn aria/`aria-pressed` và vùng chạm mobile tối thiểu 36–40px. | Đạt trong UI regression và ảnh local. |
| Hiệu năng & bảo mật log | Babylon được tải động sau `skydash:prepare`; Start/Practice được xếp hàng nếu scene còn tải. Build tách `index` 82,15kB và `scene` 27,94kB khỏi chunk Babylon 1,70MB. Collector debug hiện sanitize request/response headers trước khi ghi log. | Đạt qua build/kiểm tra mã. |
| Regression | 41 test, TypeScript và build production đều đạt. Regression mới xác nhận hai công tắc audio và phát event chuẩn bị canvas trước Start. | Đạt. |
| Public | Sau retry, Manus `?setup=1&v=cf7e38c8-retry` tải đủ tám chân dung chi tiết, không chồng nhãn ở setup. GitHub Pages `?demo=1&v=cf7e38c8` render đường mây cream, mascot, HUD điểm/quãng đường và hai nút nhạc/hiệu ứng riêng; không phát sinh điểm thử vào Top 20. | Đạt. |

### Theo dõi sửa audio menu và mascot runtime — 23/08/2026

Ở preview browser, thao tác **Bắt đầu hành trình** đã đi đúng tới setup và thẻ Cinnamoroll giữ tên, tagline cùng ba chip chỉ số ở các vùng hàng riêng. Cơ chế audio menu mới được kích hoạt đồng bộ với chính thao tác chạm này, thay vì chờ Babylon scene khởi tạo; kiểm thử unit xác nhận HUD nhận ngay event preference. Cần kiểm tra nghe thực tế sau build/public vì browser automation không phản hồi mức âm thanh người dùng nghe được.

Thao tác browser tiếp theo xác nhận công tắc landing đổi tức thì từ **Nhạc: Bật** sang **Nhạc: Tắt** và `aria-label` đổi thành “Bật nhạc nền”, ngay khi Babylon chưa được nạp. Điều này xác nhận command, lưu preference và HUD menu đã thông suốt; playback được gọi trong cùng user gesture để thỏa chính sách autoplay của trình duyệt.

Browser gameplay trực tiếp sau khi scene hoàn tất khởi tạo xác nhận Pompompurin có tai cụp nâu, beret pudding và thân vàng; Badtz-Maru có thân đen, bụng sáng, mỏ vàng và ba chỏm đầu. Hai avatar có silhouette tách biệt với Cinnamoroll/Hello Kitty, không chỉ đổi màu của cùng mô hình. Ảnh capture chạy song song đôi khi chụp trước timeout khởi động demo; vì vậy bằng chứng này dùng lượt browser đơn lẻ đã đạt 153–169m.

Hai lượt browser tiếp theo xác nhận Gudetama là dáng trứng vàng thấp, mắt/tay nhỏ và má tròn; Hello Kitty là mặt trắng, tai nhọn, nơ hồng và ria mép. Cả hai chạy qua mốc 138m, không có lỗi runtime và phân biệt được tức thì với Pompompurin/Badtz-Maru.

Sau checkpoint `db915897`, Manus public setup hiển thị ảnh mascot, tên/tagline và ba chip Nhảy–Trượt–Khiên thành các vùng riêng; không còn chồng lên nhau. GitHub Pages chạy demo Hello Kitty qua 165m, render tai, nơ, ria mép, HUD điểm/quãng đường và hai control nhạc/hiệu ứng; không tạo entry thử vào Top 20. Hạng mục phát hành đạt.

### Preview 360° và retry audio menu — 23/08/2026

Preview local 360×780 hiển thị turntable mascot ngay trong khối nhân vật đã chọn, có tự xoay nhẹ và nút “Kéo để xoay 360°”; toàn bộ tên, ba chip chỉ số và lưới tám nhân vật vẫn vừa màn hình. Browser landing xác nhận lần chạm **Bắt đầu hành trình** đi vào setup có preview 360°; handler nhạc được gọi trên `pointerdown` của thao tác hợp lệ, trước khi chuyển màn, để vượt giới hạn autoplay của trình duyệt. UI tiếp tục hiện trạng thái “Nhạc: Bật/Tắt” và hiển thị chỉ dẫn chạm nút Nhạc nếu playback bị chặn.

Lượt kiểm tra Manus đầu tiên của checkpoint `4b6eaa8e` có độ trễ CDN và trả bundle cũ. Đối chiếu repository xác nhận `MascotPreview3D.tsx`, `SkyDashHud.tsx`, `GameCanvas.tsx`, CSS và test đều nằm trong checkpoint; retry sau khi CDN hoàn tất đã hiển thị node preview/nút xoay trên Manus public. GitHub Pages cũng hiển thị node preview, nhãn “Kéo để xoay 360°” và nút xoay 90°. Hạng mục public đạt.

### Preview dùng đúng model gameplay — 23/08/2026

Factory `MascotModel` nay là nguồn dựng duy nhất cho `GameWorld` và preview. Đối chiếu 412×915 cho Cinnamoroll cho thấy cùng đầu/tròn thân, tai, má, huy hiệu và màu; preview không còn dùng ảnh chân dung hoặc mesh mô phỏng khác. Regression có 44 test đạt; Manus public và GitHub Pages của checkpoint `8053da8c` đều trả canvas preview cùng nút xoay model runtime. Hạng mục đạt.

### Tạo hình mascot runtime nâng cấp — 23/08/2026

Model chung được tăng tỷ lệ khuôn mặt, mắt/má, tay/chân, mũ/hood, hoa, mỏ, bụng, áo, đuôi, nơ và tai theo silhouette. Lượt setup local chọn Kuromi xác nhận canvas đổi ngay sang cùng model tím/hood/gai đang dùng khi chạy; các ca mobile đại diện cũng xác nhận Cinnamoroll, Pompompurin, My Melody và Hello Kitty giữ nhận diện rõ hơn trên đường mây. Preview tiếp tục gọi factory chung, nên mọi điều chỉnh model runtime tự phản ánh ở 360°.

Checkpoint `9fc7aadf` được xác minh trên Manus public và GitHub Pages: canvas preview không trống, có nhãn model runtime và nút xoay; lưới 8 mascot, tên và các chip chỉ số vẫn ổn định. Tạo hình mascot chi tiết cùng preview đồng bộ đạt phát hành.

### Đặc tả nhận dạng mascot và factory runtime — 23/08/2026

Nguồn hồ sơ Sanrio SEA đã được đối chiếu để tạo tài liệu `MASCOT_REFERENCE_SPEC.md`. Bảng đặc tả khóa các dấu hiệu nhìn xa cho tám mascot: Cinnamoroll trắng/tai dài–đuôi cuộn; Pompompurin vàng/beret–tai cụp nâu; My Melody hood hồng–tai rủ–hoa; Kuromi jester đen/skull–đuôi quỷ; Badtz-Maru cánh cụt đen/mào gai–bụng trắng; Keroppi mắt nhô lớn/cổ áo hồng; Gudetama lòng đỏ nằm trên lòng trắng; và Hello Kitty tai mèo–nơ trái/mũi vàng/sáu ria. [Nguồn: Sanrio SEA Characters](https://sanrio-sea.com/characters/)

Factory `MascotModel` đã được dựng lại theo bảng này. Lớp rim/hood được đưa về sau mặt để không che gương mặt ở camera gameplay, và Cinnamoroll dùng rim xanh rất nhạt để giữ nhận diện thân trắng. Preview 360° tiếp tục gọi cùng `createMascotModel`, nên không tồn tại model preview thay thế.

| Kiểm tra | Bằng chứng | Kết quả |
| --- | --- | --- |
| Silhouette có contract | Test mới dùng Babylon `NullEngine` kiểm tra mesh nhận dạng cho cả 8 mascot và contract `root`/`visual`/`shieldRing`. | Đạt, 9 test mới. |
| Preview setup | Canvas cùng factory được chọn lần lượt cho 8 nhân vật; Cinnamoroll, My Melody, Kuromi, Keroppi, Gudetama và Hello Kitty đều có dấu hiệu đặc trưng đọc được trong khung. | Đạt cục bộ. |
| Gameplay runtime | Demo browser riêng xác nhận Cinnamoroll, Keroppi, Badtz-Maru và Gudetama giữ đúng mesh nhận dạng khi chạy. | Đạt cục bộ. |
| Regression/build | `pnpm test` 53/53, `pnpm check` và `pnpm build` cùng đạt; cảnh báo chunk Babylon 1,77MB là cảnh báo kích thước đã biết do engine được lazy-load. | Đạt. |

Checkpoint `d1f69f20` đã được kiểm tra với cache-buster. Manus public trả setup có canvas preview cùng nút xoay, tám lựa chọn và demo Cinnamoroll; lượt demo không nhập tên nên không tạo dữ liệu Top 20. GitHub Pages trả setup cùng canvas runtime, Cinnamoroll thân trắng/tai dài sau khi CDN đồng bộ, đồng thời tiếp tục dùng origin Manus tuyệt đối cho toàn bộ portrait 2D.

Để phân biệt bundle factory mới khi phát hành, `MascotModel` công bố marker `recognition-v2` trên `root.metadata` cùng `characterId`; test NullEngine kiểm tra marker trên cả tám lựa chọn. Lần validation cuối vẫn đạt 53/53 test, TypeScript và build production. GitHub Pages bundle đã có marker palette/đuôi mới; Manus CDN sẽ được retry sau checkpoint kế tiếp, không tạo lượt điểm thử.

Retry sau checkpoint `99224a15` xác nhận Manus đã chuyển sang `assets/index-VfM3vOIh.js`, có marker palette Cinnamoroll mới `E6F8FF` và mesh `cloudTailCurl`. GitHub Pages bundle cũng có cùng hai marker và demo Cinnamoroll trắng/tai dài. Hai bản public đã đồng bộ factory mascot runtime; không có lượt QA nào được nộp vào Top 20.

### Orientation runner và đặc tả trước–sau — 23/08/2026

Đã lập `MASCOT_ORIENTATION_SPEC.md` với bảng trước–sau cho cả tám mascot, dựa trên hồ sơ và minh hoạ của Sanrio SEA. Hợp đồng runtime được sửa: camera đứng phía âm trục Z nhìn về +Z, mascot chạy về +Z và do đó gameplay nhìn lưng đúng thiết kế; preview 360° bắt đầu tại mặt trước cùng factory, không dùng mesh thay thế. [Nguồn: Sanrio SEA Characters](https://sanrio-sea.com/characters/)

| Hạng mục | Kiểm tra | Kết quả |
| --- | --- | --- |
| Orientation | `orientMascotForGameplay()` quay root `π` quanh trục Y; mắt/mũi local -Z đi về hướng chạy +Z, còn `headRim`/đuôi hướng camera. | Đạt. |
| Hình chọn | Bộ ảnh 2D mặt trước đã đúng nhận diện được giữ nguyên, gắn nhãn “Ảnh mặt trước”; preview có chú thích rõ mặt trước/lưng khi chạy. | Đạt desktop và 360×780. |
| Regression | NullEngine kiểm tra dấu hiệu nhận dạng và trục mắt/lưng cho cả tám mascot; test HUD kiểm tra nhãn preview/ảnh. | 54/54 test đạt. |
| Build | `pnpm check` và `pnpm build` đạt; chunk Babylon 1,77MB raw/416KB gzip là cảnh báo kích thước đã biết do lazy-load engine. | Đạt. |

Checkpoint `8667334f` đã đồng bộ cả hai bản public. Manus setup hiển thị hint orientation và tám nhãn “Ảnh mặt trước”; demo Cinnamoroll hiện sau đầu, tai dài và đuôi khi chạy về +Z. GitHub Pages cũng xác nhận cùng setup và gameplay. Các URL QA không đặt tên hay gửi điểm nên không tạo entry mới trong Top 20.

### Thẻ thành tích theo mascot và animation phụ kiện — 23/08/2026

Thẻ PNG nay nhận immutable `completedRun` (hoặc snapshot kết quả nếu cần), rồi tra đúng `characterId` của lượt chạy để in điểm, quãng đường, cấp, hạng và chân dung 2D của mascot đã chọn. Nếu ảnh không tải, thẻ vẫn xuất được bằng icon/palette cùng mascot; tên file cũng có slug mascot, điểm và quãng đường. Kiểm tra canvas cục bộ đã dựng thẻ Kuromi 1.760 điểm, 214m, cấp 3, hạng #7 với đúng chân dung Kuromi; PNG tạo thành công, kích thước 601.634 bytes.

| Hạng mục | Bằng chứng | Kết quả |
| --- | --- | --- |
| Dữ liệu thẻ | Regression HUD đổi `characterId` của lượt kết quả sang Kuromi và xác nhận renderer nhận portrait Kuromi, 1.760 điểm, 214m, cấp 3. | Đạt. |
| Chân dung thẻ | Kiểm tra browser trực tiếp hiển thị thẻ PNG có chân dung Kuromi, tên người chơi, điểm, quãng đường, cấp và hạng cùng một layout. | Đạt cục bộ. |
| Animation | Factory có chuyển động visual-only cho tai/đuôi Cinnamoroll, tai Pompompurin, hood/tai My Melody, jester/đuôi Kuromi, chỏm Badtz-Maru, mắt Keroppi, lòng trắng Gudetama và tai/nơ Hello Kitty. Root/hitbox không dịch chuyển. | 8 regression motion đạt. |
| Validation | `pnpm test` 62/62, `pnpm check` và build production đạt. | Đạt. |

Lượt kiểm tra public đầu tiên của checkpoint `49a04b25` cho thấy GitHub Pages đã hiện đúng màn kết quả với 1.760 điểm, cấp 3, 214m và ba thao tác thẻ/chia sẻ. Manus tại cùng thời điểm vẫn trả bundle landing cũ khi mở `?result=1`; đây là độ trễ CDN cần retry, không dùng làm kết quả pass. Các URL kiểm tra không điền tên hoặc bấm lưu hạng nên không ghi dữ liệu thử.

Retry Manus với cache-buster mới đã trả cùng màn kết quả hiện hành, gồm điểm 1.760, cấp 3, quãng đường 214m, Tải thẻ PNG và Chia sẻ thẻ. Fingerprint minified không giữ tên helper nên QA tiếp tục kiểm tra bằng thao tác xuất PNG thực tế; không suy ra pass chỉ từ tên hàm trong bundle.

Trong lượt xuất PNG public, browser kiểm thử từng chuyển sang trang trống nên QA mở lại `?result=1` với cache-buster mới; màn kết quả được khôi phục đầy đủ trước khi tiếp tục thao tác. Đây là trạng thái điều hướng kiểm thử, không có thao tác nhập tên hoặc lưu hạng.

Manus public đã hoàn tất xuất PNG: nút chuyển trạng thái thành “Đã tải thẻ PNG” mà không nhập tên hoặc tạo entry Top 20. GitHub Pages cũng trả cùng màn kết quả và sẵn sàng kiểm tra thao tác tải bằng cùng URL QA.

GitHub Pages cũng hoàn tất xuất PNG và chuyển nút thành “Đã tải thẻ PNG”. Hai bản public đã xác minh hành vi tải thẻ; các lần QA đều không điền tên và không gọi Lưu & xem hạng, nên dữ liệu Top 20 thực được giữ nguyên.

### QA setup mới — 23/08/2026

Tái hiện setup tại 360×780 và 390×844 trước khi chỉnh. Màn 360×780 không chồng khối nhưng lưới rất dày; tại 390×844, tên Cinnamoroll/Pompompurin/My Melody/Kuromi/Badtz-Maru/Keroppi/Gudetama/Hello Kitty bị cắt bởi bố cục icon–copy trong thẻ hai cột. Đây là lỗi responsive cần sửa bằng thẻ dạng hàng có cột icon cố định, tên được wrap hợp lệ và không dùng text clipping trên desktop/mobile.

Sau sửa, setup 360×780 và 390×844 đều dùng tên trước, khu mascot tùy chọn và card hai cột có tên wrap. Tám mascot hiển thị trong khung riêng, không cắt chữ hoặc đè lên icon/chip; CTA vẫn nhìn thấy ở cuối panel. Cinnamoroll được ghi rõ là mascot mặc định và chỉ tên hợp lệ mới mở khóa chạy/luyện tập.

Kiểm tra bổ sung 412×915 và desktop 1280×720: trường tên có hàng riêng trước mascot; preview, tên/tagline/orientation và ba chip chỉ số đã tách thành vùng grid độc lập; card chọn mascot không chồng với phần tóm tắt. Panel setup cuộn nội bộ trên chiều cao desktop thấp để không cắt nội dung ra ngoài viewport.

Lượt setup cục bộ chọn My Melody cho thấy preview runtime đổi ngay sang đúng character và CTA chuyển thành “Chạy cùng My Melody”; phần kiểm tra mặt trước–mặt lưng/đuôi đang được tiếp tục qua turntable cùng factory trước khi phát hành.

Turntable My Melody đã được xoay qua góc cạnh và mặt lưng trong cùng canvas runtime. Mặt/ thân giữ trắng, hood hồng nằm trên đầu; QA tiếp tục dùng camera gameplay từ sau để xác nhận đuôi trắng tròn đọc rõ ở góc chơi thật.

Gameplay desktop và 360×780 xác nhận camera phía sau nhìn rõ hood hồng phía sau đầu đến cổ, hai tai hồng, thân trắng và đuôi tròn trắng. Setup 360×780 đồng thời vẫn giữ lưới hai cột không overlap. My Melody preview/gameplay dùng chung factory `melody-hood-v5`; test factory kiểm tra hood nông theo trục Y, phần hood lùi ra sau theo trục Z và đuôi trắng ở local +Z.

Setup tablet 768×1024 hoàn tất ma trận responsive: hàng tên đi trước, thông báo mascot tùy chọn, preview/chỉ số và đủ tám card đều nằm trong panel không tràn hoặc overlap. Regression cục bộ đạt 63/63 test, TypeScript và build production; cảnh báo chunk Babylon vẫn là cảnh báo kích thước lazy-load đã biết.

Lượt Manus public đầu tiên của checkpoint `bed10d05` vẫn trả setup bundle cũ: copy “BƯỚC 2 / 2”, yêu cầu chạm chọn mascot và lưới 8 cột. Đây là stale CDN, không phải bằng chứng pass; cần retry cache-buster sau khi CDN đồng bộ. URL kiểm tra không nhập tên hoặc lưu điểm nên Top 20 không đổi.

GitHub Pages ở cùng checkpoint cũng đang trả bundle setup cũ và chưa tải portrait đầy đủ ở lượt đầu. Cả hai kênh public vẫn mở xác minh; không đánh dấu phát hành hoàn tất cho đến khi cùng thấy copy tên trước, mascot tùy chọn và lưới responsive mới.

Retry Manus đang tải `assets/index-Wvpi-IFy.js`; bundle này không chứa marker `melody-hood-v5`, `MASCOT TÙY CHỌN` hay `melodyRoundTail`. Vì vậy CDN vẫn phục vụ asset cũ đã xác minh bằng fingerprint, không phải lỗi quan sát UI. Cần phát hành một checkpoint bundle mới rồi kiểm tra lại bằng marker.

Sau checkpoint phát hành lại `c49df66a`, CDN đã trả entry mới: Manus `index-CrfWLHJS.js` và GitHub Pages `index-BqAjhxCK.js`. Hai bundle đều có `melody-hood-v5` và `melodyRoundTail`; tải HTML Manus bằng `cache: reload` cũng xác nhận copy “Nhập tên trước để chuyến bay” nằm trong bundle mới. Tab browser ban đầu vẫn giữ DOM cũ, nên cần hard-refresh tab trước khi kết luận kiểm tra UI public.

Sau khi xóa cache tab, Manus public đã render đúng UI mới: “BƯỚC 1 / 2 · TÊN NGƯỜI CHƠI”, “MASCOT TÙY CHỌN”, “MASCOT MẶC ĐỊNH” và điều kiện chỉ yêu cầu nhập tên. Lưới card hai cột không overlap ở viewport browser; không có tên/điểm được gửi. GitHub Pages vẫn cần lượt UI xác minh độc lập sau cache-buster.

GitHub Pages với cache-buster mới cũng render UI tên trước/mascot tùy chọn/Cinnamoroll mặc định. Manus demo My Melody xác nhận gameplay có hood hồng đến cổ, tai hồng, thân trắng và đuôi tròn trắng nhìn từ camera sau. Hai bản public đã dùng bundle mới; URL QA không nhập tên hoặc gửi điểm nên Top 20 giữ nguyên.

### QA cổng nhập tên bắt buộc — 24/08/2026

| Viewport | Bằng chứng quan sát | Kết quả |
| --- | --- | --- |
| Desktop 1280×720 | Setup chỉ hiện khối **Bước 1 · Tên người chơi · Bắt buộc** với ô nhập cao, viền hồng focus, hướng dẫn 2–20 ký tự và placeholder **Bước 2 · Bộ sưu tập mascot**. | Đạt; không có card mascot, preview hay CTA chạy để tương tác trước tên hợp lệ. |
| Mobile 360×780 | Ô tên, nhãn bắt buộc và placeholder Bước 2 xếp dọc, không che header hay bị cắt ở chiều cao Galaxy S22. | Đạt; không overlap, chữ placeholder tự xuống dòng hợp lệ. |

Regression HUD xác nhận khi tên trống, vùng mascot/CTA có `inert` và `aria-hidden`, không còn nút chọn Cinnamoroll trong cây tương tác. Ngay khi tên dài từ hai ký tự, vùng này mở lại cùng Cinnamoroll mặc định; người chơi có thể chạy ngay hoặc đổi mascot. Full suite 63/63 test và TypeScript đã đạt trước kiểm tra trực quan.

Ảnh bổ sung tại **390×844** và **412×915** giữ cùng thứ bậc: tiêu đề, ô tên có viền hồng, lời nhắc mở khóa và khung Bước 2. Không xuất hiện thanh cuộn ngang, chồng nhãn hoặc cắt text; khoảng cách theo chiều dọc vẫn đủ cho thao tác chạm.

Ảnh **768×1024** giữ form tên rộng, lời nhắc Bước 2 căn giữa và header không chồng lấn. Build production hoàn tất; cảnh báo duy nhất là chunk Babylon đã biết (khoảng 1,77 MB raw / 416 KB gzip), không phải lỗi build.

Sau checkpoint `652e0eab`, cả Manus public và GitHub Pages với cache-buster `name-gate-652e0eab` ban đầu vẫn hiển thị setup cũ có preview, 8 card mascot và CTA trước khi tên hợp lệ. Đây là bundle CDN stale, không khớp bản preview/regression mới; không ghi dữ liệu Top 20 trong lần kiểm tra này. Cần retry phát hành rồi xác minh fingerprint/UI mới trước khi đóng checklist.

Retry checkpoint `01ca1480` và lượt tải cache-buster thứ hai của Manus vẫn trả DOM setup cũ, dù preview local đã kiểm thử cổng tên. Bước xác minh tiếp theo phải xóa service worker/CacheStorage trong tab public hoặc lấy fingerprint bundle không cache, rồi mới kết luận về CDN; không có thao tác nhập tên/gửi điểm nào được thực hiện.

Fingerprint đọc trực tiếp trong tab Manus sau đó xác nhận DOM không có copy mở khóa, document root không có class trạng thái mới, và HTML tải bằng `fetch(..., { cache: "reload" })` vẫn tham chiếu `assets/index-CrfWLHJS.js`. Đây là entry cũ, nên kết quả stale được xác nhận độc lập với cache-buster URL. Cần một retry phát hành nữa để CDN nhận entry mới trước khi kiểm tra lại hai domain.

Sau retry checkpoint `ccc1b236` và thời gian đồng bộ, cả **Manus public** lẫn **GitHub Pages** tại URL cache-buster mới đều chỉ còn header, nội dung Bước 1, trường tên bắt buộc và khung nhắc **“Bước 2 · Bộ sưu tập mascot — Sẽ mở ngay sau khi bạn nhập tên hợp lệ.”**. Không có canvas preview, card mascot hoặc CTA chạy trong cây tương tác khi tên trống. Không nhập tên hay gửi điểm trong QA public, nên Top 20 không thay đổi.

### Rà soát đồng bộ đường chạy mây — 24/08/2026

Hình minh hoạ landing dùng một lối đi mây trắng, dải rìa bông mềm, gradient pastel và điểm tụ sâu ở chân trời. `GameWorld.buildTrack()` hiện dùng nền ribbon vàng kem, ba dải lane, seam xanh, trim vàng và puff viền; cấu trúc lane/hitbox đang tách khỏi mesh tạo hình. Lượt capture `?demo=1&qaDense=1` đầu tiên ghi được HUD nhưng canvas trắng, còn browser mở ngay sau navigation vẫn ở landing do timeout demo chưa hoàn tất; không có lỗi mới trong log runtime. Việc tái kiểm tra sau khi cập nhật road sẽ dùng capture ổn định hơn và không tạo entry Top 20.

Capture gameplay mới tại desktop 1280×720 và mobile 390×844 đã hiển thị lối mây trắng sâu dần tới chân trời, ba làn pastel/seam xanh nhạt, rìa puff, cụm mây/rainbow và vật cản rõ trên nền. Mascot trắng vẫn có bóng cyan ở chân để tách khỏi lối đi. Rìa puff đầu tiên còn đọc như từng viên tách rời ở tiền cảnh, nên sẽ giảm khoảng cách và cho các puff chồng mềm để giống dải mây liền mạch của landing hơn; lane/hitbox/spawn chưa thay đổi.

Sau tinh chỉnh, ảnh desktop 1280×720 và mobile 390×844 cho thấy rìa đường là các puff chồng liền thành dải mây, thu nhỏ đều về chân trời; mặt đường trắng và cụm mây pastel đọc cùng ngôn ngữ với minh hoạ landing. Seam xanh nhạt giữ ba làn có thể phân biệt, còn bóng cyan dưới mascot trắng giữ độ tách nền. Demo `qaDense` vẫn hiển thị đệm thấp, cổng mây và vật phẩm ở ba làn; regression 64/64 và TypeScript đạt, không thay đổi hitbox/spawn.

Sau checkpoint `f1ca502a`, Manus public và GitHub Pages với cache-buster đầu tiên vẫn cho đường ribbon vàng/kem cũ, không phải cloud runway trắng/rìa puff mới đã thấy tại local. Đây là CDN stale ở cả hai domain; URL QA chỉ dùng demo nên không nhập tên hoặc gửi điểm. Cần retry phát hành rồi xác minh lại screenshot public trước khi đóng checklist.

Sau retry `8e3fd6ca`, Manus vẫn trả ribbon vàng cũ ở lượt kiểm tra đầu; GitHub Pages đã nhận đúng cloud runway trắng với rìa puff chồng mềm, seam xanh nhạt và silhouette Cinnamoroll/tất cả vật thể vẫn rõ. Không có thao tác ghi điểm. Cần kiểm tra lại Manus sau thêm một chu kỳ CDN trước khi đóng phát hành hai domain.

Lượt Manus sau thời gian chờ vẫn render ribbon vàng. Fingerprint console của tab xác nhận entry `assets/index-Bjt9yEh4.js`, khác bundle mới đã build cục bộ; đây là CDN stale được xác nhận độc lập với URL cache-buster. GitHub Pages vẫn là bằng chứng public pass cho cloud runway, còn Manus cần một retry publish nữa; các URL demo không gọi API submit.

Sau retry `f7c68d87`, lượt view Manus hoàn tất khởi tạo và đã render đúng cloud runway trắng: đường sâu tới chân trời, rìa puff chồng mềm, seam cyan ba làn và bóng cyan dưới Cinnamoroll; đệm thấp, cổng mây và vật phẩm vẫn đọc rõ. GitHub Pages đã xác minh cùng tạo hình ở lượt trước. Toàn bộ QA public dùng `?demo=1&qaDense=1`, không nhập tên hoặc gọi API submit nên Top 20 không đổi.

### Thiết kế lại đường mây và hiệu ứng thành tích — 24/08/2026

Rà soát lại ảnh gameplay xác nhận bản trước có nền trắng chói và dải puff lặp đều, làm đường trông như các hạt xếp hàng. Bản dựng mới chuyển thành lõi đường cyan–trắng liền khối, trung tâm sáng hơn để định vị lane, hai lane ngoài xanh dịu, seam cyan đậm và bank mây theo cụm thưa tự nhiên. Ảnh desktop 1280×720/mobile 390×844 cho thấy Cinnamoroll có bóng cyan rõ, sao/cổng/đệm giữ silhouette và màu riêng trên nền; mây nhỏ dọc hai bên chuyển động rất chậm ngoài vùng va chạm. Không thay hitbox, tâm ba làn hoặc spawn.

Ảnh `?result=1&qaNewRecord=1` dùng cờ cục bộ không ghi điểm xác nhận khi điểm vượt kỷ lục, panel kết quả có ba dải cầu vồng hồng–vàng–mint và sparkle xuất hiện phía sau lớp chữ/nút, nên không chặn thao tác lưu/chia sẻ/quay lại. Cờ chỉ ép `highScore` trong runtime QA trước `endRun()`, không gọi API leaderboard và không ảnh hưởng lượt người chơi thật.

Ảnh mobile 390×844 xác nhận cầu vồng thu gọn theo panel, tiêu đề/chỉ số vẫn đọc được và bốn thao tác kết quả xếp dọc, không bị effect che. Full suite 65/65, TypeScript và build production đạt; cảnh báo bundle Babylon vẫn là cảnh báo kích thước lazy-load đã biết.

Lượt public `f08ac9c6`: GitHub Pages đã nhận road cyan–trắng tương phản mới, bank mây theo cụm thưa và seam cyan đậm; Cinnamoroll, sao, đệm đỏ và cổng tím vẫn tách nền. Manus còn trả đường white/puff dense của bundle cũ dù dùng cache-buster, nên cần retry CDN trước khi kết luận hai domain. Không nhập tên hay gửi điểm ở cả hai lượt demo.

Sau retry `9c439ea5`, Manus vẫn hiển thị version road trắng/puff dense cũ ở lượt kiểm tra đầu. Lệnh xem danh sách `document.scripts` trong tab canvas không trả entry asset để fingerprint độc lập, nên chỉ ghi nhận bằng ảnh, không suy đoán tên bundle. GitHub Pages tiếp tục là kênh public đã pass; cần thêm một lượt retry/đồng bộ Manus, các URL demo không ghi leaderboard.

Sau retry `54b6918c`, ảnh Manus vẫn là scene puff dense cũ. Thử lấy HTML cùng URL bằng `fetch(..., { cache: "reload" })` trong console bị chặn với `TypeError: Failed to fetch`, nên không lặp lại hoặc suy diễn fingerprint. GitHub Pages vẫn là bản public đã xác minh scene mới; cần dùng retry phát hành thay vì kết luận cache-buster đã đủ.

### Palette kem–hồng phấn dịu mắt — 24/08/2026

Palette cyan đã được thay bằng lõi kem ấm, lane ngoài hồng phấn, rìa/đám mây kem hồng và seam berry hồng. Ảnh desktop 1280×720 xác nhận màu mới đã bớt ánh trắng chói; sau tăng độ ấm vật liệu, ảnh mobile 390×844 cho thấy đường chạy kem rõ hơn, seam hồng vẫn định vị ba làn, Cinnamoroll trắng có bóng hồng tách nền, còn sao vàng/đệm đỏ/cổng tím giữ silhouette riêng. Mây trôi và cầu vồng kỷ lục không đổi, hitbox/spawn không đổi.

Lượt tinh chỉnh cuối hạ albedo lõi kem thêm một nấc để ánh sáng scene không thổi trắng đường chạy. Ảnh desktop và mobile hiện có lane giữa kem ấm, hai bên hồng phấn nhạt, viền/seam berry; Cinnamoroll trắng được tách bằng shadow hồng và vật phẩm/chướng ngại vẫn đọc rõ ngay khi xuất hiện từ xa. Kết quả đáp ứng yêu cầu dịu mắt hơn mà không đổi giao diện điều khiển hoặc luật chơi.

Sau checkpoint `046ef647`, GitHub Pages với cache-buster còn trả scene cyan cũ, nên chưa ghi nhận public pass. Lượt Manus cùng cache-buster bị timeout khi tải screenshot, không có ảnh để kết luận; không suy diễn kết quả từ tab trống. Hai URL đều là demo, không nhập tên hay gửi điểm. Cần retry phát hành rồi kiểm tra lại.

Sau retry `df6f8e64`, GitHub Pages đã render đúng palette kem–hồng phấn: lane giữa kem ấm, hai lane hồng phấn, seam berry, shadow hồng dưới Cinnamoroll; sao vàng, đệm đỏ và cổng tím tiếp tục tách nền. URL `?demo=1&qaDense=1` không nhập tên hoặc gọi API lưu điểm, nên Top 20 không thay đổi.
