/**
 * @file app/admin/banners/new/page.tsx
 * @description 새 배너 등록 페이지
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BannerForm from "@/components/admin/banner-form";

export const metadata = {
  title: "새 배너 등록 | 관리자",
  description: "새로운 배너를 등록합니다.",
};

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/banners">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            새 배너 등록
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            홈페이지 슬라이더에 표시될 새 배너를 등록합니다.
          </p>
        </div>
      </div>

      {/* 폼 */}
      <BannerForm />
    </div>
  );
}

