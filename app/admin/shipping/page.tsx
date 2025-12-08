"use client";

/**
 * @file app/admin/shipping/page.tsx
 * @description 관리자 배송 관리 페이지
 *
 * 배송 목록 조회, 운송장 번호 입력, 배송 상태 변경 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Truck,
  Loader2,
  Calendar,
  X,
  Package,
  CheckCircle,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  getShippingList,
  getShippingStatusCounts,
  updateTrackingNumber,
  markAsDelivered,
  removeTrackingNumber,
} from "@/actions/admin/shipping";
import type {
  ShippingCarrier,
  ShippingStatus,
  AdminShippingQueryOptions,
  ShippingOrder,
  ShippingStatusCounts,
} from "@/types/order";
import {
  SHIPPING_CARRIER_LABELS,
  SHIPPING_CARRIERS,
  SHIPPING_STATUS_LABELS,
  SHIPPING_STATUS_LIST,
  SHIPPING_TRACKING_URLS,
} from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import BulkTrackingModal from "@/components/admin/bulk-tracking-modal";

export default function AdminShippingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 상태 관리
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusCounts, setStatusCounts] = useState<ShippingStatusCounts>({
    all: 0,
    pending_shipment: 0,
    shipped: 0,
    delivered: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // 필터 상태 (URL 파라미터에서 초기화)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus | "all">(
    (searchParams.get("status") as ShippingStatus | "all") || "all"
  );
  const [carrier, setCarrier] = useState<ShippingCarrier | "all">(
    (searchParams.get("carrier") as ShippingCarrier | "all") || "all"
  );
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // 인라인 운송장 입력 상태
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingTrackingNumber, setEditingTrackingNumber] = useState("");
  const [editingCarrier, setEditingCarrier] = useState<ShippingCarrier>("cj");
  const [isSaving, setIsSaving] = useState(false);

  // 데이터 로드
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const options: AdminShippingQueryOptions = {
        search: search || undefined,
        shippingStatus: shippingStatus,
        carrier: carrier,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 10,
      };

      const [listResult, counts] = await Promise.all([
        getShippingList(options),
        getShippingStatusCounts(),
      ]);

      setOrders(listResult.orders);
      setTotal(listResult.total);
      setTotalPages(listResult.totalPages);
      setStatusCounts(counts);
    } catch (error) {
      console.error("Failed to load shipping data:", error);
      toast.error("배송 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [search, shippingStatus, carrier, startDate, endDate, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // URL 파라미터 업데이트
  const updateUrl = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const newParams = new URLSearchParams();

      if (params.search) newParams.set("search", String(params.search));
      if (params.status && params.status !== "all")
        newParams.set("status", String(params.status));
      if (params.carrier && params.carrier !== "all")
        newParams.set("carrier", String(params.carrier));
      if (params.startDate) newParams.set("startDate", String(params.startDate));
      if (params.endDate) newParams.set("endDate", String(params.endDate));
      if (params.page && params.page > 1)
        newParams.set("page", String(params.page));

      const queryString = newParams.toString();
      router.push(`/admin/shipping${queryString ? `?${queryString}` : ""}`);
    },
    [router]
  );

  // 검색 핸들러
  const handleSearch = () => {
    setPage(1);
    updateUrl({
      search,
      status: shippingStatus,
      carrier,
      startDate,
      endDate,
      page: 1,
    });
  };

  // 필터 변경 핸들러
  const handleStatusChange = (value: ShippingStatus | "all") => {
    setShippingStatus(value);
    setPage(1);
    updateUrl({
      search,
      status: value,
      carrier,
      startDate,
      endDate,
      page: 1,
    });
  };

  const handleCarrierChange = (value: ShippingCarrier | "all") => {
    setCarrier(value);
    setPage(1);
    updateUrl({
      search,
      status: shippingStatus,
      carrier: value,
      startDate,
      endDate,
      page: 1,
    });
  };

  // 필터 초기화
  const handleClearFilters = () => {
    setSearch("");
    setShippingStatus("all");
    setCarrier("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
    router.push("/admin/shipping");
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({
      search,
      status: shippingStatus,
      carrier,
      startDate,
      endDate,
      page: newPage,
    });
  };

  // 주문번호 포맷
  const formatOrderId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // 날짜 포맷
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 인라인 운송장 입력 시작
  const startEditing = (order: ShippingOrder) => {
    setEditingOrderId(order.id);
    setEditingTrackingNumber(order.tracking_number || "");
    setEditingCarrier((order.shipping_carrier as ShippingCarrier) || "cj");
  };

  // 인라인 운송장 입력 취소
  const cancelEditing = () => {
    setEditingOrderId(null);
    setEditingTrackingNumber("");
    setEditingCarrier("cj");
  };

  // 운송장 번호 저장
  const saveTracking = async () => {
    if (!editingOrderId || !editingTrackingNumber.trim()) {
      toast.error("운송장 번호를 입력해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateTrackingNumber(
        editingOrderId,
        editingTrackingNumber.trim(),
        editingCarrier
      );

      if (result.success) {
        toast.success("운송장 번호가 입력되었습니다.");
        cancelEditing();
        loadData();
      } else {
        toast.error(result.message || "운송장 번호 입력에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to save tracking:", error);
      toast.error("운송장 번호 입력에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 배송 완료 처리
  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      const result = await markAsDelivered(orderId);

      if (result.success) {
        toast.success("배송 완료 처리되었습니다.");
        loadData();
      } else {
        toast.error(result.message || "배송 완료 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to mark as delivered:", error);
      toast.error("배송 완료 처리에 실패했습니다.");
    }
  };

  // 운송장 삭제
  const handleRemoveTracking = async (orderId: string) => {
    if (!confirm("운송장 번호를 삭제하시겠습니까? 배송 상태가 '주문 확정'으로 변경됩니다.")) {
      return;
    }

    try {
      const result = await removeTrackingNumber(orderId);

      if (result.success) {
        toast.success("운송장 번호가 삭제되었습니다.");
        loadData();
      } else {
        toast.error(result.message || "운송장 번호 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to remove tracking:", error);
      toast.error("운송장 번호 삭제에 실패했습니다.");
    }
  };

  // 배송 조회 URL 생성
  const getTrackingUrl = (carrier: ShippingCarrier, trackingNumber: string) => {
    const urlTemplate = SHIPPING_TRACKING_URLS[carrier];
    if (!urlTemplate) return null;
    return urlTemplate.replace("{trackingNumber}", trackingNumber);
  };

  // 배송 상태에 따른 배지 스타일
  const getStatusBadge = (order: ShippingOrder) => {
    if (order.status === "delivered") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-3 w-3" />
          배송 완료
        </span>
      );
    }
    if (order.status === "shipped") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          <Truck className="h-3 w-3" />
          배송 중
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Package className="h-3 w-3" />
        배송 대기
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            배송 관리
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            주문 배송 상태 관리 및 운송장 번호 입력
          </p>
        </div>
        <Button
          onClick={() => setIsBulkModalOpen(true)}
          className="bg-[#00A2FF] hover:bg-[#0090e0]"
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          운송장 일괄 입력
        </Button>
      </div>

      {/* 상태별 탭 */}
      <div className="flex gap-2 border-b dark:border-gray-700">
        <button
          onClick={() => handleStatusChange("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            shippingStatus === "all"
              ? "border-[#00A2FF] text-[#00A2FF]"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          전체 ({statusCounts.all})
        </button>
        <button
          onClick={() => handleStatusChange("pending_shipment")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            shippingStatus === "pending_shipment"
              ? "border-[#00A2FF] text-[#00A2FF]"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          배송 대기 ({statusCounts.pending_shipment})
        </button>
        <button
          onClick={() => handleStatusChange("shipped")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            shippingStatus === "shipped"
              ? "border-[#00A2FF] text-[#00A2FF]"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          배송 중 ({statusCounts.shipped})
        </button>
        <button
          onClick={() => handleStatusChange("delivered")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            shippingStatus === "delivered"
              ? "border-[#00A2FF] text-[#00A2FF]"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          배송 완료 ({statusCounts.delivered})
        </button>
      </div>

      {/* 필터 영역 */}
      <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid gap-4 md:grid-cols-5">
          {/* 검색 */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="주문번호, 수령인명, 운송장 번호 검색..."
                className="pl-10"
              />
            </div>
          </div>

          {/* 배송 업체 필터 */}
          <Select value={carrier} onValueChange={handleCarrierChange}>
            <SelectTrigger>
              <SelectValue placeholder="배송 업체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 업체</SelectItem>
              {SHIPPING_CARRIERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {SHIPPING_CARRIER_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 날짜 필터 */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">~</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* 필터 액션 */}
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <X className="mr-2 h-4 w-4" />
            필터 초기화
          </Button>
          <Button size="sm" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            검색
          </Button>
        </div>
      </div>

      {/* 배송 목록 테이블 */}
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Truck className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              배송 내역이 없습니다.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">주문번호</TableHead>
                  <TableHead className="w-24">주문일</TableHead>
                  <TableHead>수령인</TableHead>
                  <TableHead className="w-32">연락처</TableHead>
                  <TableHead>배송지</TableHead>
                  <TableHead className="w-28">배송업체</TableHead>
                  <TableHead className="w-36">운송장번호</TableHead>
                  <TableHead className="w-24">상태</TableHead>
                  <TableHead className="w-32 text-center">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-sm text-[#00A2FF] hover:underline"
                      >
                        #{formatOrderId(order.id)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.recipient_name || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {order.recipient_phone || "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-gray-500">
                      {order.recipient_address || "-"}
                    </TableCell>
                    <TableCell>
                      {editingOrderId === order.id ? (
                        <Select
                          value={editingCarrier}
                          onValueChange={(v) =>
                            setEditingCarrier(v as ShippingCarrier)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIPPING_CARRIERS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {SHIPPING_CARRIER_LABELS[c]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : order.shipping_carrier ? (
                        <span className="text-sm">
                          {SHIPPING_CARRIER_LABELS[order.shipping_carrier as ShippingCarrier]}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingOrderId === order.id ? (
                        <Input
                          value={editingTrackingNumber}
                          onChange={(e) =>
                            setEditingTrackingNumber(e.target.value)
                          }
                          placeholder="운송장 번호"
                          className="h-8 text-xs"
                        />
                      ) : order.tracking_number ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm">
                            {order.tracking_number}
                          </span>
                          {order.shipping_carrier && (
                            <a
                              href={
                                getTrackingUrl(
                                  order.shipping_carrier as ShippingCarrier,
                                  order.tracking_number
                                ) || "#"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-[#00A2FF]"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(order)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {editingOrderId === order.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                              disabled={isSaving}
                            >
                              취소
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveTracking}
                              disabled={isSaving}
                              className="bg-[#00A2FF] hover:bg-[#0090e0]"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "저장"
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* 배송 대기 상태: 운송장 입력 버튼 */}
                            {order.status === "confirmed" && !order.tracking_number && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(order)}
                              >
                                운송장 입력
                              </Button>
                            )}
                            {/* 배송 중 상태: 배송 완료 버튼 */}
                            {order.status === "shipped" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveTracking(order.id)}
                                >
                                  운송장 삭제
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkAsDelivered(order.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  배송 완료
                                </Button>
                              </>
                            )}
                            {/* 배송 완료 상태: 상세 보기 */}
                            {order.status === "delivered" && (
                              <Link href={`/admin/orders/${order.id}`}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  총 {total}건 중 {(page - 1) * 10 + 1}-
                  {Math.min(page * 10, total)}건
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 운송장 일괄 입력 모달 */}
      <BulkTrackingModal
        open={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          setIsBulkModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}

