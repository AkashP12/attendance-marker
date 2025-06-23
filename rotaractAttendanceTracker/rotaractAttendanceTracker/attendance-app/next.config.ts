import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // ✅ tells Next.js to statically export
  distDir: 'out',   // ✅ where to output the files
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
