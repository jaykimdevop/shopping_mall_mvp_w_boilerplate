/**
 * @file app/admin/banners/[id]/edit/page.tsx
 * @description 배너 수정 페이지
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BannerForm from "@/components/admin/banner-form";
import { getBannerById } from "@/actions/admin/banner";

export const metadata = {
  title: "배너 수정 | 관리자",
  description: "배너 정보를 수정합니다.",
};

interface EditBannerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  const { id } = await params;
  const banner = await getBannerById(id);

  if (!banner) {
    notFound();
  }

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
            배너 수정
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {banner.title}
          </p>
        </div>
      </div>

      {/* 폼 */}
      <BannerForm banner={banner} />
    </div>
  );
}

