import { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase/server-public";

/**
 * sitemap.xml 생성
 * 검색 엔진에 사이트 구조를 알려줍니다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 동적 페이지: 상품 상세 페이지
  try {
    const supabase = await createPublicSupabaseClient();
    const { data: products } = await supabase
      .from("products")
      .select("id, updated_at")
      .eq("is_active", true);

    const productPages: MetadataRoute.Sitemap =
      products?.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })) || [];

    return [...staticPages, ...productPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // 에러 발생 시 정적 페이지만 반환
    return staticPages;
  }
}

