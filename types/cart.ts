/**
 * @file types/cart.ts
 * @description 장바구니 관련 TypeScript 타입 정의
 *
 * Supabase cart_items 테이블과 products 테이블을 JOIN한 결과를 반영합니다.
 * 회원/비회원 장바구니 모두 지원합니다.
 */

import type { Product } from "./product";

// ==========================================
// 로컬 스토리지 상수
// ==========================================

/** 비회원 장바구니 로컬 스토리지 키 */
export const GUEST_CART_STORAGE_KEY = "guest_cart";

/** 비회원 세션 ID 로컬 스토리지 키 */
export const GUEST_SESSION_ID_KEY = "guest_session_id";

// ==========================================
// 장바구니 아이템 타입
// ==========================================

/**
 * 장바구니 아이템 타입 (회원용)
 * cart_items 테이블과 products 테이블을 JOIN한 결과
 */
export interface CartItem {
  id: string;
  clerk_id: string | null; // 비회원인 경우 null
  session_id?: string | null; // 비회원인 경우 세션 ID
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // products 테이블과 JOIN한 결과
  product: Product;
}

/**
 * 비회원 장바구니 아이템 타입 (로컬 스토리지용)
 */
export interface GuestCartItem {
  product_id: string;
  quantity: number;
  added_at: string; // ISO 날짜 문자열
  // 상품 정보는 별도로 조회해서 합침
  product?: Product;
}

/**
 * 비회원 장바구니 (로컬 스토리지에 저장되는 형태)
 */
export interface GuestCart {
  items: GuestCartItem[];
  updated_at: string; // ISO 날짜 문자열
}

/**
 * 장바구니 요약 정보
 */
export interface CartSummary {
  totalItems: number; // 총 아이템 개수 (수량 합계)
  totalPrice: number; // 총 금액
  itemCount: number; // 고유 상품 개수
}

/**
 * 장바구니 추가 결과
 */
export interface AddToCartResult {
  success: boolean;
  message?: string;
  cartItem?: CartItem;
  requiresAuth?: boolean; // 로그인이 필요한 경우 true
}

/**
 * 장바구니 수량 변경 결과
 */
export interface UpdateCartQuantityResult {
  success: boolean;
  message?: string;
  cartItem?: CartItem;
  requiresAuth?: boolean; // 로그인이 필요한 경우 true
}

/**
 * 장바구니 삭제 결과
 */
export interface RemoveCartItemResult {
  success: boolean;
  message?: string;
  requiresAuth?: boolean; // 로그인이 필요한 경우 true
}

/**
 * 장바구니 동기화 결과 (로그인 시 로컬 스토리지 → 서버)
 */
export interface SyncCartResult {
  success: boolean;
  message?: string;
  syncedItems?: number; // 동기화된 아이템 수
}

/**
 * 통합 장바구니 컨텍스트 타입
 * 회원/비회원 장바구니를 통합 관리
 */
export interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  isGuest: boolean;
  addItem: (productId: string, quantity: number) => Promise<AddToCartResult>;
  updateQuantity: (itemId: string, quantity: number) => Promise<UpdateCartQuantityResult>;
  removeItem: (itemId: string) => Promise<RemoveCartItemResult>;
  clearCart: () => Promise<void>;
  syncToServer: () => Promise<SyncCartResult>;
  totalItems: number;
  totalPrice: number;
}

