# Runtime Structure — Sanrio Sky Dash

> **Thiết kế Mây Bông & Kẹo Ngọt:** React là khung postcard/HUD; Babylon là sân chơi 2.5D; mọi gameplay nằm trong TypeScript độc lập với React.

| Khu vực | Trách nhiệm |
| --- | --- |
| `client/src/components/GameCanvas.tsx` | Vòng đời engine an toàn, lớp nền minh hoạ và ghép HUD trên canvas. |
| `client/src/components/SkyDashHud.tsx` | Menu, chọn nhân vật, HUD, pause, kết quả và các thao tác điều khiển DOM. |
| `client/src/game/scene.ts` | Tạo scene, camera, ánh sáng, world và contract `GameHandle`. |
| `client/src/game/GameWorld.ts` | Đường chạy, player, spawn, va chạm, tính điểm, input và state machine. |
| `client/src/game/types.ts` | Bộ dữ liệu nhân vật, command và snapshot giao tiếp HUD. |

## Data contract

`GameWorld` phát sự kiện `skydash:state` để HUD đọc snapshot; HUD gửi `skydash:command` để yêu cầu hành động. Sự kiện là cầu nối duy nhất giữa React và game loop.

## Asset hints

| Asset | Vai trò | Kích thước hiển thị |
| --- | --- | --- |
| Nền bầu trời mây | Lớp nền dưới canvas trong suốt | Fullscreen 1920×1080 |
| Visual target | Nghệ thuật chủ đạo trên menu | Khung 16:9, tối đa 520px rộng |
| Logo sao–đường mây | Nhận diện menu/fav icon | 72–112px |
| Bộ mascot | Neo phong cách/chỉ dẫn tạo silhouette runtime | 120px mỗi nhân vật tham chiếu |
| Bộ vật phẩm | Neo phong cách cho sprite procedural | 96–140px mỗi món |
