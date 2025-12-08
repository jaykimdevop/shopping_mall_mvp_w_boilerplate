"use server";

/**
 * @file actions/admin/shipping.ts
 * @description 관리자 배송 관리 Server Actions
 *
 * 배송 목록 조회, 운송장 번호 입력, 배송 상태 변경 기능을 제공합니다.
 *
 * @dependencies
 * - @/lib/supabase/service-role: RLS 우회를 위한 서비스 역할 클라이언트
 * - @/types/order: 주문/배송 관련 타입
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import type {
  Order,
  ShippingCarrier,
  ShippingStatus,
  AdminShippingQueryOptions,
  PaginatedShippingResponse,
  ShippingOrder,
  ShippingStatusCounts,
  TrackingInput,
  BulkTrackingInput,
  UpdateTrackingResult,
  BulkUpdateTrackingResult,
  ShippingAddress,
} from "@/types/order";

// ============================================================================
// 배송 목록 조회
// ============================================================================

/**
 * 관리자용 배송 목록 조회
 *
 * @param options 검색, 필터, 정렬, 페이지네이션 옵션
 * @returns 페이지네이션된 배송 목록
 */
export async function getShippingList(
  options: AdminShippingQueryOptions = {}
): Promise<PaginatedShippingResponse> {
  const supabase = getServiceRoleClient();

  const {
    search = "",
    shippingStatus = "all",
    carrier = "all",
    startDate,
    endDate,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = options;

  // 기본 쿼리 구성 - 배송 가능한 상태만 (confirmed, shipped, delivered)
  // pending과 cancelled는 배송 관리 대상에서 제외
  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .in("status", ["confirmed", "shipped", "delivered"]);

  // 배송 상태 필터
  if (shippingStatus !== "all") {
    switch (shippingStatus) {
      case "pending_shipment":
        // 배송 대기: confirmed 상태이면서 운송장 미입력
        query = query.eq("status", "confirmed").is("tracking_number", null);
        break;
      case "shipped":
        // 배송 중: shipped 상태
        query = query.eq("status", "shipped");
        break;
      case "delivered":
        // 배송 완료: delivered 상태
        query = query.eq("status", "delivered");
        break;
    }
  }

  // 배송 업체 필터
  if (carrier !== "all") {
    query = query.eq("shipping_carrier", carrier);
  }

  // 날짜 범위 필터
  if (startDate) {
    query = query.gte("created_at", `${startDate}T00:00:00`);
  }
  if (endDate) {
    query = query.lte("created_at", `${endDate}T23:59:59`);
  }

  // 검색 필터 (주문 ID, 운송장 번호, 또는 shipping_address의 name으로 검색)
  if (search) {
    query = query.or(
      `id.ilike.%${search}%,tracking_number.ilike.%${search}%,shipping_address->name.ilike.%${search}%`
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
    console.error("Failed to fetch shipping list:", error);
    throw new Error("배송 목록을 불러오는데 실패했습니다.");
  }

  // 고객 정보 및 수령인 정보 추가
  const shippingOrders: ShippingOrder[] = await Promise.all(
    (orders || []).map(async (order) => {
      let customerName: string | null = null;
      let customerEmail: string | null = null;

      // 회원 주문인 경우 users 테이블에서 정보 조회
      if (order.clerk_id) {
        const { data: user } = await supabase
          .from("users")
          .select("name, email")
          .eq("clerk_id", order.clerk_id)
          .single();

        if (user) {
          customerName = user.name;
          customerEmail = user.email;
        }
      } else {
        // 비회원 주문인 경우
        customerName = "비회원";
        customerEmail = order.guest_email;
      }

      // 배송지 정보 추출
      const shippingAddress = order.shipping_address as ShippingAddress | null;
      const recipientName = shippingAddress?.name || null;
      const recipientPhone = shippingAddress?.phone || null;
      const recipientAddress = shippingAddress
        ? `(${shippingAddress.zipCode}) ${shippingAddress.address} ${shippingAddress.detailAddress}`
        : null;

      return {
        ...order,
        customer_name: customerName,
        customer_email: customerEmail,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_address: recipientAddress,
      } as ShippingOrder;
    })
  );

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    orders: shippingOrders,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * 배송 상태별 건수 조회
 *
 * @returns 배송 상태별 건수
 */
export async function getShippingStatusCounts(): Promise<ShippingStatusCounts> {
  const supabase = getServiceRoleClient();

  // 전체 배송 대상 건수 (confirmed, shipped, delivered)
  const { count: allCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["confirmed", "shipped", "delivered"]);

  // 배송 대기 건수 (confirmed + 운송장 미입력)
  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "confirmed")
    .is("tracking_number", null);

  // 배송 중 건수
  const { count: shippedCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "shipped");

  // 배송 완료 건수
  const { count: deliveredCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "delivered");

  return {
    all: allCount || 0,
    pending_shipment: pendingCount || 0,
    shipped: shippedCount || 0,
    delivered: deliveredCount || 0,
  };
}

// ============================================================================
// 운송장 번호 관리
// ============================================================================

/**
 * 운송장 번호 입력 및 배송 시작
 *
 * @param orderId 주문 ID
 * @param trackingNumber 운송장 번호
 * @param carrier 배송 업체
 * @returns 업데이트 결과
 */
export async function updateTrackingNumber(
  orderId: string,
  trackingNumber: string,
  carrier: ShippingCarrier
): Promise<UpdateTrackingResult> {
  const supabase = getServiceRoleClient();

  // 주문 조회
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return {
      success: false,
      message: "주문을 찾을 수 없습니다.",
    };
  }

  // 상태 확인 (confirmed 또는 shipped 상태에서만 운송장 입력 가능)
  if (!["confirmed", "shipped"].includes(order.status)) {
    return {
      success: false,
      message: "운송장 번호를 입력할 수 없는 주문 상태입니다.",
    };
  }

  // 운송장 번호 입력 및 상태 변경
  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      tracking_number: trackingNumber,
      shipping_carrier: carrier,
      status: "shipped",
      shipped_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateError) {
    console.error("Failed to update tracking number:", updateError);
    return {
      success: false,
      message: "운송장 번호 입력에 실패했습니다.",
    };
  }

  revalidatePath("/admin/shipping");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return {
    success: true,
    message: "운송장 번호가 입력되었습니다.",
    order: updatedOrder as Order,
  };
}

