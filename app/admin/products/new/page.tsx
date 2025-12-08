/**
 * @file app/admin/products/new/page.tsx
 * @description 관리자 상품 등록 페이지
 */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/components/admin/product-form";
import { getCategories } from "@/actions/admin/product";

export const metadata = {
  title: "상품 등록",
};

export default async function NewProductPage() {
  const categories = await getCategories();

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
            상품 등록
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            새로운 상품을 등록합니다.
          </p>
        </div>
      </div>

      {/* 상품 폼 */}
      <ProductForm categories={categories} />
    </div>
  );
}


