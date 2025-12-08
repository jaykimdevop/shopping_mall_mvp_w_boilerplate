"use client";

/**
 * @file app/admin/products/page.tsx
 * @description 관리자 상품 목록 페이지
 *
 * 상품 목록 조회, 검색, 필터링, 정렬, 일괄 삭제 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAdminProducts,
  getCategories,
  deleteProduct,
  deleteProducts,
  toggleProductStatus,
} from "@/actions/admin/product";
import type { Product, AdminProductQueryOptions } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 상태 관리
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 필터 상태 (URL 파라미터에서 초기화)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<"all" | "active" | "inactive">(
    (searchParams.get("status") as "all" | "active" | "inactive") || "all"
  );
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState<
    "created_at" | "price" | "name" | "stock_quantity"
  >(
    (searchParams.get("sortBy") as
      | "created_at"
      | "price"
      | "name"
      | "stock_quantity") || "created_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // 데이터 로드
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const options: AdminProductQueryOptions = {
        search: search || undefined,
        status,
        category: category || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      };

      const result = await getAdminProducts(options);
      setProducts(result.products);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("상품 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [search, status, category, sortBy, sortOrder, page]);

  // 카테고리 목록 로드
  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // URL 파라미터 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (category) params.set("category", category);
    if (sortBy !== "created_at") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (page > 1) params.set("page", String(page));

    const newUrl = params.toString()
      ? `/admin/products?${params.toString()}`
      : "/admin/products";
    router.replace(newUrl, { scroll: false });
  }, [search, status, category, sortBy, sortOrder, page, router]);

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // 전체 선택
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 개별 선택
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // 상태 토글
  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleProductStatus(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: result.is_active } : p))
      );
      toast.success(
        result.is_active ? "상품이 활성화되었습니다." : "상품이 비활성화되었습니다."
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  // 단일 삭제
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  // 일괄 삭제
  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      toast.error("삭제할 상품을 선택해주세요.");
      return;
    }
    setDeleteTargetId(null);
    setDeleteDialogOpen(true);
  };

  // 삭제 확인
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (deleteTargetId) {
        // 단일 삭제
        await deleteProduct(deleteTargetId);
        toast.success("상품이 삭제되었습니다.");
      } else {
        // 일괄 삭제
        const result = await deleteProducts(selectedIds);
        toast.success(`${result.count}개의 상품이 삭제되었습니다.`);
        setSelectedIds([]);
      }
      await loadProducts();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            상품 관리
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            총 {total}개의 상품이 있습니다.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#00A2FF] hover:bg-[#0090e0]">
            <Plus className="mr-2 h-4 w-4" />
            상품 등록
          </Button>
        </Link>
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
                placeholder="상품명 또는 카테고리 검색..."
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
            {/* 상태 필터 */}
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as "all" | "active" | "inactive");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>

            {/* 카테고리 필터 */}
            <Select
              value={category || "all"}
              onValueChange={(v) => {
                setCategory(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 정렬 */}
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(v) => {
                const [by, order] = v.split("-") as [
                  "created_at" | "price" | "name" | "stock_quantity",
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
                <SelectItem value="name-asc">이름순</SelectItem>
                <SelectItem value="price-desc">가격 높은순</SelectItem>
                <SelectItem value="price-asc">가격 낮은순</SelectItem>
                <SelectItem value="stock_quantity-asc">재고 적은순</SelectItem>
                <SelectItem value="stock_quantity-desc">재고 많은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 선택된 항목 액션 */}
        {selectedIds.length > 0 && (
          <div className="mt-4 flex items-center gap-2 border-t pt-4 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedIds.length}개 선택됨
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteClick}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              선택 삭제
            </Button>
          </div>
        )}
      </div>

      {/* 상품 테이블 */}
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <Package className="h-12 w-12 mb-4" />
            <p>등록된 상품이 없습니다.</p>
            <Link href="/admin/products/new" className="mt-4">
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                첫 상품 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.length === products.length &&
                      products.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-20">이미지</TableHead>
                <TableHead>상품명</TableHead>
                <TableHead className="w-24">카테고리</TableHead>
                <TableHead className="w-28 text-right">가격</TableHead>
                <TableHead className="w-20 text-center">재고</TableHead>
                <TableHead className="w-20 text-center">상태</TableHead>
                <TableHead className="w-32 text-center">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(product.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-medium text-gray-900 hover:text-[#00A2FF] dark:text-white"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="secondary">{product.category}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        product.stock_quantity === 0
                          ? "text-red-500 font-medium"
                          : product.stock_quantity < 10
                            ? "text-orange-500 font-medium"
                            : ""
                      }
                    >
                      {product.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => handleToggleStatus(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              {deleteTargetId
                ? "이 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                : `선택한 ${selectedIds.length}개의 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


