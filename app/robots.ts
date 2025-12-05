import { MetadataRoute } from "next";

/**
 * robots.txt 생성
 * 검색 엔진 크롤러가 사이트를 크롤링하는 방법을 제어합니다.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/checkout",
          "/cart",
          "/mypage/",
          "/orders/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

