/**
 * @file user.ts
 * @description 사용자 역할 및 등급 관련 타입 정의
 *
 * Clerk publicMetadata와 Supabase users 테이블에서 사용되는
 * 사용자 역할(role)과 등급(tier) 타입을 정의합니다.
 *
 * @dependencies
 * - Clerk: publicMetadata.role 저장
 * - Supabase: users 테이블 (clerk_id, name, email, tier 등)
 */

// ============================================================================
// 역할 (Role) 관련 타입
// ============================================================================

/**
 * 사용자 역할 상수
 * enum 대신 const 객체 사용 (TypeScript 권장 패턴)
 */
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

/**
 * 사용자 역할 타입
 * 'user' | 'admin'
 */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * 역할 라벨 (UI 표시용)
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  user: "일반 회원",
  admin: "관리자",
};

// ============================================================================
// 등급 (Tier) 관련 타입
// ============================================================================

/**
 * 사용자 등급 상수
 */
export const USER_TIERS = {
  NORMAL: "normal",
  VIP: "vip",
} as const;

/**
 * 사용자 등급 타입
 * 'normal' | 'vip'
 */
export type UserTier = (typeof USER_TIERS)[keyof typeof USER_TIERS];

/**
 * 등급 라벨 (UI 표시용)
 */
export const USER_TIER_LABELS: Record<UserTier, string> = {
  normal: "일반",
  vip: "VIP",
};

/**
 * 등급 목록 (필터/선택용)
 */
export const USER_TIER_LIST: UserTier[] = ["normal", "vip"];

// ============================================================================
// Clerk 관련 타입
// ============================================================================

/**
 * Clerk publicMetadata 타입
 * Clerk 사용자의 공개 메타데이터 구조
 */
export interface ClerkPublicMetadata {
  role?: UserRole;
}

// ============================================================================
// Supabase 관련 타입
// ============================================================================

/**
 * Supabase users 테이블 타입
 */
export interface SupabaseUser {
  id: string;
  clerk_id: string;
  name: string;
  email?: string | null;
  tier: UserTier;
  created_at: string;
  updated_at?: string | null;
}

// ============================================================================
// 관리자 페이지용 타입
// ============================================================================

/**
 * 관리자 회원 관리용 통합 사용자 타입
 * Clerk API + Supabase users 테이블 데이터 통합
 */
export interface AdminUser {
  /** Supabase users 테이블 ID */
  id: string;
  /** Clerk 사용자 ID */
  clerkId: string;
  /** 사용자 이름 */
  name: string;
  /** 이메일 주소 (Clerk에서 조회) */
  email: string | null;
  /** 프로필 이미지 URL (Clerk에서 조회) */
  imageUrl: string | null;
  /** 역할 (Clerk publicMetadata) */
  role: UserRole;
  /** 등급 (Supabase users 테이블) */
  tier: UserTier;
  /** 가입일 */
  createdAt: string;
  /** 마지막 수정일 */
  updatedAt: string | null;
  /** 마지막 로그인 일시 (Clerk에서 조회) */
  lastSignInAt: string | null;
  /** 총 주문 횟수 */
  orderCount: number;
  /** 총 주문 금액 */
  totalSpent: number;
}

/**
 * 관리자 회원 목록 조회 옵션
 */
export interface AdminUserQueryOptions {
  /** 검색어 (이름, 이메일) */
  search?: string;
  /** 역할 필터 */
  role?: UserRole | "all";
  /** 등급 필터 */
  tier?: UserTier | "all";
  /** 정렬 기준 */
  sortBy?: "created_at" | "name" | "order_count" | "total_spent";
  /** 정렬 순서 */
  sortOrder?: "asc" | "desc";
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 항목 수 */
  limit?: number;
}

/**
 * 페이지네이션된 회원 목록 응답
 */
export interface PaginatedUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 회원 상세 정보 (주문 내역 포함)
 */
export interface AdminUserDetail extends AdminUser {
  /** 최근 주문 목록 */
  recentOrders: UserOrderSummary[];
  /** 평균 주문 금액 */
  averageOrderValue: number;
}

/**
 * 회원의 주문 요약 정보
 */
export interface UserOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

/**
 * 회원 주문 통계
 */
export interface UserOrderStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 역할이 관리자인지 확인하는 헬퍼 함수
 */
export function isAdminRole(role?: string): boolean {
  return role === USER_ROLES.ADMIN;
}

/**
 * 등급이 VIP인지 확인하는 헬퍼 함수
 */
export function isVipTier(tier?: string): boolean {
  return tier === USER_TIERS.VIP;
}

