/**
 * @file app/checkout/page.tsx
 * @description 체크아웃 페이지
 *
 * 장바구니에서 주문으로 넘어가는 페이지입니다.
 * 배송지 입력과 주문 요약을 표시합니다.
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import CheckoutForm from "@/components/checkout-form";
import OrderSummary, { calculateTotal } from "@/components/order-summary";
import { getCartItemsForCheckout } from "@/actions/order";

export const metadata = {
  title: "주문/결제 - 쇼핑몰",
  description: "배송지를 입력하고 주문을 완료하세요.",
};

/**
 * 체크아웃 페이지
 */
export default async function CheckoutPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // 장바구니 아이템 조회
  const cartItems = await getCartItemsForCheckout();

  // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  // 총액 계산
  const totalAmount = calculateTotal(cartItems);

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-6xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>장바구니로 돌아가기</span>
        </Link>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">주문/결제</h1>
          <p className="text-gray-600 dark:text-gray-400">
            배송 정보를 입력하고 주문을 완료하세요
          </p>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 배송지 입력 폼 */}
          <div>
            <CheckoutForm totalAmount={totalAmount} />
          </div>

          {/* 오른쪽: 주문 요약 */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OrderSummary cartItems={cartItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

