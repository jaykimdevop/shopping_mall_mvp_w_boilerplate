import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase 세션 갱신을 위한 Middleware 유틸리티
 *
 * Supabase 공식 문서의 모범 사례를 따릅니다.
 * Clerk를 사용하는 경우에도 Supabase 클라이언트의 세션 관리를 위해 필요합니다.
 *
 * @param request - Next.js 요청 객체
 * @returns 세션이 갱신된 NextResponse
 */
export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 (Clerk를 사용하는 경우에도 Supabase 클라이언트 세션 관리)
  // 주의: Clerk 세션 토큰은 accessToken으로 제공되므로,
  // 여기서는 Supabase 클라이언트의 내부 세션만 갱신합니다
  await supabase.auth.getUser();

  return supabaseResponse;
}

