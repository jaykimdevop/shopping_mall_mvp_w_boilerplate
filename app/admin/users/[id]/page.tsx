"use client";

/**
 * @file app/admin/users/[id]/page.tsx
 * @description 관리자 회원 상세 페이지
 *
 * 회원 기본 정보, 역할/등급 관리, 주문 내역, 통계를 표시합니다.
 */

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  Loader2,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { UserRoleBadge } from "@/components/admin/user-role-badge";
import { UserTierBadge } from "@/components/admin/user-tier-badge";
import OrderStatusBadge from "@/components/admin/order-status-badge";
import { getUserDetail, updateUserRole, updateUserTier } from "@/actions/admin/user";
import type { AdminUserDetail, UserRole, UserTier } from "@/types/user";
import type { OrderStatus } from "@/types/order";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminUserDetailPage({ params }: PageProps) {
  const { id: clerkId } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 데이터 로드
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const data = await getUserDetail(clerkId);
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
        toast.error("회원 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [clerkId]);

  // 역할 변경 핸들러
  const handleRoleChange = async (newRole: UserRole) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateUserRole(clerkId, newRole);
      setUser((prev) => (prev ? { ...prev, role: newRole } : null));
      toast.success("역할이 변경되었습니다.");
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("역할 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 등급 변경 핸들러
  const handleTierChange = async (newTier: UserTier) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateUserTier(clerkId, newTier);
      setUser((prev) => (prev ? { ...prev, tier: newTier } : null));
      toast.success("등급이 변경되었습니다.");
    } catch (error) {
      console.error("Failed to update tier:", error);
      toast.error("등급 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 날짜 포맷
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <Users className="h-12 w-12 mb-4" />
        <p>회원을 찾을 수 없습니다.</p>
        <Link href="/admin/users" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            회원 상세
          </h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 왼쪽: 프로필 및 기본 정보 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 프로필 카드 */}
          <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center text-center">
              {/* 프로필 이미지 */}
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <Users className="h-12 w-12" />
                  </div>
                )}
              </div>

              {/* 이름 */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h3>

              {/* 이메일 */}
              {user.email && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              )}

              {/* 배지 */}
              <div className="flex items-center gap-2 mt-4">
                <UserRoleBadge role={user.role} />
                <UserTierBadge tier={user.tier} />
              </div>
            </div>

            {/* 가입 정보 */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  가입일
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  마지막 로그인
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDateTime(user.lastSignInAt)}
                </span>
              </div>
            </div>
          </div>

          {/* 역할/등급 관리 */}
          <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              역할 및 등급 관리
            </h4>
            <div className="space-y-4">
              {/* 역할 변경 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  역할
                </label>
                <Select
                  value={user.role}
                  onValueChange={(v) => handleRoleChange(v as UserRole)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="user">일반 회원</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 등급 변경 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  등급
                </label>
                <Select
                  value={user.tier}
                  onValueChange={(v) => handleTierChange(v as UserTier)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="normal">일반</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 통계 및 주문 내역 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 통계 카드 */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* 총 주문 횟수 */}
            <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                  <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">총 주문</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {user.orderCount}건
                  </p>
                </div>
              </div>
            </div>

            {/* 총 구매 금액 */}
            <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">총 구매액</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(user.totalSpent)}
                  </p>
                </div>
              </div>
            </div>

            {/* 평균 주문 금액 */}
            <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">평균 주문액</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(user.averageOrderValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 주문 내역 */}
          <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                최근 주문 내역
              </h4>
              {user.orderCount > 0 && (
                <Link
                  href={`/admin/orders?search=${user.email || user.name}`}
                  className="text-sm text-[#00A2FF] hover:underline flex items-center gap-1"
                >
                  전체 보기
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>

            {user.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <Package className="h-10 w-10 mb-3" />
                <p>주문 내역이 없습니다.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>주문번호</TableHead>
                    <TableHead className="text-center">상품 수</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                    <TableHead className="text-center">상태</TableHead>
                    <TableHead>주문일</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.itemCount}개
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <OrderStatusBadge status={order.status as OrderStatus} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

