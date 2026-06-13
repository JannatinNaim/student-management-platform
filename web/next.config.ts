import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    // Proxy uploaded files in development so local-storage URLs resolve
    return [{ source: "/uploads/:path*", destination: `${API_URL}/uploads/:path*` }];
  },
};

export default nextConfig;
