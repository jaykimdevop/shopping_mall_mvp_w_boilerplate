/**
 * @file types/order.ts
 * @description 주문 관련 TypeScript 타입 정의
 *
 * Supabase orders, order_items 테이블과 일치하는 타입을 정의합니다.
 * 주문 생성, 조회 시 사용됩니다.
 */

import type { Product } from "./product";

/**
 * 배송지 정보
 * orders 테이블의 shipping_address JSONB 컬럼 스키마
 */
export interface ShippingAddress {
  name: string; // 수령인 이름
  phone: string; // 연락처
  zipCode: string; // 우편번호
  address: string; // 기본 주소
  detailAddress: string; // 상세 주소
}

/**
 * 주문 상태
 */
export type OrderStatus =
  | "pending" // 결제 대기
  | "confirmed" // 주문 확정
  | "shipped" // 배송 중
  | "delivered" // 배송 완료
  | "cancelled"; // 주문 취소

/**
 * 주문 아이템 타입
 * order_items 테이블 구조
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
  // 조회 시 product 정보를 JOIN할 경우
  product?: Product;
}

/**
 * 배송 업체 코드
 */
export type ShippingCarrier =
  | "cj" // CJ대한통운
  | "hanjin" // 한진택배
  | "lotte" // 롯데택배
  | "logen" // 로젠택배
  | "epost" // 우체국택배
  | "ups" // UPS
  | "fedex" // FedEx
  | "other"; // 기타

/**
 * 배송 업체 목록
 */
export const SHIPPING_CARRIERS: ShippingCarrier[] = [
  "cj",
  "hanjin",
  "lotte",
  "logen",
  "epost",
  "ups",
  "fedex",
  "other",
];

/**
 * 배송 업체 한글 라벨
 */
export const SHIPPING_CARRIER_LABELS: Record<ShippingCarrier, string> = {
  cj: "CJ대한통운",
  hanjin: "한진택배",
  lotte: "롯데택배",
  logen: "로젠택배",
  epost: "우체국택배",
  ups: "UPS",
  fedex: "FedEx",
  other: "기타",
};

/**
 * 배송 업체별 조회 URL 패턴
 * {trackingNumber}를 실제 운송장 번호로 치환하여 사용
 */
export const SHIPPING_TRACKING_URLS: Record<ShippingCarrier, string | null> = {
  cj: "https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo={trackingNumber}",
  hanjin:
    "https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mession=open&wblnum={trackingNumber}",
  lotte:
    "https://www.lotteglogis.com/home/reservation/tracking/index?InvNo={trackingNumber}",
  logen: "https://www.ilogen.com/web/personal/trace/{trackingNumber}",
  epost:
    "https://service.epost.go.kr/trace.RetrieveDomRi498.postal?sid1={trackingNumber}",
  ups: "https://www.ups.com/track?tracknum={trackingNumber}",
  fedex: "https://www.fedex.com/fedextrack/?trknbr={trackingNumber}",
  other: null,
};

/**
 * 주문 타입
 * orders 테이블 구조
 * 회원/비회원 주문 모두 지원
 */
export interface Order {
  id: string;
  clerk_id: string | null; // 비회원인 경우 null
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  order_note: string | null;
  created_at: string;
  updated_at: string;
  // 비회원 주문 정보
  guest_email?: string | null;
  guest_phone?: string | null;
  // 배송 정보
  tracking_number?: string | null;
  shipping_carrier?: ShippingCarrier | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  // 주문 상세 조회 시 order_items를 JOIN할 경우
  order_items?: OrderItem[];
}

/**
 * 주문 생성 입력 타입
 * 회원/비회원 주문 모두 지원
 */
export interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  orderNote?: string;
  expectedTotal: number; // 클라이언트에서 계산한 총액 (검증용)
  // 비회원 주문 정보 (비회원인 경우 필수)
  isGuest?: boolean;
  guestEmail?: string;
  guestPhone?: string;
  // 비회원 장바구니 아이템 (비회원인 경우 클라이언트에서 전달)
  guestCartItems?: GuestCartItemInput[];
}

/**
 * 비회원 장바구니 아이템 입력 타입
 * 주문 생성 시 클라이언트에서 전달
 */
export interface GuestCartItemInput {
  product_id: string;
  quantity: number;
}

/**
 * 주문 생성 결과 타입
 */
