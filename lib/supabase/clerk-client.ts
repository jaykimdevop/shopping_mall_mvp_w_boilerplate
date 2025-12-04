"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * Supabase 공식 문서의 모범 사례를 따르며 Clerk 통합을 유지합니다:
 * - @supabase/ssr의 createBrowserClient 사용 (공식 권장)
 * - JWT 템플릿 불필요 (2025년 4월 이후 deprecated)
 * - useAuth().getToken()으로 현재 세션 토큰 사용
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *
 *   async function fetchData() {
 *     const { data } = await supabase.from('table').select('*');
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // @supabase/ssr의 createBrowserClient 사용 (공식 권장)
    return createBrowserClient(supabaseUrl, supabaseKey, {
      async accessToken() {
        // Clerk 세션 토큰을 accessToken으로 제공
        return (await getToken()) ?? null;
      },
    });
  }, [getToken]);

  return supabase;
}
