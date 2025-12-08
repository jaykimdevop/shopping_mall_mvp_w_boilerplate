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
  image_url: string | null;
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

/**
 * 상품 생성 입력 타입
 */
export interface CreateProductInput {
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  stock_quantity?: number;
  is_active?: boolean;
  image_url?: string | null;
}

/**
 * 상품 수정 입력 타입
 */
export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  price?: number;
  category?: string | null;
  stock_quantity?: number;
  is_active?: boolean;
  image_url?: string | null;
}

/**
 * 관리자 상품 목록 조회 옵션
 */
export interface AdminProductQueryOptions {
  search?: string;
  status?: "all" | "active" | "inactive";
  category?: string;
  sortBy?: "created_at" | "price" | "name" | "stock_quantity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

