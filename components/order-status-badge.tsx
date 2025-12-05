/**
 * @file components/order-status-badge.tsx
 * @description 주문 상태 배지 컴포넌트
 *
 * 주문 상태에 따라 색상이 다른 배지를 표시합니다.
 * Phase 4(결제 통합) 후 상태 변경에 대응할 수 있도록 설계되었습니다.
 */

import type { OrderStatus } from "@/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

/**
 * 주문 상태별 설정
 */
const statusConfig: Record<
  OrderStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  pending: {
    label: "결제 대기",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-200",
  },
  confirmed: {
    label: "주문 확정",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-200",
  },
  shipped: {
    label: "배송 중",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-800 dark:text-purple-200",
  },
  delivered: {
    label: "배송 완료",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-200",
  },
  cancelled: {
    label: "주문 취소",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-200",
  },
};

/**
 * 사이즈별 클래스
 */
const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

/**
 * 주문 상태 배지 컴포넌트
 */
export default function OrderStatusBadge({
  status,
  size = "md",
}: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${config.bgColor}
        ${config.textColor}
        ${sizeClasses[size]}
      `}
    >
      {config.label}
    </span>
  );
}

/**
 * 주문 상태 한글 레이블 가져오기 (외부에서 사용)
 */
export function getStatusLabel(status: OrderStatus): string {
  return statusConfig[status]?.label || status;
}

