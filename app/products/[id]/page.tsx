import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createPublicSupabaseClient } from "@/lib/supabase/server-public";
import type { Product } from "@/types/product";
import { getCategoryName } from "@/types/category";
import QuantitySelector from "@/components/quantity-selector";
import RelatedProducts from "@/components/related-products";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddToCartButton from "@/components/add-to-cart-button";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 가격을 천 단위 콤마로 포맷팅
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

/**
 * 재고 상태를 확인하여 표시할 텍스트 반환
 */
function getStockStatus(stockQuantity: number): {
  text: string;
  className: string;
  disabled: boolean;
} {
  if (stockQuantity === 0) {
    return {
      text: "품절",
      className: "text-red-600 font-semibold",
      disabled: true,
    };
  }
  if (stockQuantity < 10) {
    return {
      text: `재고 ${stockQuantity}개`,
      className: "text-orange-600",
      disabled: false,
    };
  }
  return {
    text: "재고 있음",
    className: "text-green-600",
    disabled: false,
  };
}

/**
 * 상품 상세 정보 컴포넌트
 */
async function ProductDetail({ productId }: { productId: string }) {
  const supabase = await createPublicSupabaseClient();

  // 상품 정보 조회
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  const typedProduct = product as Product;
  const stockStatus = getStockStatus(typedProduct.stock_quantity);

  // 관련 상품 조회 (같은 카테고리)
  let relatedProductsQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .neq("id", productId);

  if (typedProduct.category) {
    relatedProductsQuery = relatedProductsQuery.eq("category", typedProduct.category);
  }

  const { data: relatedProducts } = await relatedProductsQuery
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      {/* 뒤로가기 버튼 */}
      <Link href="/products" className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>상품 목록으로</span>
      </Link>

      {/* 상품 상세 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* 상품 이미지 */}
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <svg
              className="w-24 h-24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          {/* 카테고리 */}
          {typedProduct.category && (
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {getCategoryName(typedProduct.category)}
            </div>
          )}

          {/* 상품명 */}
          <h1 className="text-3xl lg:text-4xl font-bold">
            {typedProduct.name}
          </h1>

          {/* 가격 */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-bold text-primary">
              {formatPrice(typedProduct.price)}
            </span>
          </div>

          {/* 재고 상태 */}
          <div>
            <span className={`text-sm ${stockStatus.className}`}>
              {stockStatus.text}
            </span>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {/* 수량 선택 및 장바구니 추가 */}
            <AddToCartButton
              product={typedProduct}
              disabled={stockStatus.disabled}
            />
          </div>

          {/* 설명 */}
          {typedProduct.description && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-3">상품 설명</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {typedProduct.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 관련 상품 */}
      {relatedProducts && relatedProducts.length > 0 && (
        <RelatedProducts
          products={relatedProducts as Product[]}
          currentProductId={typedProduct.id}
        />
      )}
    </>
  );
}

/**
 * 로딩 스켈레톤 UI
 */
function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse mb-4" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * 상품 상세 페이지
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail productId={id} />
        </Suspense>
      </div>
    </div>
  );
}

