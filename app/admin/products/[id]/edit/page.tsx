/**
 * @file app/admin/products/[id]/edit/page.tsx
 * @description 관리자 상품 수정 페이지
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/admin/product-form";
import { getProductById, getCategories } from "@/actions/admin/product";

export const metadata = {
  title: "상품 수정",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  // 상품 정보와 카테고리 목록을 병렬로 로드
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            상품 수정
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {product.name}
          </p>
        </div>
      </div>

      {/* 상품 폼 */}
      <ProductForm product={product} categories={categories} />
    </div>
  );
}


