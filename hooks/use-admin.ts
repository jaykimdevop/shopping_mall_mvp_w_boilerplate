"use client";

/**
 * @file use-admin.ts
 * @description 관리자 권한 확인 훅
 *
 * Clerk publicMetadata의 role을 확인하여 현재 사용자가
 * 관리자인지 여부를 반환합니다.
 *
 * @example
 * ```tsx
 * const { isAdmin, isLoaded } = useAdmin();
 *
 * if (!isLoaded) return <Loading />;
 * if (isAdmin) return <AdminContent />;
 * return <UserContent />;
 * ```
 *
 * @dependencies
 * - @clerk/nextjs: useUser hook
 * - types/user: USER_ROLES 상수
 */

import { useUser } from "@clerk/nextjs";
import { USER_ROLES, type UserRole } from "@/types/user";

interface UseAdminReturn {
  /** 현재 사용자가 관리자인지 여부 */
  isAdmin: boolean;
  /** 현재 사용자의 역할 */
  role: UserRole | undefined;
  /** Clerk 사용자 정보 로딩 완료 여부 */
  isLoaded: boolean;
  /** 로그인 여부 */
  isSignedIn: boolean | undefined;
}

/**
 * 관리자 권한 확인 훅
 *
 * @returns {UseAdminReturn} 관리자 권한 정보
 */
export function useAdmin(): UseAdminReturn {
  const { user, isLoaded, isSignedIn } = useUser();

  // publicMetadata에서 role 추출
  const role = user?.publicMetadata?.role as UserRole | undefined;

  // 관리자 여부 확인
  const isAdmin = role === USER_ROLES.ADMIN;

  return {
    isAdmin,
    role,
    isLoaded,
    isSignedIn,
  };
}

