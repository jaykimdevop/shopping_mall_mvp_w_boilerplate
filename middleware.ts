import { clerkMiddleware } from "@clerk/nextjs/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

/**
 * Next.js Middleware
 *
 * Clerk 인증과 Supabase 세션 관리를 함께 처리합니다.
 * Supabase 공식 문서의 모범 사례를 따릅니다.
 */
export default clerkMiddleware(async (auth, request: NextRequest) => {
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
