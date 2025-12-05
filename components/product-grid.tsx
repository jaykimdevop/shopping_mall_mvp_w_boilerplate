/**
 * @file components/product-grid.tsx
 * @description Coloshop 스타일 상품 Grid 레이아웃 컴포넌트
 *
 * 반응형 Grid 레이아웃으로 상품 목록을 표시합니다.
 * - 모바일: 1열
 * - 태블릿: 2열
 * - 데스크톱: 4-5열
 */

import type { Product } from "@/types/product";
import ProductCard from "./product-card";
import { PackageX } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  title?: string;
  showTitle?: boolean;
}

export default function ProductGrid({
  products,
  title = "신상품",
  showTitle = true,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <PackageX className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">표시할 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* 섹션 타이틀 */}
        {showTitle && (
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-block relative">
              <h2 className="text-3xl sm:text-4xl font-bold">{title}</h2>
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-16 h-1 bg-primary" />
            </div>
          </div>
        )}

        {/* 상품 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
