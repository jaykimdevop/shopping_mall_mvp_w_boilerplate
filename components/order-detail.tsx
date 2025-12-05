/**
 * @file components/order-detail.tsx
 * @description 주문 상세 정보 컴포넌트
 *
 * 주문 상세 페이지에서 주문 정보, 상품 목록, 배송지 정보를 표시합니다.
 * Phase 4(결제 통합) 후 결제 정보 섹션이 추가될 수 있도록 설계되었습니다.
 */

import { Package, Truck, CreditCard, FileText } from "lucide-react";
import OrderStatusBadge from "@/components/order-status-badge";
import type { Order, ShippingAddress } from "@/types/order";

interface OrderDetailProps {
  order: Order;
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
 * 날짜 포맷팅 (시간 포함)
 */
function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

/**
 * 섹션 헤더 컴포넌트
 */
function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-primary" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}

/**
 * 주문 상세 정보 컴포넌트
 */
export default function OrderDetail({ order }: OrderDetailProps) {
  const shippingAddress = order.shipping_address as ShippingAddress | null;

  return (
    <div className="space-y-6">
      {/* 주문 기본 정보 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              주문번호
            </p>
            <p className="font-mono font-semibold text-lg">
              {order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <OrderStatusBadge status={order.status} size="lg" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          주문일시: {formatDateTime(order.created_at)}
        </p>
      </div>

      {/* 주문 상품 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <SectionHeader icon={Package} title="주문 상품" />
        <div className="space-y-4">
          {order.order_items?.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              {/* 상품 아이콘 */}
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📦</span>
              </div>

              {/* 상품 정보 */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium mb-1">{item.product_name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatPrice(item.price)} × {item.quantity}개
                </p>
              </div>

              {/* 소계 */}
              <div className="text-right">
                <span className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 합계 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-semibold">총 주문금액</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* 배송지 정보 */}
      {shippingAddress && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <SectionHeader icon={Truck} title="배송지 정보" />
          <div className="space-y-2 text-sm">
            <div className="flex gap-4">
              <span className="text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                수령인
              </span>
              <span className="font-medium">{shippingAddress.name}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                연락처
              </span>
              <span>{shippingAddress.phone}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">
                주소
              </span>
              <span>
                ({shippingAddress.zipCode}) {shippingAddress.address}
                {shippingAddress.detailAddress &&
                  `, ${shippingAddress.detailAddress}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 배송 메모 */}
      {order.order_note && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <SectionHeader icon={FileText} title="배송 메모" />
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {order.order_note}
          </p>
        </div>
      )}

      {/* 결제 정보 (Phase 4에서 확장 예정) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <SectionHeader icon={CreditCard} title="결제 정보" />
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">상품 금액</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">배송비</span>
            <span className="text-green-600 dark:text-green-400">무료</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">총 결제금액</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
          {/* Phase 4 결제 통합 후 추가될 영역 */}
          {order.status === "pending" && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * 결제 대기 중인 주문입니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

