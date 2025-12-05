import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 통합 클라이언트 (Server Component용)
 *
 * RLS가 비활성화되어 있으므로 간단한 createClient를 사용합니다.
 * Clerk 인증은 애플리케이션 레벨에서 처리됩니다.
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // RLS가 비활성화되어 있으므로 간단한 클라이언트 사용
  // Clerk 인증은 auth() 함수를 통해 애플리케이션 레벨에서 처리
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    const authResult = await auth();
    console.log("[Supabase Client] Created client for user:", authResult.userId || "anonymous");
  }

  return client;
}
