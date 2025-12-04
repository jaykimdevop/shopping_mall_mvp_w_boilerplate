import { Suspense } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/server-public";
import ProductGrid from "@/components/product-grid";
import LoadMoreProducts from "@/components/load-more-products";
import type { Product } from "@/types/product";
import { getCategoryName } from "@/types/category";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
  }>;
}

/**
 * 상품 목록 데이터 페칭 컴포넌트
 */
async function ProductList({
  category,
  sort = "newest",
}: {
  category?: string;
  sort?: string;
}) {
  const supabase = await createPublicSupabaseClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  // 카테고리 필터링
  if (category) {
    query = query.eq("category", category);
  }

  // 정렬
  switch (sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // 초기 로드: 20개
  const { data: products, error } = await query.limit(20);

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
 * 카테고리 필터 컴포넌트
 */
async function CategoryFilter({ currentCategory }: { currentCategory?: string }) {
  const supabase = await createPublicSupabaseClient();

  // 모든 카테고리 조회
  const { data: products } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  const categories = new Set<string>();
  products?.forEach((p) => {
    if (p.category) categories.add(p.category);
  });

  const categoryArray = Array.from(categories);

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link href="/products">
        <Button
          variant={!currentCategory ? "default" : "outline"}
          size="sm"
        >
          전체
        </Button>
      </Link>
      {categoryArray.map((cat) => (
        <Link key={cat} href={`/products?category=${cat}`}>
          <Button
            variant={currentCategory === cat ? "default" : "outline"}
            size="sm"
          >
            {getCategoryName(cat)}
          </Button>
        </Link>
      ))}
    </div>
  );
}

/**
 * 정렬 옵션 컴포넌트
 */
function SortSelector({ currentSort }: { currentSort: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm text-gray-600 dark:text-gray-400">정렬:</span>
      <div className="flex gap-2">
        <Link href={`/products?${currentSort === "newest" ? "" : "sort=newest"}`}>
          <Button
            variant={currentSort === "newest" ? "default" : "outline"}
            size="sm"
          >
            최신순
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * 상품 목록 페이지
 */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || "newest";

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            {category ? getCategoryName(category) : "전체 상품"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {category
              ? `${getCategoryName(category)} 카테고리의 상품을 만나보세요`
              : "다양한 상품을 만나보세요"}
          </p>
        </div>

        {/* 필터 및 정렬 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Suspense fallback={<div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />}>
            <CategoryFilter currentCategory={category} />
          </Suspense>
          <SortSelector currentSort={sort} />
        </div>

        {/* 상품 목록 */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductList category={category} sort={sort} />
        </Suspense>

        {/* 더보기 버튼 */}
        <LoadMoreProducts
          category={category}
          sort={sort}
          initialCount={20}
        />
      </div>
    </div>
  );
}

