# Đặc tả tham chiếu mascot runtime

Tài liệu này chuyển các đặc điểm thị giác nhận dạng từ hồ sơ nhân vật công khai thành yêu cầu tạo hình cho mascot 3D trong game. Model game vẫn là bản diễn giải low-poly/kawaii phục vụ gameplay, nhưng phải giữ đúng các dấu hiệu nhận diện ở khoảng nhìn xa: silhoutte, palette, tai/mào, dấu hiệu gương mặt và phụ kiện.

## Nhật ký nguồn

| Nhân vật | Phát hiện đã xác minh | Nguồn |
|---|---|---|
| Cinnamoroll | Chó con sống trên mây, tai lớn có thể vỗ để bay, đuôi xoắn như bánh cinnamon roll. | [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) |
| My Melody | Thỏ với hood do bà làm là dấu hiệu đặc trưng; tai dài là tín hiệu tình bạn. | [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) |
| Pompompurin | Golden retriever màu vàng với beret nâu cháy là dấu hiệu nhận dạng đặc trưng. | [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) |
| Kuromi | Sinh vật imp với mũ jester đen mang sọ ở phía trước và đuôi quỷ đen. | [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) |
| Keroppi | Cư dân Donut Pond tràn năng lượng; hình 2D đối chiếu cho thấy thân ếch xanh, mắt trắng rất lớn, cổ/áo sọc hồng và má hồng. | [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) |
| Bad Badtz-Maru | Chim cánh cụt tinh nghịch; hình 2D đối chiếu thể hiện thân đen, bụng trắng, mỏ/chân vàng và mào đen nhọn. | [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) |
| Gudetama | Nhân vật quả trứng lười, không có giới tính; minh hoạ 2D chuẩn dùng lòng đỏ vàng nằm trên lòng trắng. | [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) |
| Hello Kitty | Kitty White đeo nơ đỏ ở tai trái; hình 2D đối chiếu thể hiện mèo trắng, tai tam giác, mũi vàng và ba ria mỗi bên. | [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) |

Trang danh mục Sanrio SEA hiển thị hồ sơ theo cửa sổ cho từng nhân vật. Cinnamoroll đã được mở và đối chiếu trực tiếp với mô tả hồ sơ; các nhân vật còn lại sẽ được đối chiếu qua các nguồn character guide công khai và các mẫu 2D đã có trong game trước khi thay đổi runtime model.

## Yêu cầu đã chốt cho Cinnamoroll

Mascot Cinnamoroll phải có **thân và đầu trắng kem**, **hai tai dài rủ ngang sang hai bên** (không phải tai ngắn dựng), **tai trong xanh nhạt**, má hồng nhỏ, mắt oval xanh đậm và **đuôi cuộn tròn** dễ thấy khi xoay 360°. Những dấu hiệu này cần xuất hiện trong cùng factory Babylon mà gameplay và preview đang gọi.

## Yêu cầu đã chốt cho My Melody

Mascot My Melody phải có **hood hồng phủ trọn đầu**, **hai tai thỏ dài rủ từ hood**, **mặt trắng/kem mở khung bởi hood**, cùng **nơ hoa trắng–hồng lớn lệch về một bên**. Hood và đôi tai phải tạo silhouette rõ từ phía sau; không dùng tai ngắn/dựng rời khỏi hood.

## Yêu cầu đã chốt cho Pompompurin

Mascot Pompompurin phải là **golden retriever vàng pudding**, có **đầu rộng và thân tròn/bụng bầu**, **tai cụp dài nâu cháy**, **beret nâu cháy nhỏ đội chính giữa đỉnh đầu**, mũi nâu và má hồng. Beret và đôi tai phải là dấu hiệu đọc được ngay từ camera chạy, không chỉ là chi tiết nhỏ ở preview.

## Yêu cầu đã chốt cho Kuromi

Mascot Kuromi phải có **mặt trắng**, **mũ jester đen/tím than với hai chóp dài**, **biểu tượng đầu lâu hồng nổi ở trán**, tai/đầu không được biến thành bunny hood hồng, và **đuôi quỷ đen mảnh có đầu nhọn** ở sau lưng. Bảng màu phải tách rõ mặt trắng khỏi hood đen để silhouette đọc được từ xa.

## Yêu cầu đã chốt cho Keroppi

Mascot Keroppi phải có **đầu ếch xanh rộng**, **hai mắt trắng tròn cực lớn nhô trên đỉnh đầu**, đồng tử đen tách đôi, miệng cong/vòm màu tối và **áo cổ sọc hồng–trắng**. Đôi mắt phải cao và lớn hơn mặt, tránh biến nhân vật thành một quả cầu xanh có mắt nhỏ.

