/**
 * @file components/product-card.tsx
 * @description Coloshop 스타일 상품 카드 컴포넌트
 *
 * 주요 기능:
 * - 호버 시 장바구니 버튼 표시
 * - 찜하기 아이콘
 * - 할인/신상품 배지
 * - 호버 시 그림자 + 테두리 효과
 * - 다크모드 지원
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Product } from "@/types/product";
import AddToCartButton from "@/components/add-to-cart-button";

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

function getStockStatus(stockQuantity: number): {
  text: string;
  className: string;
} {
  if (stockQuantity === 0) {
    return { text: "품절", className: "text-destructive font-semibold" };
  }
  if (stockQuantity < 10) {
    return { text: `재고 ${stockQuantity}개`, className: "text-orange-500" };
  }
  return { text: "재고 있음", className: "text-colo-green" };
}

export default function ProductCard({ product }: ProductCardProps) {
  const stockStatus = getStockStatus(product.stock_quantity);
  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10;

  return (
    <div className="group relative bg-background border border-border rounded-lg overflow-hidden product-card-hover">
      {/* 상품 이미지 링크 */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full aspect-square bg-muted overflow-hidden">
          {/* 상품 이미지 또는 플레이스홀더 */}
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 trans-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:scale-105 trans-500">
              <svg
                className="w-16 h-16"
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
          {isLowStock && (
            <span className="product-badge product-badge-sale">한정</span>
          )}
          {!isLowStock && !isOutOfStock && product.stock_quantity >= 50 && (
            <span className="product-badge product-badge-new">NEW</span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">품절</span>
            </div>
          )}
        </div>
      </Link>

      {/* 찜하기 버튼 */}
      <button
        className="absolute top-3 right-3 w-8 h-8 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 trans-300 hover:bg-primary hover:text-white z-10"
        onClick={(e) => {
          e.preventDefault();
          // 찜하기 기능 추가 예정
        }}
        aria-label="찜하기"
      >
        <Heart className="w-4 h-4" />
      </button>

      {/* 상품 정보 */}
      <div className="p-4">
        {/* 카테고리 */}
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.category}
          </p>
        )}

        {/* 상품명 */}
        <Link href={`/products/${product.id}`}>
          <h6 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-colo-purple trans-300 min-h-[40px]">
            {product.name}
          </h6>
        </Link>

        {/* 가격 및 재고 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-primary font-semibold text-lg">
            {formatPrice(product.price)}
          </span>
          <span className={`text-xs ${stockStatus.className}`}>
            {stockStatus.text}
          </span>
        </div>

        {/* 장바구니 버튼 - 호버 시 표시 */}
        <div className="opacity-0 group-hover:opacity-100 trans-300 -translate-y-2 group-hover:translate-y-0">
          <AddToCartButton product={product} disabled={isOutOfStock} />
        </div>
      </div>
    </div>
  );
}
