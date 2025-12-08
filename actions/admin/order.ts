"use server";

/**
 * @file actions/admin/order.ts
 * @description 관리자 주문 관리 Server Actions
 *
 * 주문 목록 조회, 상태 변경, 취소, 메모 관리 기능을 제공합니다.
 *
 * @dependencies
 * - @/lib/supabase/service-role: RLS 우회를 위한 서비스 역할 클라이언트
 * - @/types/order: 주문 관련 타입
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import type {
  Order,
  OrderStatus,
  AdminOrderQueryOptions,
  PaginatedOrdersResponse,
  OrderWithCustomer,
} from "@/types/order";

// ============================================================================
// 주문 조회
// ============================================================================

/**
 * 관리자용 주문 목록 조회
 *
 * @param options 검색, 필터, 정렬, 페이지네이션 옵션
 * @returns 페이지네이션된 주문 목록
 */
export async function getAdminOrders(
  options: AdminOrderQueryOptions = {}
): Promise<PaginatedOrdersResponse> {
  const supabase = getServiceRoleClient();

  const {
    search = "",
    status = "all",
    startDate,
    endDate,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = options;

  // 기본 쿼리 구성
  let query = supabase.from("orders").select("*", { count: "exact" });

  // 상태 필터
  if (status !== "all") {
    query = query.eq("status", status);
  }

  // 날짜 범위 필터
  if (startDate) {
    query = query.gte("created_at", `${startDate}T00:00:00`);
  }
  if (endDate) {
    query = query.lte("created_at", `${endDate}T23:59:59`);
  }

  // 검색 필터 (주문 ID로 검색)
  // 주문번호 검색은 ID 앞 8자리로 매칭
  if (search) {
    // ID 검색 또는 shipping_address의 name으로 검색
    query = query.or(
      `id.ilike.%${search}%,shipping_address->name.ilike.%${search}%`
    );
  }

  // 정렬
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 페이지네이션
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: orders, error, count } = await query;

  if (error) {
    console.error("Failed to fetch orders:", error);
    throw new Error("주문 목록을 불러오는데 실패했습니다.");
  }

  // 고객 정보 추가
  const ordersWithCustomer: OrderWithCustomer[] = await Promise.all(
    (orders || []).map(async (order) => {
      let customerName: string | null = null;
      let customerEmail: string | null = null;

      // 회원 주문인 경우 users 테이블에서 정보 조회
      if (order.clerk_id) {
        const { data: user } = await supabase
          .from("users")
          .select("name")
          .eq("clerk_id", order.clerk_id)
          .single();

        if (user) {
          customerName = user.name;
        }
      }

      // 비회원 주문인 경우 shipping_address에서 정보 추출
      const shippingAddress = order.shipping_address as {
        name?: string;
        phone?: string;
      } | null;

      if (!customerName && shippingAddress?.name) {
        customerName = shippingAddress.name;
      }

      // guest_email 또는 guest_phone 사용
      if (order.guest_email) {
        customerEmail = order.guest_email;
      }

      return {
        ...order,
        customer_name: customerName,
        customer_email: customerEmail,
      } as OrderWithCustomer;
    })
  );

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    orders: ordersWithCustomer,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * 주문 상세 조회 (order_items 포함)
 *
 * @param id 주문 ID
 * @returns 주문 상세 정보
 */
export async function getOrderById(id: string): Promise<OrderWithCustomer | null> {
  const supabase = getServiceRoleClient();

  // 주문 정보 조회
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    console.error("Failed to fetch order:", orderError);
    return null;
  }

  // 주문 아이템 조회
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Failed to fetch order items:", itemsError);
  }

  // 고객 정보 조회
  let customerName: string | null = null;
  let customerEmail: string | null = null;

  if (order.clerk_id) {
    const { data: user } = await supabase
      .from("users")
      .select("name")
      .eq("clerk_id", order.clerk_id)
      .single();

    if (user) {
      customerName = user.name;
    }
  }

  // 비회원 주문 정보
  const shippingAddress = order.shipping_address as {
    name?: string;
    phone?: string;
  } | null;

  if (!customerName && shippingAddress?.name) {
    customerName = shippingAddress.name;
  }

  if (order.guest_email) {
    customerEmail = order.guest_email;
  }

  return {
    ...order,
    order_items: orderItems || [],
    customer_name: customerName,
    customer_email: customerEmail,
  } as OrderWithCustomer;
}

// ============================================================================
// 주문 상태 변경
// ============================================================================

/**
 * 주문 상태 변경
 *
 * @param id 주문 ID
 * @param status 새로운 상태
 * @returns 업데이트된 주문
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update order status:", error);
    throw new Error("주문 상태 변경에 실패했습니다.");
  }

  // 관련 페이지 캐시 무효화
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);

  return data as Order;
}

/**
 * 주문 취소
 *
 * @param id 주문 ID
 * @returns 취소된 주문
 */
export async function cancelOrder(id: string): Promise<Order> {
  return updateOrderStatus(id, "cancelled");
}

// ============================================================================
// 주문 메모 관리
// ============================================================================

/**
 * 주문 메모 수정
 *
 * @param id 주문 ID
 * @param note 새로운 메모
 * @returns 업데이트된 주문
 */
export async function updateOrderNote(
  id: string,
  note: string
): Promise<Order> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      order_note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update order note:", error);
    throw new Error("주문 메모 수정에 실패했습니다.");
  }

  // 관련 페이지 캐시 무효화
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);

  return data as Order;
}

// ============================================================================
// 통계 조회
// ============================================================================

/**
 * 주문 상태별 개수 조회
 *
 * @returns 상태별 주문 개수
 */
export async function getOrderStatusCounts(): Promise<Record<OrderStatus | "all", number>> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("orders")
    .select("status");

  if (error) {
    console.error("Failed to fetch order status counts:", error);
    return {
      all: 0,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
  }

  const counts: Record<OrderStatus | "all", number> = {
    all: data?.length || 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  data?.forEach((order) => {
    const status = order.status as OrderStatus;
    if (status in counts) {
      counts[status]++;
    }
  });

  return counts;
}


