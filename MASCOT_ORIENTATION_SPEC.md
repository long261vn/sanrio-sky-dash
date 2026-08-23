# Đặc tả hướng chạy và mặt trước–mặt sau của mascot

## Hợp đồng orientation

Trong gameplay, camera đặt ở phía âm trục Z nhìn về hướng dương Z dọc đường chạy. Mascot chạy theo vector **+Z** nên mặt phải hướng **+Z**; camera theo sau sẽ nhìn thấy **phần lưng đúng thiết kế**. Đây là orientation hợp logic của một endless runner, thay vì để mascot chạy ngược mặt về camera.

> Quy tắc nghiệm thu: ở gameplay, mắt/mũi/mặt trước hướng `+Z` và không thấy từ camera; đuôi, lưng, sau hood hoặc sau mũ hướng `-Z` về phía camera. Preview 360° mở đầu ở mặt trước, rồi cho phép xoay sang lưng để đối chiếu cùng mesh runtime.

## Chẩn đoán lỗi cũ

Factory dựng chi tiết gương mặt ở local `-Z`, đúng với camera preview ở `-Z`. Tuy nhiên `GameWorld` không xoay root của runner trước khi chạy, khiến mascot cũng nhìn `-Z` về camera: trông như đang chạy ngược. Camera gameplay ở `(0, 5.7, -12.8)` nhìn về `+Z`; vì vậy root runtime phải quay `π` quanh trục Y để mặt local `-Z` chuyển thành world `+Z`.

Sau chỉnh sửa, preview giữ root ở góc mặt trước; gameplay áp dụng orientation chạy trên **chính factory đó**. Nhờ vậy không có model thay thế, chỉ khác góc nhìn theo ngữ cảnh.

## QA orientation cục bộ

Lượt chạy trực tiếp xác nhận Cinnamoroll giờ chạy về `+Z`: camera thấy sau đầu trắng, hai tai dài và đuôi cuộn, không thấy mắt/mũi. Pompompurin cũng hiện lưng vàng với hai tai cụp và phần beret nâu trên đỉnh, không còn lộ mặt trước trong lúc chạy. Ảnh batch đồng thời có trạng thái khởi tạo canvas không ổn định, vì vậy chỉ dùng lượt browser đơn lẻ làm bằng chứng orientation.

Ảnh 2D trong lưới chọn được giữ làm minh hoạ **mặt trước** vì đây là bộ hình người chơi đã xác nhận đúng nhận diện; mỗi thẻ nay ghi rõ “Ảnh mặt trước” và có nhãn truy cập tương ứng. Preview 360° mở ở mặt trước cùng factory runtime, còn gameplay nhìn lưng khi mascot chạy về phía trước. Kiểm thử UI bảo vệ hai nhãn này.

## Theo dõi phát hành

Lượt public đầu tiên sau checkpoint `9c881d28` trả setup/gameplay bundle cũ trên cả Manus và GitHub Pages: chưa có dòng “Preview 360°: mặt trước · gameplay: nhìn lưng khi chạy” hoặc nhãn “Ảnh mặt trước”. Đây là trạng thái CDN/Pages chưa đồng bộ, không dùng làm kết quả phát hành; cần retry cache-buster trước khi đóng QA public.

Retry Manus hiện vẫn tải `assets/index-saIMwz_X.js`; kiểm tra bundle cùng origin không có marker `orientation-v3`, nhãn ảnh mặt trước hoặc hint orientation. Đây là bằng chứng CDN cũ, không phải lỗi code mới; tiếp tục retry sau khoảng đồng bộ.

GitHub Pages đã đồng bộ: setup hiện đủ tám thẻ có nhãn “Ảnh mặt trước” và hint orientation, còn demo Cinnamoroll cho thấy sau đầu/tai dài/đuôi cuộn từ camera phía sau khi chạy +Z. Không có tên người chơi nào được nộp trong URL QA. Manus vẫn cần retry riêng.

Để yêu cầu một bundle public mới dễ phân biệt, marker factory được nâng thành `orientation-v4`. `pnpm test` vẫn đạt 54/54, `pnpm check` và `pnpm build` đạt trước checkpoint phát hành lại.

## Nguồn và phát hiện đã xác minh

| Nhân vật | Phát hiện nguồn | Hệ quả orientation |
|---|---|---|
| Cinnamoroll | Hồ sơ Sanrio SEA mô tả tai lớn có thể vỗ và đuôi cuộn như cinnamon roll. [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) | Tai dài phải đọc được ở cả trước/sau; đuôi cuộn là chi tiết chỉ thuộc mặt sau, đặt `z > 0`. |

## Bảng thiết kế đang xây dựng

