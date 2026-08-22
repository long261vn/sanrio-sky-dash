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
