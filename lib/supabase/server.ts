import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component용)
 *
 * Supabase 공식 문서의 모범 사례를 따르며 Clerk 통합을 유지합니다:
 * - @supabase/ssr의 createServerClient 사용 (공식 권장)
 * - Cookie 기반 세션 관리 지원
 * - JWT 템플릿 불필요 (2025년 4월 이후 deprecated)
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createClerkSupabaseClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
export async function createClerkSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // @supabase/ssr의 createServerClient 사용 (공식 권장)
  // Cookie 기반 세션 관리를 지원하지만, Clerk를 사용하므로 accessToken으로 Clerk 토큰 제공
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component에서 setAll 호출 시 무시
          // Middleware에서 세션 갱신을 처리합니다
        }
      },
    },
    async accessToken() {
      // Clerk 세션 토큰을 accessToken으로 제공
      return (await auth()).getToken() ?? null;
    },
  });
}