| Mascot | Mặt trước khi chạy (camera nhìn thấy) | Mặt sau khi preview xoay | Trạng thái |
|---|---|---|---|
| Cinnamoroll | Mặt trắng, mắt xanh đậm, tai dài rủ ngang có inner-ear xanh nhạt. | Sau đầu trắng, hai tai dài, đuôi cuộn trắng/xanh nhạt nổi rõ ở lưng dưới. | Đã xác minh nguồn tai/đuôi. |
| Pompompurin | Thân vàng pudding, mắt/mõm nâu, tai golden-retriever cụp dài sang hai bên, beret nâu cháy trên đỉnh. | Sau đầu/thân vàng, hai tai cụp và beret nâu vẫn giữ silhouette; không đặt mắt/mõm ở phía sau. | Đã xác minh beret; tai cụp đối chiếu minh hoạ chính thức. |
| My Melody | Mặt thỏ trắng, hood hồng ôm đầu, hoa/nơ hồng ở tai trái theo hướng người xem, hai tai dài rủ. | Mặt sau phải là dome hood hồng liên tục và hai tai dài, còn hoa/nơ giữ ở cạnh ngoài; không lộ mắt/mũi. | Đã xác minh hood/tai dài; hoa theo ảnh chọn hiện có. |
| Kuromi | Mặt thỏ trắng, mũ jester đen có hai gai, skull hồng ở **trán phía trước**, mắt/miệng mischievous. | Sau mũ jester đen và hai gai, không lặp skull; đuôi quỷ đen nhỏ nhô rõ ở lưng dưới. | Đã xác minh skull mặt trước và đuôi quỷ. |
| Badtz-Maru | Đầu/thân cánh cụt đen, mào gai dựng, mắt hẹp, mỏ vàng và bụng trắng có đường giữa. | Khối lưng đen và mào gai tiếp tục đọc rõ; không có bụng trắng/mỏ/mắt ở phía sau. | Đã xác minh là cánh cụt và đối chiếu minh hoạ chính thức. |
| Keroppi | Đầu/thân xanh, hai mắt trắng cực lớn nhô trên đỉnh, con ngươi/miệng/má hồng và cổ áo sọc hồng ở trước. | Dome đầu xanh phía sau, hai globe mắt vẫn tạo silhouette trên đỉnh nhưng không có con ngươi/miệng/cổ áo trước. | Đã đối chiếu minh hoạ chính thức. |
| Gudetama | Lòng đỏ vàng thấp nằm trên lòng trắng, mặt lười/mắt–miệng và hai tay nhỏ đều ở bán cầu trước. | Mặt sau là lòng đỏ vàng trơn nổi trên lòng trắng loang bất đối xứng; không lặp mặt. | Đã xác minh chủ thể quả trứng và đối chiếu minh hoạ chính thức. |
| Hello Kitty | Đầu mèo trắng, tai tam giác, mắt đen/mũi vàng, sáu ria và nơ đỏ ở tai trái theo hướng người xem. | Sau đầu mèo trắng với hai tai tam giác; nơ đỏ nhìn thấy cạnh/sau nhưng không lặp mắt, mũi hay ria. | Đã xác minh nơ ở tai trái và đối chiếu minh hoạ chính thức. |

Hồ sơ Pompompurin của Sanrio SEA xác nhận đây là golden retriever và beret nâu cháy là dấu hiệu đặc trưng. [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) Điều này khóa beret ở đỉnh/sau đầu và tai cụp ở hai bên cho cả vòng xoay, nhưng chỉ mắt/mõm thuộc bán cầu trước.

Hồ sơ My Melody của Sanrio SEA xác nhận hood do bà làm là dấu hiệu nhận dạng và tai dài là “antenna for friendship”. [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) Do đó hood và tai phải có độ dày phía sau, thay vì là một mặt phẳng chỉ tồn tại ở góc trước.

Hồ sơ Kuromi của Sanrio SEA xác nhận mũ jester đen có skull ở **mặt trước** và đuôi quỷ đen. [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) Đây là ca orientation nhạy cảm: skull không được xuất hiện ở gameplay nếu root đang quay lưng, còn đuôi không được chen vào mặt trước.

Hồ sơ Keroppi của Sanrio SEA xác nhận nhân vật là cư dân Donut Pond. [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) Minh hoạ chính thức đi kèm xác nhận mấu chốt silhouette là cặp mắt nhô cao; đặc điểm này phải hiện ở cả góc sau, nhưng các chi tiết vẽ mặt chỉ ở phía camera.

Hồ sơ Bad Badtz-Maru của Sanrio SEA xác nhận đây là một cậu bé cánh cụt. [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) Minh hoạ chính thức giúp chốt bụng trắng và mỏ vàng là chi tiết mặt trước, trong khi mào gai là silhouette xuyên cả hai mặt.

Hồ sơ Gudetama của Sanrio SEA xác nhận nhân vật là một quả trứng lười. [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) Model vì vậy cần định hướng bằng mặt trên lòng đỏ, không thể dùng hình người đứng hoặc đặt mắt ở cả hai hướng.

Hồ sơ Hello Kitty của Sanrio SEA xác nhận nơ đỏ nằm ở tai trái. [Sanrio SEA – Characters](https://sanrio-sea.com/characters/) Nơ phải được neo vào đúng bên tai trong không gian 3D để preview xoay cho thấy nó từ cạnh/sau nhưng gameplay vẫn cho mặt, mũi và ria nhìn thẳng camera.
