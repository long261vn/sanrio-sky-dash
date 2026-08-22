/** GitHub Pages: giữ asset của game dùng nguồn tuyệt đối khi build ngoài Manus. */
const externalOrigin = (import.meta.env.VITE_ASSET_ORIGIN || "").replace(/\/$/, "");
const localBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export function assetUrl(filename: string) {
  return externalOrigin
    ? `${externalOrigin}/manus-storage/${filename}`
    : `${localBase}/manus-storage/${filename}`;
}
