/**
 * @file types/product.ts
 * @description 상품 관련 TypeScript 타입 정의
 *
 * Supabase products 테이블과 일치하는 타입을 정의합니다.
 */

/**
 * 상품 타입
 * Supabase products 테이블의 구조를 반영합니다.
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 상품 목록 조회를 위한 쿼리 옵션
 */
export interface ProductQueryOptions {
  category?: string;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "price" | "name";
  orderDirection?: "asc" | "desc";
}

/**
 * 상품 카드에 표시할 정보
 */
export interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

