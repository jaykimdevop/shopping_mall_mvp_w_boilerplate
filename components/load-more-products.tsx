/**
 * @file components/load-more-products.tsx
 * @description 더보기 버튼 컴포넌트
 *
 * 상품 목록 페이지에서 추가 상품을 로드하는 버튼입니다.
 */

"use client";

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/types/product";
import ProductCard from "./product-card";

interface LoadMoreProductsProps {
  category?: string;
  sort?: string;
  initialCount: number;
}

/**
 * 더보기 버튼 컴포넌트
 */
export default function LoadMoreProducts({
  category,
  sort = "newest",
  initialCount,
}: LoadMoreProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadMore = async () => {
    startTransition(async () => {
      const offset = initialCount + page * 20;

      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .range(offset, offset + 19);

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

      const { data, error } = await query;

      if (error) {
        console.error("Error loading more products:", error);
        return;
      }

      if (data && data.length > 0) {
        setProducts((prev) => [...prev, ...(data as Product[])]);
        setPage((prev) => prev + 1);
        if (data.length < 20) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    });
  };

  if (!hasMore && products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* 추가 로드된 상품들 */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 더보기 버튼 */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={isPending}
            size="lg"
            variant="outline"
          >
            {isPending ? "로딩 중..." : "더보기"}
          </Button>
        </div>
      )}
    </div>
  );
}

