/**
 * @file types/cart.ts
 * @description 장바구니 관련 TypeScript 타입 정의
 *
 * Supabase cart_items 테이블과 products 테이블을 JOIN한 결과를 반영합니다.
 */

import type { Product } from "./product";

/**
 * 장바구니 아이템 타입
 * cart_items 테이블과 products 테이블을 JOIN한 결과
 */
export interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // products 테이블과 JOIN한 결과
  product: Product;
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
}

/**
 * 장바구니 수량 변경 결과
 */
export interface UpdateCartQuantityResult {
  success: boolean;
  message?: string;
  cartItem?: CartItem;
}

/**
 * 장바구니 삭제 결과
 */
export interface RemoveCartItemResult {
  success: boolean;
  message?: string;
}

