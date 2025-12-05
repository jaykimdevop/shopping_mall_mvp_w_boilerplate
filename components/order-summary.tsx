/**
 * @file components/order-summary.tsx
 * @description 체크아웃용 주문 요약 컴포넌트
 *
 * 주문 전 확인을 위한 상품 목록과 합계를 표시합니다.
 * 회원/비회원 장바구니 모두 지원합니다.
 */

import Image from "next/image";
import { Package } from "lucide-react";
import type { CartItem, GuestCartItem } from "@/types/cart";

interface OrderSummaryProps {
  cartItems: CartItem[];
  guestItems?: GuestCartItem[];
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
 * 체크아웃용 주문 요약 컴포넌트
 * 회원/비회원 장바구니 모두 지원
 */
export default function OrderSummary({
  cartItems,
  guestItems = [],
  isGuest = false,
}: OrderSummaryProps) {
  // 회원 장바구니 계산
  const memberTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const memberSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 비회원 장바구니 계산
  const guestTotalItems = guestItems.reduce((sum, item) => sum + item.quantity, 0);
  const guestSubtotal = guestItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // 통합 계산
  const totalItems = isGuest ? guestTotalItems : memberTotalItems;
  const subtotal = isGuest ? guestSubtotal : memberSubtotal;
  const shippingFee = 0; // 무료 배송
  const totalPrice = subtotal + shippingFee;

  // 표시할 아이템 목록
  const displayItems = isGuest ? guestItems : cartItems;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold">주문 상품 ({totalItems}개)</h3>
      </div>

      {/* 상품 목록 */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {isGuest
          ? guestItems.map((item) => (
              <div key={item.product_id} className="p-4 flex gap-4">
                {/* 상품 이미지 플레이스홀더 */}
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {item.product?.name || "상품명 로딩 중..."}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.product
                      ? `${formatPrice(item.product.price)} × ${item.quantity}개`
                      : `${item.quantity}개`}
                  </p>
                </div>

                {/* 소계 */}
                <div className="text-right flex-shrink-0">
                  <span className="font-semibold text-sm">
                    {item.product
                      ? formatPrice(item.product.price * item.quantity)
                      : "-"}
                  </span>
                </div>
              </div>
            ))
          : cartItems.map((item) => (
              <div key={item.id} className="p-4 flex gap-4">
                {/* 상품 이미지 플레이스홀더 */}
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product.description?.includes("http") ? (
                    <Image
                      src={
                        item.product.description
                          .split(" ")
                          .find((w) => w.startsWith("http")) || ""
                      }
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatPrice(item.product.price)} × {item.quantity}개
                  </p>
                </div>

                {/* 소계 */}
                <div className="text-right flex-shrink-0">
                  <span className="font-semibold text-sm">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
      </div>

      {/* 합계 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">상품 금액</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">배송비</span>
          <span>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">총 결제 금액</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 총액 계산 헬퍼 함수 (외부에서 사용)
 */
export function calculateTotal(cartItems: CartItem[]): number {
  return cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
}

