import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare build focuses on production output; ESLint runs separately (pnpm -F web lint)
  // and can be affected by ESLint major version differences.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
