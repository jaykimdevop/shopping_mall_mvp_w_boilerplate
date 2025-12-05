/**
 * @file app/orders/guest/page.tsx
 * @description 비회원 주문 조회 페이지
 *
 * 비회원이 주문 번호와 이메일/전화번호로 주문을 조회할 수 있는 페이지입니다.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GuestOrderLookup from "@/components/guest-order-lookup";

export const metadata = {
  title: "비회원 주문 조회 | 모두쇼핑",
  description: "비회원 주문 조회 페이지입니다. 주문 번호와 연락처 정보로 주문을 조회하세요.",
};

export default function GuestOrderLookupPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-3xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>홈으로</span>
        </Link>

        {/* 비회원 주문 조회 폼 */}
        <GuestOrderLookup />
      </div>
    </div>
  );
}

