/**
 * @file components/promotion-section.tsx
 * @description 프로모션 섹션 컴포넌트 (신상품)
 *
 * 신상품을 가로 스크롤 형태로 표시하는 섹션입니다.
 */

import type { Product } from "@/types/product";
import ProductCard from "./product-card";

interface PromotionSectionProps {
  products: Product[];
  title?: string;
}

/**
 * 프로모션 섹션 컴포넌트 (신상품)
 */
export default function PromotionSection({
  products,
  title = "신상품",
}: PromotionSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      {/* 섹션 제목 */}
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          최근에 등록된 상품을 만나보세요
        </p>
      </div>

      {/* 가로 스크롤 가능한 상품 목록 */}
      <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 sm:gap-6 min-w-max">
          {products.map((product) => (
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

