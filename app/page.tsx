import { Suspense } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/server-public";
import ProductGrid from "@/components/product-grid";
import CategoryGrid from "@/components/category-grid";
import PromotionSection from "@/components/promotion-section";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

/**
 * 카테고리 목록 데이터 페칭 컴포넌트
 */
async function CategoryList() {
  const supabase = await createPublicSupabaseClient();

  // 카테고리별 상품 개수 조회
  const { data: products, error } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching categories:", error);
    return null;
  }

  // 카테고리별 개수 계산
  const categoryCounts = new Map<string, number>();
  products?.forEach((product) => {
    if (product.category) {
      categoryCounts.set(
        product.category,
        (categoryCounts.get(product.category) || 0) + 1
      );
    }
  });

  // Category 배열로 변환
  const categories: Category[] = Array.from(categoryCounts.entries()).map(
    ([code, count]) => ({
      code,
      name: code,
      count,
    })
  );

  // 상품 개수 기준 내림차순 정렬
  categories.sort((a, b) => b.count - a.count);

  return <CategoryGrid categories={categories} />;
}

/**
 * 신상품 데이터 페칭 컴포넌트
 */
async function NewProducts() {
  const supabase = await createPublicSupabaseClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Error fetching new products:", error);
    return null;
  }

  return (
    <PromotionSection
      products={(products as Product[]) || []}
      title="신상품"
    />
  );
}

/**
 * 상품 목록 데이터 페칭 컴포넌트
 * 
 * 상품 목록은 공개 데이터이므로 인증이 필요 없습니다.
 * 공개 서버 클라이언트를 사용하여 데이터를 가져옵니다.
 */
async function ProductList() {
  const supabase = await createPublicSupabaseClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching products:", error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          상품을 불러오는 중 오류가 발생했습니다.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  return <ProductGrid products={(products as Product[]) || []} />;
}

/**
 * 로딩 스켈레톤 UI
 */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
        >
          <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 카테고리 섹션 스켈레톤 UI
 */
function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse p-3 sm:p-4"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 프로모션 섹션 스켈레톤 UI
 */
function PromotionSectionSkeleton() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
            >
              <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 홈 페이지
 * 카테고리 → 프로모션(신상품) → 전체 상품 목록 순서로 표시합니다.
 */
export default function Home() {
  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto space-y-16">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            쇼핑몰에 오신 것을 환영합니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            다양한 상품을 만나보세요
          </p>
        </div>

        {/* 카테고리 섹션 */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl lg:text-2xl font-bold">카테고리</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              원하는 카테고리를 선택하세요
            </p>
          </div>
          <Suspense fallback={<CategoryGridSkeleton />}>
            <CategoryList />
          </Suspense>
        </section>

        {/* 프로모션 섹션 (신상품) */}
        <section>
          <Suspense fallback={<PromotionSectionSkeleton />}>
            <NewProducts />
          </Suspense>
        </section>

        {/* 전체 상품 목록 */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold">전체 상품</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              모든 상품을 둘러보세요
            </p>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductList />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
