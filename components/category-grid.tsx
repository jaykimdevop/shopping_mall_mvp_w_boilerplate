/**
 * @file components/category-grid.tsx
 * @description 카테고리 Grid 레이아웃 컴포넌트
 *
 * 반응형 Grid 레이아웃으로 카테고리 목록을 표시합니다.
 * - 모바일: 2열
 * - 태블릿: 3열
 * - 데스크톱: 4-5열
 */

import type { Category } from "@/types/category";
import CategoryCard from "./category-card";

interface CategoryGridProps {
  categories: Category[];
}

/**
 * 카테고리 Grid 레이아웃 컴포넌트
 */
export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          표시할 카테고리가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
      {categories.map((category) => (
        <CategoryCard key={category.code} category={category} />
      ))}
    </div>
  );
}