## Yêu cầu đã chốt cho Bad Badtz-Maru

Mascot Bad Badtz-Maru phải có **silhouette chim cánh cụt đen dạng giọt nước**, **mào tóc đen gồm bốn gai dày**, **bụng trắng bản lớn**, mắt trắng nửa khép mang nét cau có, **mỏ vàng nhỏ** và **bàn chân vàng bè**. Không dùng thân tròn chung với một mảng bụng nhỏ, vì sẽ mất ngay nhận diện penguin.

## Yêu cầu đã chốt cho Gudetama

Mascot Gudetama phải là **lòng đỏ vàng/cam thấp, dẹt và hơi chảy**, nằm lên **lòng trắng trứng trắng bất đối xứng lớn**, thay vì một nhân vật đứng có tay/chân. Mặt phải có mắt nửa khép, miệng chán chường và phần trắng viền rõ khỏi mặt đường. Dáng nằm là nhận diện quan trọng, kể cả khi animation chạy cần có chuyển động lăn/chao thay vì bước chân.

## Yêu cầu đã chốt cho Hello Kitty

Mascot Hello Kitty phải có **đầu mèo trắng rộng**, **hai tai tam giác**, **nơ đỏ/hồng cỡ lớn ở tai trái**, mắt oval đen, **mũi vàng** và **ba ria mảnh ở mỗi má**. Không tạo miệng rõ nét; phần nhận diện quan trọng là nơ một bên, mũi vàng và ria mép đối xứng.

## Bảng kiểm nhận diện trước khi dựng

| Mascot | Silhouette phải đọc được | Dấu hiệu không được bỏ |
|---|---|---|
| Cinnamoroll | Chó con tai rủ ngang | Tai dài xanh nhạt, đuôi cuộn |
| Pompompurin | Golden retriever tròn | Tai cụp nâu, beret nâu |
| My Melody | Bunny hood hồng | Tai rủ từ hood, hoa/nơ lớn |
| Kuromi | Jester tối màu | Skull hồng, hai chóp mũ, đuôi quỷ |
| Badtz-Maru | Penguin đen gai | Mào bốn gai, bụng trắng, mỏ/chân vàng |
| Keroppi | Ếch mắt khổng lồ | Hai mắt trắng nhô cao, áo sọc hồng |
| Gudetama | Lòng đỏ nằm | Lòng trắng bất đối xứng, mắt lười |
| Hello Kitty | Mèo trắng tai nhọn | Nơ trái, mũi vàng, sáu ria |

## Ghi nhận QA preview cục bộ

Canvas runtime đã tồn tại và nút xoay 90° phản hồi, nhưng đối chiếu Cinnamoroll ở khung setup nhỏ cho thấy góc khởi tạo đang ưu tiên mặt lưng/rim xanh, khiến tai dài và mặt trắng chưa đọc rõ ngay lập tức. Trước khi phát hành phải chỉnh góc camera/rotation mặc định về chính diện mascot, đồng thời kiểm tra khung 82px trên mobile vẫn giữ được tai và mặt.

Đối chiếu ảnh trước và sau xoay xác nhận model canvas là mesh runtime thật; ở góc chính diện, đặc điểm mắt/tai đã xuất hiện nhưng `rim` xanh quá đậm làm đầu/trán đọc thành xanh thay vì trắng. Palette Cinnamoroll phải giảm rim xuống xanh rất nhạt, giữ xanh rõ cho inner-ear và chấm đuôi để phần thân–đầu vẫn trắng ở khoảng nhìn nhỏ.

Sau khi hạ rim, Cinnamoroll đã đọc thành mặt trắng với điểm xanh nhạt. Pompompurin hiển thị được thân vàng pudding và beret nâu lớn trong cùng canvas runtime; lần kiểm tra tiếp theo cần tập trung vào việc các tai cụp vẫn nổi rõ khi xoay và duyệt sáu silhouette còn lại.

Sau khi đưa hood lùi sau mặt, My Melody đã hiện được mặt trắng với hood/tai hồng, và Kuromi hiện được mặt trắng trong mũ jester đen cùng skull phía trán. Các dấu hiệu nhận dạng chính diện của hai mascot bunny/imp nay không còn bị sphere hood che phủ.

Keroppi hiện đọc rõ nhất ở khung nhỏ nhờ hai mắt trắng nhô cao trên đầu xanh và mảng cổ áo hồng. Badtz-Maru giữ silhouette đen/mào nhọn; bước QA gameplay sau đó cần xác nhận bụng trắng và chân/mỏ vàng không bị mất khi camera lùi xa.

