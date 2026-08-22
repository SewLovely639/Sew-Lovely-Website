import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
  void initOpenNextCloudflareForDev({
    configPath: "wrangler.jsonc",
    remoteBindings: true,
  });
}

const nextConfig: NextConfig = {};

export default nextConfig;
