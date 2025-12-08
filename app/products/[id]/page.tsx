/**
 * @file app/products/[id]/page.tsx
 * @description Coloshop 스타일 상품 상세 페이지
 *
 * 구조:
 * - 이미지 갤러리 (썸네일 포함)
 * - 상품 정보 레이아웃
 * - 탭 UI (설명/리뷰/배송)
 * - 관련 상품
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createPublicSupabaseClient } from "@/lib/supabase/server-public";
import type { Product } from "@/types/product";
import { getCategoryName } from "@/types/category";
import ProductSlider from "@/components/product-slider";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Truck, RotateCcw, Shield } from "lucide-react";
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
      className: "text-destructive font-semibold",
      disabled: true,
    };
  }
  if (stockQuantity < 10) {
    return {
      text: `재고 ${stockQuantity}개`,
      className: "text-orange-500",
      disabled: false,
    };
  }
  return {
    text: "재고 있음",
    className: "text-colo-green",
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
    relatedProductsQuery = relatedProductsQuery.eq(
      "category",
      typedProduct.category
    );
  }

  const { data: relatedProducts } = await relatedProductsQuery
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <>
      {/* 브레드크럼 */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary trans-300">
            홈
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary trans-300">
            상품
          </Link>
          {typedProduct.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${typedProduct.category}`}
                className="hover:text-primary trans-300"
              >
                {getCategoryName(typedProduct.category)}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{typedProduct.name}</span>
        </div>
      </nav>

      {/* 상품 상세 정보 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* 상품 이미지 */}
          <div className="space-y-4">
            {/* 메인 이미지 */}
            <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
              {typedProduct.image_url ? (
                <Image
                  src={typedProduct.image_url}
                  alt={typedProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
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
              )}

              {/* 배지 */}
              {typedProduct.stock_quantity < 10 &&
                typedProduct.stock_quantity > 0 && (
                  <span className="product-badge product-badge-sale">한정</span>
                )}
            </div>

            {/* 썸네일 갤러리 - 이미지가 있으면 표시 */}
            {typedProduct.image_url && (
              <div className="flex gap-2">
                <div className="relative w-20 h-20 bg-muted rounded cursor-pointer border-2 border-primary overflow-hidden">
                  <Image
                    src={typedProduct.image_url}
                    alt={typedProduct.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            {/* 카테고리 */}
            {typedProduct.category && (
              <Link
                href={`/products?category=${typedProduct.category}`}
                className="text-sm text-muted-foreground uppercase tracking-wide hover:text-primary trans-300"
              >
                {getCategoryName(typedProduct.category)}
              </Link>
            )}

            {/* 상품명 */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {typedProduct.name}
            </h1>

            {/* 가격 */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                {formatPrice(typedProduct.price)}
              </span>
            </div>

            {/* 재고 상태 */}
            <div className="flex items-center gap-4">
              <span className={`text-sm ${stockStatus.className}`}>
                {stockStatus.text}
              </span>
              {!stockStatus.disabled && (
                <span className="text-sm text-colo-green">✓ 당일 출고 가능</span>
              )}
            </div>

            {/* 구분선 */}
            <div className="border-t border-border" />

            {/* 짧은 설명 */}
            {typedProduct.description && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {typedProduct.description}
              </p>
            )}

            {/* 수량 선택 및 장바구니 추가 */}
            <div className="space-y-4">
              <AddToCartButton
                product={typedProduct}
                disabled={stockStatus.disabled}
              />

              {/* 찜하기 & 공유 버튼 */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border rounded text-sm font-medium hover:bg-muted trans-300">
                  <Heart className="w-4 h-4" />
                  찜하기
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border rounded text-sm font-medium hover:bg-muted trans-300">
                  <Share2 className="w-4 h-4" />
                  공유하기
                </button>
              </div>
            </div>

            {/* 혜택 정보 */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-primary" />
                <span>5만원 이상 무료 배송</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-primary" />
                <span>30일 이내 무료 반품</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span>정품 보증</span>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 UI - 상품 설명/리뷰/배송 */}
        <div className="border-t border-border">
          {/* 탭 헤더 */}
          <div className="flex border-b border-border">
            <button className="px-6 py-4 text-sm font-medium border-b-2 border-primary text-primary">
              상품 설명
            </button>
            <button className="px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground trans-300">
              리뷰 (0)
            </button>
            <button className="px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground trans-300">
              배송/반품
            </button>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="py-8">
            {typedProduct.description ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{typedProduct.description}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                상품 설명이 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 관련 상품 */}
      {relatedProducts && relatedProducts.length > 0 && (
        <ProductSlider
          title="관련 상품"
          products={relatedProducts as Product[]}
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="w-full aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          <div className="h-10 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-8 bg-muted rounded w-1/2 animate-pulse" />
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
          <div className="border-t border-border pt-6">
            <div className="h-4 bg-muted rounded w-full animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          </div>
          <div className="h-12 bg-muted rounded w-full animate-pulse" />
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-muted rounded animate-pulse" />
            <div className="flex-1 h-12 bg-muted rounded animate-pulse" />
          </div>
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
    <div className="min-h-screen mt-[130px]">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail productId={id} />
      </Suspense>
    </div>
  );
}
