import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware
 *
 * Clerk 인증과 Supabase 세션 관리를 함께 처리합니다.
 * 관리자 라우트(/admin/*)는 로그인 필수이며, 역할 체크는 레이아웃에서 수행합니다.
 */

// 관리자 전용 라우트 매처
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // 관리자 라우트: 로그인 필수 (역할 체크는 레이아웃에서 수행)
  if (isAdminRoute(request)) {
    const { userId } = await auth();

    // 비로그인 사용자: 로그인 페이지로 리다이렉트
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
    // 역할 체크는 app/admin/layout.tsx에서 currentUser()로 수행
  }

  // Supabase 세션 갱신 (공식 문서 권장 패턴)
  // Clerk를 사용하는 경우에도 Supabase 클라이언트의 세션 관리를 위해 필요합니다
  await updateSupabaseSession(request);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
