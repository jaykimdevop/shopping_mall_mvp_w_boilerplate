/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 사용자의 장바구니 아이템을 조회하고 관리하는 페이지입니다.
 * 수량 변경, 삭제, 총액 표시 기능을 제공합니다.
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CartItemsList from "@/components/cart-items-list";

/**
 * 장바구니 페이지
 */
export default async function CartPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>상품 목록으로</span>
        </Link>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">장바구니</h1>
          <p className="text-gray-600 dark:text-gray-400">
            장바구니에 담긴 상품을 확인하고 주문하세요
          </p>
        </div>

        {/* 장바구니 내용 */}
        <CartItemsList />
      </div>
    </div>
  );
}

