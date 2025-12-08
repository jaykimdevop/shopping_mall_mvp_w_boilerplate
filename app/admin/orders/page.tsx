"use client";

/**
 * @file app/admin/orders/page.tsx
 * @description 관리자 주문 목록 페이지
 *
 * 주문 목록 조회, 검색, 필터링, 상태 변경 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Loader2,
  Calendar,
  X,
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
import OrderStatusBadge from "@/components/admin/order-status-badge";
import {
  getAdminOrders,
  getOrderStatusCounts,
  updateOrderStatus,
} from "@/actions/admin/order";
import type {
  OrderStatus,
  AdminOrderQueryOptions,
  OrderWithCustomer,
} from "@/types/order";
import { ORDER_STATUS_LABELS, ORDER_STATUS_LIST } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 상태 관리
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus | "all", number>>({
    all: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 필터 상태 (URL 파라미터에서 초기화)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<OrderStatus | "all">(
    (searchParams.get("status") as OrderStatus | "all") || "all"
  );
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [sortBy, setSortBy] = useState<"created_at" | "total_amount">(
    (searchParams.get("sortBy") as "created_at" | "total_amount") || "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // 데이터 로드
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const options: AdminOrderQueryOptions = {
        search: search || undefined,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      };

      const result = await getAdminOrders(options);
      setOrders(result.orders);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("주문 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [search, status, startDate, endDate, sortBy, sortOrder, page]);

  // 상태별 개수 로드
  const loadStatusCounts = useCallback(async () => {
    try {
      const counts = await getOrderStatusCounts();
      setStatusCounts(counts);
    } catch (error) {
      console.error("Failed to load status counts:", error);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadStatusCounts();
  }, [loadStatusCounts]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // URL 파라미터 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (sortBy !== "created_at") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (page > 1) params.set("page", String(page));

    const newUrl = params.toString()
      ? `/admin/orders?${params.toString()}`
      : "/admin/orders";
    router.replace(newUrl, { scroll: false });
  }, [search, status, startDate, endDate, sortBy, sortOrder, page, router]);

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  };

  // 상태 변경 핸들러
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success("주문 상태가 변경되었습니다.");
      await loadOrders();
      await loadStatusCounts();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // 주문번호 포맷 (앞 8자리만 표시)
  const formatOrderId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          주문 관리
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          총 {total}개의 주문이 있습니다.
        </p>
      </div>

      {/* 상태별 탭 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={status === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setStatus("all");
            setPage(1);
          }}
          className={status === "all" ? "bg-[#00A2FF]" : ""}
        >
          전체 ({statusCounts.all})
        </Button>
        {ORDER_STATUS_LIST.map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={status === s ? "bg-[#00A2FF]" : ""}
          >
            {ORDER_STATUS_LABELS[s]} ({statusCounts[s]})
          </Button>
        ))}
      </div>

      {/* 필터 및 검색 */}
      <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* 검색 */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="주문번호 또는 고객명 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              검색
            </Button>
          </form>

          {/* 필터 */}
          <div className="flex flex-wrap items-end gap-2">
            {/* 날짜 범위 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-40 pl-9"
                />
              </div>
              <span className="text-gray-500">~</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              />
            </div>

            {/* 정렬 */}
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(v) => {
                const [by, order] = v.split("-") as [
                  "created_at" | "total_amount",
                  "asc" | "desc"
                ];
                setSortBy(by);
                setSortOrder(order);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">최신순</SelectItem>
                <SelectItem value="created_at-asc">오래된순</SelectItem>
                <SelectItem value="total_amount-desc">금액 높은순</SelectItem>
                <SelectItem value="total_amount-asc">금액 낮은순</SelectItem>
              </SelectContent>
            </Select>

            {/* 필터 초기화 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-gray-500"
            >
              <X className="mr-1 h-4 w-4" />
              초기화
            </Button>
          </div>
        </div>
      </div>

      {/* 주문 테이블 */}
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <ShoppingCart className="h-12 w-12 mb-4" />
            <p>주문이 없습니다.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">주문번호</TableHead>
                <TableHead>고객정보</TableHead>
                <TableHead className="w-32 text-right">주문금액</TableHead>
                <TableHead className="w-24 text-center">상태</TableHead>
                <TableHead className="w-40">주문일시</TableHead>
                <TableHead className="w-40 text-center">상태 변경</TableHead>
                <TableHead className="w-20 text-center">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {formatOrderId(order.id)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.customer_name || "비회원"}
                      </p>
                      {order.customer_email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.customer_email}
                        </p>
                      )}
                      {!order.clerk_id && (
                        <span className="text-xs text-orange-500">비회원 주문</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) =>
                        handleStatusChange(order.id, v as OrderStatus)
                      }
                      disabled={order.status === "cancelled"}
                    >
                      <SelectTrigger className="h-8 text-xs">
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
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} / {total}개
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={page === pageNum ? "bg-[#00A2FF]" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


