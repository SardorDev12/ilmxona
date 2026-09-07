import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Enables `getCloudflareContext()` (bindings, env vars) when running the
// regular `next dev` server, so local dev matches the Cloudflare Workers
// runtime used in production. No-op in production builds.
initOpenNextCloudflareForDev();
