/**
 * @file app/admin/banners/page.tsx
 * @description 배너 관리 목록 페이지
 *
 * 주요 기능:
 * - 배너 목록 조회
 * - 배너 활성화/비활성화 토글
 * - 배너 삭제
 * - 배너 순서 변경 (드래그 앤 드롭)
 */

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBanners } from "@/actions/admin/banner";
import BannerListClient from "./banner-list-client";

export const metadata = {
  title: "배너 관리 | 관리자",
  description: "홈페이지 배너를 관리합니다.",
};

async function BannerList() {
  const banners = await getBanners();

  return <BannerListClient initialBanners={banners} />;
}

function BannerListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border animate-pulse"
        >
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function BannersPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            배너 관리
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            홈페이지 히어로 슬라이더에 표시되는 배너를 관리합니다.
          </p>
        </div>
        <Link href="/admin/banners/new">
          <Button className="gap-2 bg-[#00A2FF] hover:bg-[#0090e0]">
            <Plus className="w-4 h-4" />
            새 배너
          </Button>
        </Link>
      </div>

      {/* 배너 목록 */}
      <Suspense fallback={<BannerListSkeleton />}>
        <BannerList />
      </Suspense>
    </div>
  );
}

