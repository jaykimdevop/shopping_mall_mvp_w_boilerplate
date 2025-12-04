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

  // Clerk를 사용하는 경우, Supabase 인증 시스템을 사용하지 않으므로
  // auth.getUser() 호출을 제거합니다.
  // Clerk 세션은 Clerk 미들웨어에서 관리됩니다.

  return supabaseResponse;
}