/**
 * 운송장 번호 일괄 입력
 *
 * @param input 일괄 입력 데이터
 * @returns 일괄 입력 결과
 */
export async function bulkUpdateTracking(
  input: BulkTrackingInput
): Promise<BulkUpdateTrackingResult> {
  const { items } = input;

  if (items.length === 0) {
    return {
      success: false,
      message: "입력할 운송장 정보가 없습니다.",
      successCount: 0,
      failCount: 0,
    };
  }

  let successCount = 0;
  let failCount = 0;
  const errors: { orderId: string; error: string }[] = [];

  // 각 항목에 대해 운송장 번호 입력
  for (const item of items) {
    const result = await updateTrackingNumber(
      item.orderId,
      item.trackingNumber,
      item.carrier
    );

    if (result.success) {
      successCount++;
    } else {
      failCount++;
      errors.push({
        orderId: item.orderId,
        error: result.message || "알 수 없는 오류",
      });
    }
  }

  revalidatePath("/admin/shipping");
  revalidatePath("/admin/orders");

  return {
    success: failCount === 0,
    message:
      failCount === 0
        ? `${successCount}건의 운송장 번호가 입력되었습니다.`
        : `${successCount}건 성공, ${failCount}건 실패`,
    successCount,
    failCount,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * 운송장 번호 삭제 (배송 중 → 주문 확정 롤백)
 *
 * @param orderId 주문 ID
 * @returns 업데이트 결과
 */
export async function removeTrackingNumber(
  orderId: string
): Promise<UpdateTrackingResult> {
  const supabase = getServiceRoleClient();

  // 주문 조회
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return {
      success: false,
      message: "주문을 찾을 수 없습니다.",
    };
  }

  // 상태 확인 (shipped 상태에서만 운송장 삭제 가능)
  if (order.status !== "shipped") {
    return {
      success: false,
      message: "배송 중 상태에서만 운송장 번호를 삭제할 수 있습니다.",
    };
  }

  // 운송장 번호 삭제 및 상태 롤백
  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      tracking_number: null,
      shipping_carrier: null,
      status: "confirmed",
      shipped_at: null,
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateError) {
    console.error("Failed to remove tracking number:", updateError);
    return {
      success: false,
      message: "운송장 번호 삭제에 실패했습니다.",
    };
  }

  revalidatePath("/admin/shipping");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return {
    success: true,
    message: "운송장 번호가 삭제되었습니다.",
    order: updatedOrder as Order,
  };
}

// ============================================================================
// 배송 상태 변경
// ============================================================================

/**
 * 배송 완료 처리
 *
 * @param orderId 주문 ID
 * @returns 업데이트 결과
 */
export async function markAsDelivered(
  orderId: string
): Promise<UpdateTrackingResult> {
  const supabase = getServiceRoleClient();

  // 주문 조회
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return {
      success: false,
      message: "주문을 찾을 수 없습니다.",
    };
  }

  // 상태 확인 (shipped 상태에서만 배송 완료 가능)
  if (order.status !== "shipped") {
    return {
      success: false,
      message: "배송 중 상태에서만 배송 완료 처리할 수 있습니다.",
    };
  }

  // 배송 완료 처리
  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateError) {
    console.error("Failed to mark as delivered:", updateError);
    return {
      success: false,
      message: "배송 완료 처리에 실패했습니다.",
    };
  }

  revalidatePath("/admin/shipping");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return {
    success: true,
    message: "배송 완료 처리되었습니다.",
    order: updatedOrder as Order,
  };
}

/**
 * 배송 완료 취소 (배송 완료 → 배송 중 롤백)
 *
 * @param orderId 주문 ID
 * @returns 업데이트 결과
 */
export async function cancelDelivery(
  orderId: string
): Promise<UpdateTrackingResult> {
  const supabase = getServiceRoleClient();

  // 주문 조회
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return {
      success: false,
      message: "주문을 찾을 수 없습니다.",
    };
  }

  // 상태 확인 (delivered 상태에서만 취소 가능)
  if (order.status !== "delivered") {
    return {
      success: false,
      message: "배송 완료 상태에서만 취소할 수 있습니다.",
    };
  }

  // 배송 완료 취소
  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      delivered_at: null,
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateError) {
    console.error("Failed to cancel delivery:", updateError);
    return {
      success: false,
      message: "배송 완료 취소에 실패했습니다.",
    };
  }

  revalidatePath("/admin/shipping");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return {
    success: true,
    message: "배송 완료가 취소되었습니다.",
    order: updatedOrder as Order,
  };
}

/**
 * 배송 조회 URL 생성
 * 
 * 참고: 이 함수는 클라이언트에서 직접 사용하세요.
 * types/order.ts의 SHIPPING_TRACKING_URLS를 사용합니다.
 * 
 * @example
 * import { SHIPPING_TRACKING_URLS } from "@/types/order";
 * const url = SHIPPING_TRACKING_URLS[carrier]?.replace("{trackingNumber}", trackingNumber);
 */

