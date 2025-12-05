/**
 * @file components/cart-summary.tsx
 * @description 장바구니 요약 컴포넌트
 *
 * 장바구니 페이지에서 총액 및 요약 정보를 표시하는 컴포넌트입니다.
 * 체크아웃 버튼을 포함합니다.
 * 회원/비회원 장바구니 모두 지원합니다.
 */

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem, GuestCartItem } from "@/types/cart";

interface CartSummaryProps {
  cartItems: CartItem[];
  guestItems?: GuestCartItem[];
  totalPrice?: number;
  isGuest?: boolean;
}

/**
 * 가격을 천 단위 콤마로 포맷팅
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

/**
 * 장바구니 요약 컴포넌트
 * 회원/비회원 장바구니 모두 지원
 */
export default function CartSummary({
  cartItems,
  guestItems = [],
  totalPrice: propTotalPrice,
  isGuest = false,
}: CartSummaryProps) {
  // 회원 장바구니 계산
  const memberTotalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const memberTotalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const memberItemCount = cartItems.length;

  // 비회원 장바구니 계산
  const guestTotalItems = guestItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const guestItemCount = guestItems.length;

  // 통합 계산
  const totalItems = isGuest ? guestTotalItems : memberTotalItems;
  const totalPrice = propTotalPrice ?? memberTotalPrice;
  const itemCount = isGuest ? guestItemCount : memberItemCount;
  const isCartEmpty = itemCount === 0;

  return (
    <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 space-y-4 sticky top-8">
      <h2 className="text-xl font-semibold mb-4">주문 요약</h2>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>상품 개수</span>
          <span>{itemCount}개</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>총 수량</span>
          <span>{totalItems}개</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>배송비</span>
          <span className="text-green-600 dark:text-green-400">무료</span>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">총 주문금액</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(totalPrice)}
          </span>
        </div>

        {/* 체크아웃 버튼 */}
        <Button
          asChild
          size="lg"
          className="w-full"
          disabled={isCartEmpty}
        >
          <Link href="/checkout" className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            주문하기
          </Link>
        </Button>

        {isGuest && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-3">
            비회원 주문 시 이메일/전화번호로 주문 조회 가능
          </p>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          배송비 무료 · 안전한 결제
        </p>
      </div>
    </div>
  );
}

