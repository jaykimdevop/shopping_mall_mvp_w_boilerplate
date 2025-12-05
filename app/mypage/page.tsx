/**
 * @file app/mypage/page.tsx
 * @description 마이페이지 메인 페이지
 *
 * 사용자의 주문 내역 목록을 표시합니다.
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { User, ShoppingBag, ArrowLeft } from "lucide-react";
import OrderList from "@/components/order-list";
import { getOrders } from "@/actions/order";

export const metadata = {
  title: "마이페이지 - 쇼핑몰",
  description: "주문 내역을 확인하세요.",
};

/**
 * 마이페이지 메인 페이지
 */
export default async function MyPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 주문 목록 조회
  const result = await getOrders();
  const orders = result.success ? result.orders || [] : [];

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로</span>
        </Link>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">마이페이지</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            주문 내역과 계정 정보를 관리하세요
          </p>
        </div>

        {/* 주문 내역 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">주문 내역</h2>
            {orders.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                {orders.length}건
              </span>
            )}
          </div>

          <OrderList orders={orders} />
        </section>
      </div>
    </div>
  );
}

