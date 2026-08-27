import { describe, expect, it } from "vitest";
import { MANUS_ASSET_ORIGIN, resolveAssetOrigin } from "./assets";

describe("asset origin resolution", () => {
  it("uses the Manus storage origin on Vercel and GitHub Pages", () => {
    expect(resolveAssetOrigin("sanrio-sky-dash.vercel.app", "")).toBe(MANUS_ASSET_ORIGIN);
    expect(resolveAssetOrigin("long261vn.github.io", "")).toBe(MANUS_ASSET_ORIGIN);
  });

  it("keeps a configured origin and Manus-local assets authoritative", () => {
    expect(resolveAssetOrigin("sanriodash-ygyeg6qd.manus.space", "https://assets.example.com/")).toBe("https://assets.example.com/");
    expect(resolveAssetOrigin("sanriodash-ygyeg6qd.manus.space", "")).toBe("");
  });
});
