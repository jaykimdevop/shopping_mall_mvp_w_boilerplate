/**
 * @file components/admin/order-status-badge.tsx
 * @description 주문 상태 배지 컴포넌트
 *
 * 주문 상태에 따라 색상이 다른 배지를 표시합니다.
 */

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";
import { ORDER_STATUS_LABELS } from "@/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

/**
 * 상태별 배지 스타일
 */
const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-100",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100",
};

export default function OrderStatusBadge({
  status,
  className = "",
}: OrderStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`${statusStyles[status]} ${className}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}


