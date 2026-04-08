import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // TypeScript già controlla gli errori — ESLint lo gestiamo separatamente
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ykvhlckajrkbdezmnakv.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
