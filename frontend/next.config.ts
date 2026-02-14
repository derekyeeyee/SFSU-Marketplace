import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-061bd6f37c9346439c19d31155bf1f96.r2.dev",
        pathname: "/placeholders/**",
      },
      {
        protocol: "https",
        hostname: "af9ad843303dd77cc25adc46dadf37a8.r2.cloudflarestorage.com",
        pathname: "/sf-hacks-marketplace/placeholders/**",
      },
    ],
  },
};

export default nextConfig;
