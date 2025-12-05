/**
 * @file app/mypage/orders/[id]/page.tsx
 * @description 주문 상세 페이지
 *
 * 특정 주문의 상세 정보를 표시합니다.
 */

import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import OrderDetail from "@/components/order-detail";
import { getOrder } from "@/actions/order";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "주문 상세 - 쇼핑몰",
  description: "주문 상세 정보를 확인하세요.",
};

/**
 * 주문 상세 페이지
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id: orderId } = await params;

  // 주문 조회
  const result = await getOrder(orderId);

  if (!result.success || !result.order) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-3xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/mypage"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>주문 내역으로</span>
        </Link>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">주문 상세</h1>
          <p className="text-gray-600 dark:text-gray-400">
            주문 정보와 배송 상태를 확인하세요
          </p>
        </div>

        {/* 주문 상세 정보 */}
        <OrderDetail order={result.order} />
      </div>
    </div>
  );
}

