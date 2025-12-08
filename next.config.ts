import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // Supabase Storage - 프로젝트 URL에서 호스트네임 추출
      { hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
