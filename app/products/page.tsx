/**
 * @file app/products/page.tsx
 * @description Coloshop 스타일 상품 목록 페이지
 *
 * 구조:
 * - 페이지 헤더 (히어로 스타일)
 * - 카테고리 필터 탭
 * - 정렬 버튼 그룹
 * - 상품 그리드
 */

import { Suspense } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/server-public";
import ProductCard from "@/components/product-card";
import LoadMoreProducts from "@/components/load-more-products";
import SortSelector from "@/components/sort-selector";
import type { Product } from "@/types/product";
import { getCategoryName } from "@/types/category";
import Link from "next/link";
import { PackageX, Grid3X3 } from "lucide-react";

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

  let query = supabase.from("products").select("*").eq("is_active", true);

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
      <div className="text-center py-16">
        <PackageX className="w-16 h-16 mx-auto text-destructive mb-4" />
        <p className="text-destructive font-medium">
          상품을 불러오는 중 오류가 발생했습니다.
        </p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <PackageX className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">표시할 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {(products as Product[]).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

/**
 * 로딩 스켈레톤 UI
 */
function ProductGridSkeleton() {
  return (
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
  );
}

/**
 * 카테고리 필터 컴포넌트 - Coloshop 스타일 탭
 */
async function CategoryFilter({
  currentCategory,
}: {
  currentCategory?: string;
}) {
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
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
      <Link
        href="/products"
        className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium uppercase border rounded trans-300 ${
          !currentCategory
            ? "bg-primary text-white border-primary"
            : "bg-background text-foreground border-border hover:bg-primary hover:text-white hover:border-primary"
        }`}
      >
        전체
      </Link>
      {categoryArray.map((cat) => (
        <Link
          key={cat}
          href={`/products?category=${cat}`}
          className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium uppercase border rounded trans-300 ${
            currentCategory === cat
              ? "bg-primary text-white border-primary"
              : "bg-background text-foreground border-border hover:bg-primary hover:text-white hover:border-primary"
          }`}
        >
          {getCategoryName(cat)}
        </Link>
      ))}
    </div>
  );
}

/**
 * 상품 목록 페이지
 */
export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const sort = params.sort || "newest";

  return (
    <div className="min-h-screen mt-[130px]">
      {/* 페이지 헤더 - 히어로 스타일 */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            {category ? getCategoryName(category) : "전체 상품"}
          </h1>
          <p className="text-white/70 text-sm sm:text-base">
            {category
              ? `${getCategoryName(category)} 카테고리의 상품을 만나보세요`
              : "다양한 상품을 만나보세요"}
          </p>
        </div>
      </div>

      {/* 필터 및 정렬 섹션 */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* 카테고리 필터 */}
          <div className="mb-6 sm:mb-8">
            <Suspense
              fallback={
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-20 bg-muted rounded animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <CategoryFilter currentCategory={category} />
            </Suspense>
          </div>

          {/* 정렬 및 뷰 옵션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">그리드 뷰</span>
            </div>
            <SortSelector currentSort={sort} category={category} />
          </div>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductList category={category} sort={sort} />
        </Suspense>

        {/* 더보기 버튼 */}
        <div className="mt-8">
          <LoadMoreProducts
            category={category}
            sort={sort}
            initialCount={20}
          />
        </div>
      </div>
    </div>
  );
}