Gudetama hiện đúng dáng thấp với lòng đỏ vàng và biểu cảm lười; phần lòng trắng cùng nền sáng cần được kiểm tra trong gameplay, nơi có runway tối hơn. Hello Kitty hiện được đầu mèo trắng, hai tai, nơ đỏ một bên, mũi vàng và ria đối xứng trong preview runtime. Cả tám lựa chọn đã được đối chiếu bằng canvas tạo từ cùng factory, không phải ảnh portrait 2D.

## Ghi nhận QA gameplay cục bộ

Cinnamoroll và Keroppi đều đã được kiểm tra trong demo chạy ở quãng đường sớm, không chỉ trong setup. Cinnamoroll giữ đầu/thân trắng, tai dài xanh nhạt và mặt tròn; Keroppi giữ đầu xanh, mắt trắng lớn nhô cao và cổ áo hồng. Điều này xác nhận gameplay đang dùng chính factory đã kiểm thử ở canvas preview.

Badtz-Maru trong gameplay giữ được đầu cánh cụt đen, mào gai, bụng trắng lớn, mỏ và bàn chân vàng. Gudetama giữ dáng lòng đỏ thấp trên lòng trắng, mắt lười và phần trắng vẫn tách được trên đường chạy vàng sáng. Bốn kiểm tra gameplay đại diện (Cinnamoroll, Keroppi, Badtz-Maru, Gudetama) đều dùng đúng factory chung của preview.

## Theo dõi phát hành

Lượt đọc Manus public đầu tiên sau checkpoint `d1f69f20` đã có node canvas preview/runtime và demo chạy Cinnamoroll, nhưng màu thân vẫn giống bundle cũ (xanh đậm). Đây là dấu hiệu CDN chưa đổi bundle model mới, không phải bằng chứng pass public; cần chờ rồi retry với cache-buster trước khi đóng checklist phát hành.

Retry GitHub Pages với cache-buster của checkpoint đã hiển thị Cinnamoroll thân trắng/mặt nhận dạng trong chính canvas runtime; các ảnh portrait 2D vẫn tải qua URL origin Manus tuyệt đối. Manus public cũng trả canvas preview, đủ 8 lựa chọn và demo gameplay mà không tạo entry Top 20 vì không nộp tên. Lượt demo mới ở GitHub Pages sẽ là kiểm tra gameplay công khai cuối cùng.

GitHub Pages demo đã xác nhận Cinnamoroll trắng/tai dài đúng như factory mới. Lượt retry Manus demo tại cùng checkpoint vẫn đang trả model xanh đậm của bundle cũ, vì vậy hạng mục Manus public còn mở và phải retry sau độ trễ CDN; không dùng trạng thái tạm này để kết luận tạo hình phát hành đã đồng bộ.

Lượt retry thứ hai của Manus vẫn giữ model cũ. Việc đọc trực tiếp fingerprint script bị browser chặn do một script cross-origin, nên không coi đó là nguyên nhân lỗi code; phát hành checkpoint cập nhật tiếp theo sẽ được dùng để yêu cầu CDN làm mới rồi kiểm tra lại bằng cache-buster.

Sau lần phát hành lại, Manus đang tải `assets/index-BBY9yNlY.js` nhưng ảnh gameplay vẫn cho Cinnamoroll xanh đậm. Cần kiểm tra chính bundle cùng origin có chứa marker factory mới (`E6F8FF` và `cloudTailCurl`) trước khi retry tiếp, thay vì suy đoán từ ảnh.

Kiểm tra bundle cùng origin xác nhận `index-BBY9yNlY.js` của Manus không có cả hai marker factory mới. Ngược lại, GitHub Pages đã hiển thị Cinnamoroll trắng bằng canvas runtime. Đây là phân kỳ phát hành/CDN của Manus, không phải lỗi bản build hay factory; tiếp tục theo dõi bundle Manus sau khi publish lại.

Đối chiếu trực tiếp đã xác nhận bundle GitHub Pages `index-D_4u4v4U.js` có cả `E6F8FF` và `cloudTailCurl`, không còn marker rim cũ. Vì vậy GitHub Pages đã phát hành đúng factory mới; chỉ Manus còn chờ bundle thay thế.

Factory hiện công bố marker `recognition-v2` tại `root.metadata.mascotFactory`, kèm `characterId`, để mọi scene runtime tự mô tả đúng phiên bản silhouette đang dùng. Regression kiểm tra marker này cho cả tám nhân vật. Sau thay đổi, `pnpm test` đạt 53/53, `pnpm check` và `pnpm build` đều đạt.
