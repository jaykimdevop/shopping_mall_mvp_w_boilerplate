/**
 * @file components/related-products.tsx
 * @description 관련 상품 섹션 컴포넌트
 *
 * 상품 상세 페이지에서 같은 카테고리의 다른 상품을 표시합니다.
 */

import type { Product } from "@/types/product";
import ProductCard from "./product-card";

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
}

/**
 * 관련 상품 섹션 컴포넌트
 */
export default function RelatedProducts({
  products,
  currentProductId,
}: RelatedProductsProps) {
  // 현재 상품 제외
  const relatedProducts = products.filter(
    (product) => product.id !== currentProductId
  );

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">관련 상품</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          비슷한 상품을 더 둘러보세요
        </p>
      </div>

      {/* 가로 스크롤 가능한 상품 목록 */}
      <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 sm:gap-6 min-w-max">
          {relatedProducts.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

