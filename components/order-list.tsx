/**
 * @file components/order-list.tsx
 * @description 주문 목록 컴포넌트
 *
 * 마이페이지에서 주문 내역을 카드 형태로 표시합니다.
 */

import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import OrderStatusBadge from "@/components/order-status-badge";
import type { Order } from "@/types/order";

interface OrderListProps {
  orders: Order[];
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
 * 날짜 포맷팅
 */
function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

/**
 * 주문 카드 컴포넌트
 */
function OrderCard({ order }: { order: Order }) {
  // 주문 상품 요약 텍스트 생성
  const itemCount = order.order_items?.length || 0;
  const firstItemName = order.order_items?.[0]?.product_name || "상품";
  const itemSummary =
    itemCount > 1
      ? `${firstItemName} 외 ${itemCount - 1}건`
      : firstItemName;

  return (
    <Link
      href={`/mypage/orders/${order.id}`}
      className="block p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 왼쪽: 주문 정보 */}
        <div className="flex-1 min-w-0">
          {/* 날짜 및 상태 */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(order.created_at)}
            </span>
            <OrderStatusBadge status={order.status} size="sm" />
          </div>

          {/* 상품 요약 */}
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium truncate">{itemSummary}</span>
          </div>

          {/* 주문번호 */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            주문번호: {order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* 오른쪽: 금액 및 화살표 */}
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-primary">
            {formatPrice(order.total_amount)}
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

/**
 * 주문 목록 컴포넌트
 */
export default function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
          주문 내역이 없습니다
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
          첫 주문을 해보세요!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

