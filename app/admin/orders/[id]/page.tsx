"use client";

/**
 * @file app/admin/orders/[id]/page.tsx
 * @description 관리자 주문 상세 페이지
 *
 * 주문 정보, 배송지, 주문 아이템, 상태 변경, 메모 관리 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Loader2,
  User,
  MapPin,
  Package,
  CreditCard,
  Calendar,
  FileText,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OrderStatusBadge from "@/components/admin/order-status-badge";
import {
  getOrderById,
  updateOrderStatus,
  updateOrderNote,
} from "@/actions/admin/order";
import type { OrderStatus, OrderWithCustomer, ShippingAddress } from "@/types/order";
import { ORDER_STATUS_LABELS, ORDER_STATUS_LIST } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderWithCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // 주문 데이터 로드
  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getOrderById(orderId);
      if (!data) {
        toast.error("주문을 찾을 수 없습니다.");
        router.push("/admin/orders");
        return;
      }
      setOrder(data);
      setNote(data.order_note || "");
    } catch (error) {
      console.error("Failed to load order:", error);
      toast.error("주문 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // 상태 변경 핸들러
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;

    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success("주문 상태가 변경되었습니다.");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("상태 변경에 실패했습니다.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 메모 저장 핸들러
  const handleSaveNote = async () => {
    if (!order) return;

    setIsSavingNote(true);
    try {
      await updateOrderNote(order.id, note);
      toast.success("메모가 저장되었습니다.");
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("메모 저장에 실패했습니다.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // 주문번호 포맷
  const formatOrderId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const shippingAddress = order.shipping_address as ShippingAddress | null;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-1 h-4 w-4" />
            목록으로
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              주문 #{formatOrderId(order.id)}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 왼쪽: 주문 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 주문 아이템 */}
          <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                주문 상품
              </h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품명</TableHead>
                  <TableHead className="w-24 text-center">수량</TableHead>
                  <TableHead className="w-28 text-right">단가</TableHead>
                  <TableHead className="w-28 text-right">소계</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product_name}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end border-t pt-4 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">총 주문금액</p>
                <p className="text-2xl font-bold text-[#00A2FF]">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </div>

          {/* 배송지 정보 */}
          <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                배송지 정보
              </h3>
            </div>

            {shippingAddress ? (
              <div className="space-y-3">
                <div className="flex gap-4">
                  <span className="w-20 text-sm text-gray-500 dark:text-gray-400">
                    수령인
                  </span>
                  <span className="font-medium">{shippingAddress.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-20 text-sm text-gray-500 dark:text-gray-400">
                    연락처
                  </span>
                  <span>{shippingAddress.phone}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-20 text-sm text-gray-500 dark:text-gray-400">
                    주소
                  </span>
                  <span>
                    ({shippingAddress.zipCode}) {shippingAddress.address}{" "}
                    {shippingAddress.detailAddress}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                배송지 정보가 없습니다.
              </p>
            )}
          </div>

          {/* 주문 메모 */}
          <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                주문 메모
              </h3>
            </div>

            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="관리자 메모를 입력하세요..."
              className="min-h-24 resize-y"
            />

            <div className="mt-3 flex justify-end">
              <Button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="bg-[#00A2FF] hover:bg-[#0090e0]"
              >
                {isSavingNote ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    메모 저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 오른쪽: 고객 정보 및 상태 변경 */}
        <div className="space-y-6">
          {/* 고객 정보 */}
          <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                고객 정보
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">고객명</p>
                <p className="font-medium">{order.customer_name || "비회원"}</p>
              </div>
              {order.customer_email && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">이메일</p>
                  <p>{order.customer_email}</p>
                </div>
              )}
              {order.guest_phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">연락처</p>
                  <p>{order.guest_phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">회원 유형</p>
                <p>
                  {order.clerk_id ? (
                    <span className="text-green-600">회원</span>
                  ) : (
                    <span className="text-orange-500">비회원</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 주문 상태 변경 */}
          <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                주문 상태
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  현재 상태
                </p>
                <OrderStatusBadge status={order.status} className="text-base" />
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  상태 변경
                </p>
                <Select
                  value={order.status}
                  onValueChange={(v) => handleStatusChange(v as OrderStatus)}
                  disabled={isUpdatingStatus || order.status === "cancelled"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_LIST.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {order.status === "cancelled" && (
                  <p className="mt-2 text-xs text-red-500">
                    취소된 주문은 상태를 변경할 수 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 주문 일시 */}
          <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                주문 일시
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">주문일</p>
                <p>{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  최종 수정일
                </p>
                <p>{formatDate(order.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