export interface CreateOrderResult {
  success: boolean;
  message?: string;
  order?: Order;
  requiresAuth?: boolean; // 로그인이 필요한 경우 true
}

/**
 * 주문 조회 결과 타입
 */
export interface GetOrderResult {
  success: boolean;
  message?: string;
  order?: Order;
}

/**
 * 주문 목록 조회 결과 타입
 */
export interface GetOrdersResult {
  success: boolean;
  message?: string;
  orders?: Order[];
}

/**
 * 비회원 주문 조회 입력 타입
 */
export interface GuestOrderLookupInput {
  orderId: string;
  email?: string;
  phone?: string;
}

/**
 * 비회원 주문 조회 결과 타입
 */
export interface GuestOrderLookupResult {
  success: boolean;
  message?: string;
  order?: Order;
}

// ============================================================================
// 관리자 주문 관리 타입
// ============================================================================

/**
 * 관리자 주문 목록 조회 옵션
 */
export interface AdminOrderQueryOptions {
  search?: string; // 주문번호, 고객명, 이메일 검색
  status?: OrderStatus | "all";
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  sortBy?: "created_at" | "total_amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * 고객 정보 포함 주문 타입 (관리자용)
 */
export interface OrderWithCustomer extends Order {
  customer_name?: string | null;
  customer_email?: string | null;
}

/**
 * 페이지네이션된 주문 목록 응답 타입
 */
export interface PaginatedOrdersResponse {
  orders: OrderWithCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 주문 상태 변경 결과 타입
 */
export interface UpdateOrderStatusResult {
  success: boolean;
  message?: string;
  order?: Order;
}

/**
 * 주문 상태 한글 라벨
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "결제 대기",
  confirmed: "주문 확정",
  shipped: "배송 중",
  delivered: "배송 완료",
  cancelled: "주문 취소",
};

/**
 * 주문 상태 목록 (필터용)
 */
export const ORDER_STATUS_LIST: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

// ============================================================================
// 배송 관리 타입
// ============================================================================

/**
 * 배송 상태 (배송 관리 페이지용)
 */
export type ShippingStatus =
  | "pending_shipment" // 배송 대기 (confirmed 상태, 운송장 미입력)
  | "shipped" // 배송 중 (shipped 상태)
  | "delivered"; // 배송 완료 (delivered 상태)

/**
 * 배송 상태 한글 라벨
 */
export const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  pending_shipment: "배송 대기",
  shipped: "배송 중",
  delivered: "배송 완료",
};

/**
 * 배송 상태 목록 (필터용)
 */
export const SHIPPING_STATUS_LIST: ShippingStatus[] = [
  "pending_shipment",
  "shipped",
  "delivered",
];

/**
 * 관리자 배송 목록 조회 옵션
 */
export interface AdminShippingQueryOptions {
  search?: string; // 주문번호, 수령인명, 운송장 번호 검색
  shippingStatus?: ShippingStatus | "all";
  carrier?: ShippingCarrier | "all";
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  sortBy?: "created_at" | "shipped_at" | "delivered_at";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * 배송 정보 포함 주문 타입 (배송 관리용)
 */
export interface ShippingOrder extends Order {
  customer_name?: string | null;
  customer_email?: string | null;
  recipient_name?: string | null; // 수령인명 (shipping_address에서 추출)
  recipient_phone?: string | null; // 수령인 연락처
  recipient_address?: string | null; // 배송 주소 (전체)
}

/**
 * 페이지네이션된 배송 목록 응답 타입
 */
export interface PaginatedShippingResponse {
  orders: ShippingOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 배송 상태별 건수
 */
export interface ShippingStatusCounts {
  all: number;
  pending_shipment: number;
  shipped: number;
  delivered: number;
}

/**
 * 운송장 번호 입력 타입
 */
export interface TrackingInput {
  orderId: string;
  trackingNumber: string;
  carrier: ShippingCarrier;
}

/**
 * 일괄 운송장 입력 타입
 */
export interface BulkTrackingInput {
  items: TrackingInput[];
}

/**
 * 운송장 입력 결과 타입
 */
export interface UpdateTrackingResult {
  success: boolean;
  message?: string;
  order?: Order;
}

/**
 * 일괄 운송장 입력 결과 타입
 */
export interface BulkUpdateTrackingResult {
  success: boolean;
  message?: string;
  successCount: number;
  failCount: number;
  errors?: { orderId: string; error: string }[];
}

