/** Các bản ngoài Manus cần đọc asset S3 từ origin Manus tuyệt đối, không dùng đường dẫn tương đối. */
export const MANUS_ASSET_ORIGIN = "https://sanriodash-ygyeg6qd.manus.space";
const configuredAssetOrigin = (import.meta.env.VITE_ASSET_ORIGIN || "").replace(/\/$/, "");
const localBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export function resolveAssetOrigin(hostname = typeof window === "undefined" ? "" : window.location.hostname, configuredOrigin = configuredAssetOrigin) {
  if (configuredOrigin) return configuredOrigin;
  const isExternalStaticHost = hostname.endsWith(".vercel.app") || hostname.endsWith(".github.io");
  return isExternalStaticHost ? MANUS_ASSET_ORIGIN : "";
}

export function assetUrl(filename: string) {
  const externalOrigin = resolveAssetOrigin();
  return externalOrigin
    ? `${externalOrigin}/manus-storage/${filename}`
    : `${localBase}/manus-storage/${filename}`;
}
