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

