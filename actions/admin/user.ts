"use server";

/**
 * @file actions/admin/user.ts
 * @description 관리자 회원 관리 Server Actions
 *
 * 회원 목록 조회, 상세 조회, 역할/등급 변경 기능을 제공합니다.
 * Clerk Backend API와 Supabase를 연동하여 통합 회원 정보를 관리합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk Backend API
 * - @/lib/supabase/service-role: RLS 우회를 위한 서비스 역할 클라이언트
 * - @/types/user: 회원 관련 타입
 */

import { clerkClient } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserQueryOptions,
  PaginatedUsersResponse,
  UserRole,
  UserTier,
  UserOrderStats,
  UserOrderSummary,
  SupabaseUser,
} from "@/types/user";

// ============================================================================
// 회원 목록 조회
// ============================================================================

/**
 * 관리자용 회원 목록 조회
 * Clerk API + Supabase users 테이블 데이터를 통합하여 반환
 *
 * @param options 검색, 필터, 정렬, 페이지네이션 옵션
 * @returns 페이지네이션된 회원 목록
 */
export async function getAllUsers(
  options: AdminUserQueryOptions = {}
): Promise<PaginatedUsersResponse> {
  const supabase = getServiceRoleClient();
  const clerk = await clerkClient();

  const {
    search = "",
    role = "all",
    tier = "all",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = options;

  console.group("[getAllUsers] 회원 목록 조회");
  console.log("Options:", { search, role, tier, sortBy, sortOrder, page, limit });

  try {
    // 1. Supabase에서 users 목록 조회
    let query = supabase.from("users").select("*", { count: "exact" });

    // 등급 필터
    if (tier !== "all") {
      query = query.eq("tier", tier);
    }

    // 검색 (이름으로 검색 - Supabase에서)
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // 정렬 (created_at, name만 Supabase에서 직접 정렬 가능)
    if (sortBy === "created_at" || sortBy === "name") {
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
    } else {
      // order_count, total_spent는 나중에 클라이언트에서 정렬
      query = query.order("created_at", { ascending: false });
    }

    const { data: supabaseUsers, error: supabaseError, count } = await query;

    if (supabaseError) {
      console.error("Supabase 조회 실패:", supabaseError);
      throw new Error("회원 목록을 불러오는데 실패했습니다.");
    }

    console.log(`Supabase에서 ${supabaseUsers?.length || 0}명 조회`);

    // 2. Clerk에서 사용자 정보 조회 (역할, 이메일, 프로필 이미지 등)
    const adminUsers: AdminUser[] = [];

    for (const supabaseUser of supabaseUsers || []) {
      try {
        const clerkUser = await clerk.users.getUser(supabaseUser.clerk_id);
        const userRole = (clerkUser.publicMetadata?.role as UserRole) || "user";

        // 역할 필터 적용
        if (role !== "all" && userRole !== role) {
          continue;
        }

        // 주문 통계 조회
        const orderStats = await getUserOrderStatsInternal(supabaseUser.clerk_id);

        adminUsers.push({
          id: supabaseUser.id,
          clerkId: supabaseUser.clerk_id,
          name: supabaseUser.name || clerkUser.firstName || "이름 없음",
          email: clerkUser.emailAddresses[0]?.emailAddress || supabaseUser.email || null,
          imageUrl: clerkUser.imageUrl || null,
          role: userRole,
          tier: (supabaseUser.tier as UserTier) || "normal",
          createdAt: supabaseUser.created_at,
          updatedAt: supabaseUser.updated_at || null,
          lastSignInAt: clerkUser.lastSignInAt
            ? new Date(clerkUser.lastSignInAt).toISOString()
            : null,
          orderCount: orderStats.totalOrders,
          totalSpent: orderStats.totalSpent,
        });
      } catch (clerkError) {
        console.warn(`Clerk 사용자 조회 실패 (${supabaseUser.clerk_id}):`, clerkError);
        // Clerk에서 조회 실패한 경우 Supabase 데이터만으로 생성
        adminUsers.push({
          id: supabaseUser.id,
          clerkId: supabaseUser.clerk_id,
          name: supabaseUser.name || "이름 없음",
          email: supabaseUser.email || null,
          imageUrl: null,
          role: "user",
          tier: (supabaseUser.tier as UserTier) || "normal",
          createdAt: supabaseUser.created_at,
          updatedAt: supabaseUser.updated_at || null,
          lastSignInAt: null,
          orderCount: 0,
          totalSpent: 0,
        });
      }
    }

    // 3. 주문 관련 정렬 (order_count, total_spent)
    if (sortBy === "order_count") {
      adminUsers.sort((a, b) =>
        sortOrder === "asc"
          ? a.orderCount - b.orderCount
          : b.orderCount - a.orderCount
      );
    } else if (sortBy === "total_spent") {
      adminUsers.sort((a, b) =>
        sortOrder === "asc"
          ? a.totalSpent - b.totalSpent
          : b.totalSpent - a.totalSpent
      );
    }

    // 4. 페이지네이션 적용
    const total = adminUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedUsers = adminUsers.slice(startIndex, startIndex + limit);

    console.log(`총 ${total}명 중 ${paginatedUsers.length}명 반환`);
    console.groupEnd();

    return {
      users: paginatedUsers,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("회원 목록 조회 실패:", error);
    console.groupEnd();
    throw error;
  }
}

// ============================================================================
// 회원 상세 조회
// ============================================================================

/**
 * 회원 상세 정보 조회 (주문 내역 포함)
 *
 * @param clerkId Clerk 사용자 ID
 * @returns 회원 상세 정보
 */
export async function getUserDetail(clerkId: string): Promise<AdminUserDetail | null> {
  const supabase = getServiceRoleClient();
  const clerk = await clerkClient();

  console.group("[getUserDetail] 회원 상세 조회");
  console.log("Clerk ID:", clerkId);

  try {
    // 1. Supabase에서 사용자 정보 조회
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single();

    if (supabaseError || !supabaseUser) {
      console.error("Supabase 사용자 조회 실패:", supabaseError);
      console.groupEnd();
      return null;
    }

    // 2. Clerk에서 사용자 정보 조회
    let clerkUser;
    try {
      clerkUser = await clerk.users.getUser(clerkId);
    } catch (clerkError) {
      console.error("Clerk 사용자 조회 실패:", clerkError);
      console.groupEnd();
      return null;
    }

    // 3. 주문 통계 조회
    const orderStats = await getUserOrderStatsInternal(clerkId);

    // 4. 최근 주문 목록 조회
    const recentOrders = await getRecentOrders(clerkId);

    const userRole = (clerkUser.publicMetadata?.role as UserRole) || "user";

    const userDetail: AdminUserDetail = {
      id: supabaseUser.id,
      clerkId: supabaseUser.clerk_id,
      name: supabaseUser.name || clerkUser.firstName || "이름 없음",
      email: clerkUser.emailAddresses[0]?.emailAddress || supabaseUser.email || null,
      imageUrl: clerkUser.imageUrl || null,
      role: userRole,
      tier: (supabaseUser.tier as UserTier) || "normal",
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || null,
      lastSignInAt: clerkUser.lastSignInAt
        ? new Date(clerkUser.lastSignInAt).toISOString()
        : null,
      orderCount: orderStats.totalOrders,
      totalSpent: orderStats.totalSpent,
      recentOrders,
      averageOrderValue: orderStats.averageOrderValue,
    };

    console.log("회원 상세 조회 완료:", userDetail.name);
    console.groupEnd();

    return userDetail;
  } catch (error) {
    console.error("회원 상세 조회 실패:", error);
    console.groupEnd();
    throw error;
  }
}

// ============================================================================
// 역할/등급 변경
// ============================================================================

/**
 * 회원 역할 변경 (Clerk publicMetadata 업데이트)
 *
 * @param clerkId Clerk 사용자 ID
 * @param role 새로운 역할
 */
export async function updateUserRole(clerkId: string, role: UserRole): Promise<void> {
  const clerk = await clerkClient();

  console.group("[updateUserRole] 역할 변경");
  console.log("Clerk ID:", clerkId, "New Role:", role);

  try {
    await clerk.users.updateUserMetadata(clerkId, {
      publicMetadata: { role },
    });

    console.log("역할 변경 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${clerkId}`);
  } catch (error) {
    console.error("역할 변경 실패:", error);
    console.groupEnd();
    throw new Error("역할 변경에 실패했습니다.");
  }
}

/**
 * 회원 등급 변경 (Supabase users 테이블 업데이트)
 *
 * @param clerkId Clerk 사용자 ID
 * @param tier 새로운 등급
 */
export async function updateUserTier(clerkId: string, tier: UserTier): Promise<void> {
  const supabase = getServiceRoleClient();

  console.group("[updateUserTier] 등급 변경");
  console.log("Clerk ID:", clerkId, "New Tier:", tier);

  try {
    const { error } = await supabase
      .from("users")
      .update({ tier })
      .eq("clerk_id", clerkId);

    if (error) {
      console.error("등급 변경 실패:", error);
      throw new Error("등급 변경에 실패했습니다.");
    }

    console.log("등급 변경 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${clerkId}`);
  } catch (error) {
    console.error("등급 변경 실패:", error);
    console.groupEnd();
    throw error;
  }
}

// ============================================================================
// 주문 통계 조회
// ============================================================================

/**
 * 회원별 주문 통계 조회 (외부 노출용)
 *
 * @param clerkId Clerk 사용자 ID
 * @returns 주문 통계
 */
export async function getUserOrderStats(clerkId: string): Promise<UserOrderStats> {
  return getUserOrderStatsInternal(clerkId);
}

/**
 * 회원별 주문 통계 조회 (내부용)
 */
async function getUserOrderStatsInternal(clerkId: string): Promise<UserOrderStats> {
  const supabase = getServiceRoleClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, total_amount, created_at")
    .eq("clerk_id", clerkId)
    .neq("status", "cancelled");

  if (error || !orders) {
    return {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderDate: null,
    };
  }

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const lastOrderDate = orders.length > 0
    ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
    : null;

  return {
    totalOrders,
    totalSpent,
    averageOrderValue,
    lastOrderDate,
  };
}

/**
 * 회원의 최근 주문 목록 조회
 */
async function getRecentOrders(clerkId: string, limit = 10): Promise<UserOrderSummary[]> {
  const supabase = getServiceRoleClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      order_items (id)
    `)
    .eq("clerk_id", clerkId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !orders) {
    return [];
  }

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.id.substring(0, 8).toUpperCase(),
    status: order.status,
    totalAmount: order.total_amount || 0,
    createdAt: order.created_at,
    itemCount: Array.isArray(order.order_items) ? order.order_items.length : 0,
  }));
}

// ============================================================================
// 회원 수 통계
// ============================================================================

/**
 * 전체 회원 수 조회
 */
export async function getTotalUserCount(): Promise<number> {
  const supabase = getServiceRoleClient();

  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("회원 수 조회 실패:", error);
    return 0;
  }

  return count || 0;
}

/**
 * 등급별 회원 수 조회
 */
export async function getUserCountByTier(): Promise<Record<UserTier, number>> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase.from("users").select("tier");

  if (error || !data) {
    return { normal: 0, vip: 0 };
  }

  const counts: Record<UserTier, number> = { normal: 0, vip: 0 };
  data.forEach((user) => {
    const tier = (user.tier as UserTier) || "normal";
    counts[tier]++;
  });

  return counts;
}

