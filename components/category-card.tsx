/**
 * @file components/category-card.tsx
 * @description 카테고리 카드 컴포넌트
 *
 * 카테고리별 진입점을 제공하는 카드 컴포넌트입니다.
 */

import Link from "next/link";
import type { Category } from "@/types/category";
import { getCategoryName } from "@/types/category";

interface CategoryCardProps {
  category: Category;
}

/**
 * 카테고리 카드 컴포넌트
 */
export default function CategoryCard({ category }: CategoryCardProps) {
  const categoryName = getCategoryName(category.code);

  return (
    <Link
      href={`/products?category=${category.code}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-primary/50 p-3 sm:p-4"
    >
      <div className="flex flex-col items-center text-center space-y-2">
        {/* 카테고리 아이콘 영역 */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>

        {/* 카테고리 이름 */}
        <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
          {categoryName}
        </h3>

        {/* 상품 개수 */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {category.count}개
        </p>
      </div>
    </Link>
  );
}

