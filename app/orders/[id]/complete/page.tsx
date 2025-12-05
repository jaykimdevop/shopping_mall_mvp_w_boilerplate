/**
 * @file app/orders/[id]/complete/page.tsx
 * @description 주문 완료 페이지
 *
 * 주문이 성공적으로 완료된 후 보여지는 페이지입니다.
 * 주문 정보와 배송지 정보를 표시합니다.
 */

import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { CheckCircle, Package, Truck, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/actions/order";
import type { ShippingAddress, OrderStatus } from "@/types/order";

interface OrderCompletePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "주문 완료 - 쇼핑몰",
  description: "주문이 성공적으로 완료되었습니다.",
};

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
 * 날짜 포맷팅
 */
function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

/**
 * 주문 상태 한글 변환
 */
function getStatusText(status: OrderStatus): string {
  const statusMap: Record<OrderStatus, string> = {
    pending: "결제 대기",
    confirmed: "주문 확정",
    shipped: "배송 중",
    delivered: "배송 완료",
    cancelled: "주문 취소",
  };
  return statusMap[status] || status;
}

/**
 * 주문 완료 페이지
 */
export default async function OrderCompletePage({ params }: OrderCompletePageProps) {
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

  const order = result.order;
  const shippingAddress = order.shipping_address as ShippingAddress | null;

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-3xl mx-auto">
        {/* 성공 메시지 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            주문이 완료되었습니다!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            주문번호: <span className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {/* 주문 정보 카드 */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
          {/* 주문 상태 */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-semibold">주문 상태</span>
              </div>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm rounded-full">
                {getStatusText(order.status)}
              </span>
            </div>
          </div>

          {/* 주문 상품 */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              주문 상품
            </h3>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      × {item.quantity}개
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold">총 결제 금액</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* 배송지 정보 */}
          {shippingAddress && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                배송지 정보
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500 dark:text-gray-400 w-20 inline-block">수령인</span>
                  <span className="font-medium">{shippingAddress.name}</span>
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400 w-20 inline-block">연락처</span>
                  <span>{shippingAddress.phone}</span>
                </p>
                <p>
                  <span className="text-gray-500 dark:text-gray-400 w-20 inline-block">주소</span>
                  <span>
                    ({shippingAddress.zipCode}) {shippingAddress.address}
                    {shippingAddress.detailAddress && `, ${shippingAddress.detailAddress}`}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* 배송 메모 */}
          {order.order_note && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">배송 메모</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.order_note}
              </p>
            </div>
          )}

          {/* 주문 일시 */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              주문 일시: {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>안내:</strong> 이 쇼핑몰은 테스트 모드로 운영되며, 실제 결제 및 배송은 이루어지지 않습니다.
          </p>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              쇼핑 계속하기
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              홈으로 가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

