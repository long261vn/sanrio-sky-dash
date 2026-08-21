# Assets

**Art direction:** Kawaii editorial game UI với form đồ chơi vinyl mềm, texture giấy nhẹ, đường viền mực blueberry, nền xanh trời sữa, kem vanilla và điểm nhấn Sky Pudding vàng. Camera 2.5D từ sau người chạy, đường mây ba làn ở tâm màn hình.

## Backgrounds

| Name | Description | Size | Image |
| --- | --- | --- | --- |
| `sky-background` | Bầu trời xanh sữa, mây kem, đảo mây và cầu vồng nhẹ; lớp nền dưới canvas trong suốt. | 1920×1080, fullscreen | `/manus-storage/sky-dash-background-retry_124d904a.png` |
| `visual-target` | Reference in-game: đường mây ba làn, người chạy, vật phẩm và HUD. | 16:9, menu art 520px | `/manus-storage/sky-dash-menu-art-retry_f2351b45.png` |

## Sprites & Identity

| Name | Description | Size | Image |
| --- | --- | --- | --- |
| `character-pack` | Tám mascot chibi làm neo style cho selectable runners. | 120px tham chiếu mỗi nhân vật | `/manus-storage/sanrio-sky-dash-character-pack_ad85e837.png` |
| `obstacle-pack` | Mây mưa, macaron, vali, bubble, sao và gió mint. | 96–140px tham chiếu mỗi món | `/manus-storage/sanrio-sky-dash-obstacle-pack_423b7f6c.png` |
| `wish-star-logo` | Ngôi sao điều ước và đường mây; sử dụng ở menu/fav icon. | 72–112px | `/manus-storage/sky-dash-logo-retry_53835e27.png` |

## Runtime assignment

- `sky-background` → lớp nền cố định của `GameCanvas`.
- `visual-target` → artwork menu, nguồn QA bố cục cho `?demo`.
- `wish-star-logo` → dấu nhận diện lớn trong menu và favicon.
- `character-pack` / `obstacle-pack` → bộ tham chiếu trực quan cho mascot và props procedural trong `GameWorld`.

## Audio

| Name | Role | URL |
| --- | --- | --- |
| `hana-bgm` | Nhạc nền game-pop vui nhộn, 90 giây, lặp sau thao tác chơi đầu tiên. | `/manus-storage/hana-sky-dash-bgm_c55c1f2d.mp3` |
| `hana-sfx` | Button, nhặt sao, nhảy, lướt, khiên và game over. | `/manus-storage/button_7261cff8.mp3`, `/manus-storage/star_42549186.mp3`, `/manus-storage/jump_ae7164a5.mp3`, `/manus-storage/slide_52cc7eb5.mp3`, `/manus-storage/shield_492fe0ae.mp3`, `/manus-storage/gameover_34b8453a.mp3` |
