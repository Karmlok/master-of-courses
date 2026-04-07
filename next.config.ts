import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // TypeScript già controlla gli errori — ESLint lo gestiamo separatamente
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
