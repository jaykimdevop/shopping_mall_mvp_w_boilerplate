"use client";

/**
 * @file app/admin/users/page.tsx
 * @description 관리자 회원 목록 페이지
 *
 * 회원 목록 조회, 검색, 필터링, 정렬, 역할/등급 변경 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  Eye,
  Mail,
  Calendar,
  ShoppingBag,
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
import { UserRoleBadge } from "@/components/admin/user-role-badge";
import { UserTierBadge } from "@/components/admin/user-tier-badge";
import { getAllUsers, updateUserRole, updateUserTier } from "@/actions/admin/user";
import type { AdminUser, AdminUserQueryOptions, UserRole, UserTier } from "@/types/user";
import { USER_ROLES, USER_TIERS } from "@/types/user";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 상태 관리
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 필터 상태 (URL 파라미터에서 초기화)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState<UserRole | "all">(
    (searchParams.get("role") as UserRole | "all") || "all"
  );
  const [tier, setTier] = useState<UserTier | "all">(
    (searchParams.get("tier") as UserTier | "all") || "all"
  );
  const [sortBy, setSortBy] = useState<
    "created_at" | "name" | "order_count" | "total_spent"
  >(
    (searchParams.get("sortBy") as
      | "created_at"
      | "name"
      | "order_count"
      | "total_spent") || "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // 데이터 로드
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const options: AdminUserQueryOptions = {
        search: search || undefined,
        role,
        tier,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      };

      const result = await getAllUsers(options);
      setUsers(result.users);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("회원 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [search, role, tier, sortBy, sortOrder, page]);

  // 초기 로드
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // URL 파라미터 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role !== "all") params.set("role", role);
    if (tier !== "all") params.set("tier", tier);
    if (sortBy !== "created_at") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (page > 1) params.set("page", String(page));

    const newUrl = params.toString()
      ? `/admin/users?${params.toString()}`
      : "/admin/users";
    router.replace(newUrl, { scroll: false });
  }, [search, role, tier, sortBy, sortOrder, page, router]);

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // 역할 변경 핸들러
  const handleRoleChange = async (clerkId: string, newRole: UserRole) => {
    try {
      await updateUserRole(clerkId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.clerkId === clerkId ? { ...u, role: newRole } : u))
      );
      toast.success("역할이 변경되었습니다.");
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("역할 변경에 실패했습니다.");
    }
  };

  // 등급 변경 핸들러
  const handleTierChange = async (clerkId: string, newTier: UserTier) => {
    try {
      await updateUserTier(clerkId, newTier);
      setUsers((prev) =>
        prev.map((u) => (u.clerkId === clerkId ? { ...u, tier: newTier } : u))
      );
      toast.success("등급이 변경되었습니다.");
    } catch (error) {
      console.error("Failed to update tier:", error);
      toast.error("등급 변경에 실패했습니다.");
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // 날짜 포맷
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            회원 관리
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            총 {total}명의 회원이 있습니다.
          </p>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* 검색 */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="이름 또는 이메일 검색..."
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
          <div className="flex flex-wrap gap-2">
            {/* 역할 필터 */}
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v as UserRole | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="역할" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 역할</SelectItem>
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="user">일반 회원</SelectItem>
              </SelectContent>
            </Select>

            {/* 등급 필터 */}
            <Select
              value={tier}
              onValueChange={(v) => {
                setTier(v as UserTier | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="등급" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 등급</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="normal">일반</SelectItem>
              </SelectContent>
            </Select>

            {/* 정렬 */}
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(v) => {
                const [by, order] = v.split("-") as [
                  "created_at" | "name" | "order_count" | "total_spent",
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
                <SelectItem value="created_at-desc">최근 가입순</SelectItem>
                <SelectItem value="created_at-asc">오래된 가입순</SelectItem>
                <SelectItem value="name-asc">이름순</SelectItem>
                <SelectItem value="order_count-desc">주문 많은순</SelectItem>
                <SelectItem value="total_spent-desc">구매액 높은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 회원 테이블 */}
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <Users className="h-12 w-12 mb-4" />
            <p>등록된 회원이 없습니다.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">프로필</TableHead>
                <TableHead>회원 정보</TableHead>
                <TableHead className="w-28">역할</TableHead>
                <TableHead className="w-28">등급</TableHead>
                <TableHead className="w-24 text-center">주문</TableHead>
                <TableHead className="w-28 text-right">총 구매액</TableHead>
                <TableHead className="w-28">가입일</TableHead>
                <TableHead className="w-20 text-center">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  {/* 프로필 이미지 */}
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      {user.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={user.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <Users className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* 회원 정보 */}
                  <TableCell>
                    <div>
                      <Link
                        href={`/admin/users/${user.clerkId}`}
                        className="font-medium text-gray-900 hover:text-[#00A2FF] dark:text-white"
                      >
                        {user.name}
                      </Link>
                      {user.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* 역할 */}
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.clerkId, v as UserRole)}
                    >
                      <SelectTrigger className="h-8 w-24 border-0 bg-transparent p-0">
                        <UserRoleBadge role={user.role} size="sm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">관리자</SelectItem>
                        <SelectItem value="user">일반 회원</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* 등급 */}
                  <TableCell>
                    <Select
                      value={user.tier}
                      onValueChange={(v) => handleTierChange(user.clerkId, v as UserTier)}
                    >
                      <SelectTrigger className="h-8 w-24 border-0 bg-transparent p-0">
                        <UserTierBadge tier={user.tier} size="sm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="normal">일반</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* 주문 횟수 */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ShoppingBag className="h-4 w-4 text-gray-400" />
                      <span>{user.orderCount}건</span>
                    </div>
                  </TableCell>

                  {/* 총 구매액 */}
                  <TableCell className="text-right font-medium">
                    {formatCurrency(user.totalSpent)}
                  </TableCell>

                  {/* 가입일 */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>

                  {/* 액션 */}
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Link href={`/admin/users/${user.clerkId}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
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
              {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} / {total}명
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

