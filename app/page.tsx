/**
 * @file app/page.tsx
 * @description Coloshop 스타일 홈페이지
 *
 * 구조:
 * 1. 히어로 슬라이더
 * 2. 카테고리 배너 (3컬럼)
 * 3. 신상품 그리드
 * 4. Deal of the Week
 * 5. 베스트셀러 슬라이더
 * 6. 혜택 섹션
 * 7. 뉴스레터
 */

import { Suspense } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/server-public";
import HeroSlider from "@/components/hero-slider";
import CategoryBanner from "@/components/category-banner";
import ProductGrid from "@/components/product-grid";
import ProductSlider from "@/components/product-slider";
import DealOfWeek from "@/components/deal-of-week";
import BenefitsSection from "@/components/benefits-section";
import NewsletterSection from "@/components/newsletter-section";
import type { Product } from "@/types/product";

/**
 * 신상품 데이터 페칭 컴포넌트
 */
async function NewArrivals() {
  const supabase = await createPublicSupabaseClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching new products:", error);
    return null;
  }

  return (
    <ProductGrid
      products={(products as Product[]) || []}
      title="신상품"
      showTitle={true}
    />
  );
}

/**
 * 베스트셀러 데이터 페칭 컴포넌트
 */
async function BestSellers() {
  const supabase = await createPublicSupabaseClient();

  // 실제로는 판매량 기준으로 정렬해야 하지만, 현재는 재고가 적은 순으로 대체
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching best sellers:", error);
    return null;
  }

  return (
    <ProductSlider
      title="베스트셀러"
      products={(products as Product[]) || []}
    />
  );
}

/**
 * 로딩 스켈레톤 - 상품 그리드
 */
function ProductGridSkeleton() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* 타이틀 스켈레톤 */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="h-10 bg-muted rounded w-40 mx-auto animate-pulse" />
        </div>

        {/* 그리드 스켈레톤 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-background border border-border rounded-lg overflow-hidden animate-pulse"
            >
              <div className="w-full aspect-square bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 로딩 스켈레톤 - 슬라이더
 */
function SliderSkeleton() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-14">
          <div className="h-10 bg-muted rounded w-40 mx-auto animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[200px] bg-background border border-border rounded-lg overflow-hidden animate-pulse"
            >
              <div className="w-full aspect-square bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 홈 페이지
 */
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 히어로 슬라이더 */}
      <HeroSlider />

      {/* 카테고리 배너 */}
      <CategoryBanner />

      {/* 신상품 */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <NewArrivals />
      </Suspense>

      {/* Deal of the Week */}
      <DealOfWeek />

      {/* 베스트셀러 */}
      <Suspense fallback={<SliderSkeleton />}>
        <BestSellers />
      </Suspense>

      {/* 혜택 섹션 */}
      <BenefitsSection />

      {/* 뉴스레터 */}
      <NewsletterSection />
    </div>
  );
}
