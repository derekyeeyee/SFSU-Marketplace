import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-061bd6f37c9346439c19d31155bf1f96.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
