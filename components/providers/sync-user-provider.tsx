"use client";

import { useSyncUser } from "@/hooks/use-sync-user";
import { useSyncCart } from "@/hooks/use-sync-cart";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 프로바이더
 * 로그인 시 로컬 스토리지 장바구니도 서버로 동기화합니다.
 *
 * RootLayout에 추가하여 로그인한 모든 사용자를 자동으로 Supabase에 동기화합니다.
 */
export function SyncUserProvider({ children }: { children: React.ReactNode }) {
  useSyncUser();
  useSyncCart(); // 로그인 시 장바구니 동기화
  return <>{children}</>;
}
