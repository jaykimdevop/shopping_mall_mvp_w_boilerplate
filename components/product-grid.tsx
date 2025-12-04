/**
 * @file components/product-grid.tsx
 * @description 상품 Grid 레이아웃 컴포넌트
 *
 * 반응형 Grid 레이아웃으로 상품 목록을 표시합니다.
 * - 모바일: 1열
 * - 태블릿: 2열
 * - 데스크톱: 3-4열
 */

import type { Product } from "@/types/product";
import ProductCard from "./product-card";

interface ProductGridProps {
  products: Product[];
}

/**
 * 상품 Grid 레이아웃 컴포넌트
 */
export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          표시할 상품이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

