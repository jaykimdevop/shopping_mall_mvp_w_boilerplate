/**
 * @file components/category-banner.tsx
 * @description Coloshop 스타일 카테고리 배너 (3컬럼)
 *
 * 주요 기능:
 * - 3컬럼 이미지 배너
 * - 호버 시 오버레이 효과
 * - 카테고리 링크
 * - 다크모드 지원
 */

import Link from "next/link";

interface CategoryBannerItem {
  id: number;
  title: string;
  href: string;
  bgColor: string;
  icon: string;
}

const categories: CategoryBannerItem[] = [
  {
    id: 1,
    title: "전자기기",
    href: "/products?category=전자기기",
    bgColor: "from-blue-600 to-blue-800",
    icon: "📱",
  },
  {
    id: 2,
    title: "패션",
    href: "/products?category=패션",
    bgColor: "from-pink-500 to-rose-600",
    icon: "👕",
  },
  {
    id: 3,
    title: "가전",
    href: "/products?category=가전",
    bgColor: "from-emerald-500 to-teal-600",
    icon: "🏠",
  },
];

export default function CategoryBanner() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative h-[200px] sm:h-[265px] rounded-lg overflow-hidden"
            >
              {/* 배경 그라디언트 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.bgColor} trans-500`}
              />

              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 trans-300" />

              {/* 아이콘 배경 */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 trans-300">
                <span className="text-[120px] sm:text-[180px]">{category.icon}</span>
              </div>

              {/* 카테고리 라벨 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded shadow-lg group-hover:scale-105 trans-300">
                  <span className="text-lg sm:text-xl font-semibold uppercase text-foreground">
                    {category.title}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

