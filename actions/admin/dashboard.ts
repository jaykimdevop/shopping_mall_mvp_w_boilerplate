"use server";

/**
 * @file actions/admin/dashboard.ts
 * @description 관리자 대시보드 통계 데이터 Server Actions
 *
 * 대시보드에 표시할 통계 데이터를 Supabase에서 조회합니다.
 * - 총 주문수, 매출, 상품수, 회원수
 * - 최근 주문 목록
 * - 재고 부족 상품 목록
 *
 * @dependencies
 * - @/lib/supabase/service-role: RLS 우회를 위한 서비스 역할 클라이언트
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
}

export interface RecentOrder {
  id: string;
  clerk_id: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string | null;
}

export interface LowStockProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category: string | null;
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * 대시보드 통계 데이터 조회
 *
 * @returns 총 주문수, 매출, 상품수, 회원수
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getServiceRoleClient();

  // 병렬로 모든 통계 조회
  const [ordersResult, revenueResult, productsResult, usersResult] =
    await Promise.all([
      // 총 주문수
      supabase.from("orders").select("id", { count: "exact", head: true }),

      // 총 매출 (취소된 주문 제외)
      supabase
        .from("orders")
        .select("total_amount")
        .neq("status", "cancelled"),

      // 총 상품수 (활성 상품만)
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),

      // 총 회원수
      supabase.from("users").select("id", { count: "exact", head: true }),
    ]);

  // 매출 합계 계산
  const totalRevenue =
    revenueResult.data?.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    ) || 0;

  return {
    totalOrders: ordersResult.count || 0,
    totalRevenue,
    totalProducts: productsResult.count || 0,
    totalUsers: usersResult.count || 0,
  };
}

/**
 * 최근 주문 목록 조회
 *
 * @param limit 조회할 주문 수 (기본값: 5)
 * @returns 최근 주문 목록 (고객명 포함)
 */
export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const supabase = getServiceRoleClient();

  // 주문 목록 조회
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      clerk_id,
      total_amount,
      status,
      created_at
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch recent orders:", error);
    return [];
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // clerk_id로 사용자 이름 조회
  const clerkIds = orders
    .map((order) => order.clerk_id)
    .filter((id): id is string => id !== null);

  let userMap: Record<string, string> = {};

  if (clerkIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("clerk_id, name")
      .in("clerk_id", clerkIds);

    if (users) {
      userMap = users.reduce(
        (acc, user) => {
          acc[user.clerk_id] = user.name || "Unknown";
          return acc;
        },
        {} as Record<string, string>
      );
    }
  }

  // 주문에 고객명 추가
  return orders.map((order) => ({
    id: order.id,
    clerk_id: order.clerk_id,
    total_amount: Number(order.total_amount),
    status: order.status,
    created_at: order.created_at,
    customer_name: order.clerk_id ? userMap[order.clerk_id] || "비회원" : "비회원",
  }));
}

/**
 * 재고 부족 상품 목록 조회
 *
 * @param threshold 재고 부족 기준 (기본값: 10)
 * @returns 재고 부족 상품 목록
 */
export async function getLowStockProducts(
  threshold = 10
): Promise<LowStockProduct[]> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, category")
    .eq("is_active", true)
    .lte("stock_quantity", threshold)
    .order("stock_quantity", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Failed to fetch low stock products:", error);
    return [];
  }

  return (data || []).map((product) => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    stock_quantity: product.stock_quantity || 0,
    category: product.category,
  }));
}

