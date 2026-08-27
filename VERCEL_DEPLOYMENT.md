# Triển khai Vercel

Repository này dùng Vite cho game client và backend tRPC/MySQL đang chạy tại Manus. `vercel.json` buộc Vercel chỉ xuất bản thư mục `dist/public`; vì vậy Vercel không còn phục vụ nhầm bundle Express `dist/index.js` dưới dạng trang chủ.

Lệnh build riêng của Vercel là `pnpm run build:vercel`. Các request `/api/*` được reverse-proxy về backend Manus, giữ nguyên API Top 20 và không yêu cầu sao chép dữ liệu sang Vercel.

Nếu project Vercel chưa tự redeploy sau khi nhánh `main` được cập nhật, vào **Deployments** và chọn **Redeploy** bản mới nhất. Không cần đặt Output Directory trong dashboard vì `vercel.json` đã ép giá trị `dist/public`.
