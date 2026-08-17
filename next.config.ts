import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
      // Receipt photos travel through a Server Action, and the default cap is
      // 1 MB — smaller than nearly every phone photo. The client downscales
      // before sending, so this is only the outer guard.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
