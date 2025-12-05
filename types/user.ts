/**
 * @file user.ts
 * @description 사용자 역할 관련 타입 정의
 *
 * Clerk publicMetadata와 Supabase users 테이블에서 사용되는
 * 사용자 역할(role) 타입을 정의합니다.
 *
 * @dependencies
 * - Clerk: publicMetadata.role 저장
 * - Supabase: users.role 컬럼
 */

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
 * Clerk publicMetadata 타입
 * Clerk 사용자의 공개 메타데이터 구조
 */
export interface ClerkPublicMetadata {
  role?: UserRole;
}

/**
 * Supabase users 테이블 타입
 */
export interface SupabaseUser {
  id: string;
  clerk_id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

/**
 * 역할이 관리자인지 확인하는 헬퍼 함수
 */
export function isAdminRole(role?: string): boolean {
  return role === USER_ROLES.ADMIN;
}

