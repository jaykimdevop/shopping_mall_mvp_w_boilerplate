/**
 * @file app/checkout/page.tsx
 * @description 체크아웃 페이지
 *
 * 장바구니에서 주문으로 넘어가는 페이지입니다.
 * 배송지 입력과 주문 요약을 표시합니다.
 * 회원/비회원 모두 접근 가능합니다.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CheckoutContent from "@/components/checkout-content";

export const metadata = {
  title: "주문/결제 | 모두쇼핑",
  description: "배송지를 입력하고 주문을 완료하세요.",
};

/**
 * 체크아웃 페이지
 * 회원/비회원 모두 접근 가능
 */
export default async function CheckoutPage() {
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

        {/* 메인 콘텐츠 (회원/비회원 분기) */}
        <CheckoutContent />
      </div>
    </div>
  );
}

