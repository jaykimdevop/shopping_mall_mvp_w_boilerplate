/**
 * @file components/product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * Grid 레이아웃에서 사용할 상품 카드 컴포넌트입니다.
 * 상품 이미지, 이름, 가격, 카테고리, 재고 상태, 설명을 표시합니다.
 */

import Link from "next/link";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
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
} {
  if (stockQuantity === 0) {
    return { text: "품절", className: "text-red-600 font-semibold" };
  }
  if (stockQuantity < 10) {
    return { text: `재고 ${stockQuantity}개`, className: "text-orange-600" };
  }
  return { text: "재고 있음", className: "text-green-600" };
}

/**
 * 상품 카드 컴포넌트
 */
export default function ProductCard({ product }: ProductCardProps) {
  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
    >
      {/* 상품 이미지 */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {/* TODO: 실제 이미지 URL이 추가되면 Image 컴포넌트 사용 */}
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
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
      </div>

      {/* 상품 정보 */}
      <div className="p-4 space-y-2">
        {/* 카테고리 */}
        {product.category && (
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {product.category}
          </div>
        )}

        {/* 상품명 */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* 설명 */}
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* 가격 및 재고 */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className={`text-xs ${stockStatus.className}`}>
              {stockStatus.text}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

