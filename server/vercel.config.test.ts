import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Vercel deployment configuration", () => {
  it("publishes the Vite client output and proxies leaderboard API requests", () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8")) as {
      framework: string;
      buildCommand: string;
      outputDirectory: string;
      rewrites: Array<{ source: string; destination: string }>;
    };

    expect(config.framework).toBe("vite");
    expect(config.buildCommand).toBe("pnpm run build:vercel");
    expect(config.outputDirectory).toBe("dist/public");
    expect(config.rewrites[0]).toEqual({
      source: "/api/:path*",
      destination: "https://sanriodash-ygyeg6qd.manus.space/api/:path*",
    });
    expect(config.rewrites[1]).toEqual({ source: "/:path*", destination: "/index.html" });
  });
});
