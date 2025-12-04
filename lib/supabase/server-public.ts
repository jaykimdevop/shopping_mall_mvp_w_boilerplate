import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 공개 데이터용 Supabase 클라이언트 (Server Component용)
 *
 * 인증이 필요 없는 공개 데이터 접근용입니다.
 * Server Component에서 사용합니다.
 * accessToken 옵션 없이 사용하여 auth 관련 오류를 방지합니다.
 *
 * @example
 * ```tsx
 * import { createPublicSupabaseClient } from '@/lib/supabase/server-public';
 *
 * export default async function MyPage() {
 *   const supabase = await createPublicSupabaseClient();
 *   const { data } = await supabase.from('products').select('*');
 * }
 * ```
 */
export async function createPublicSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // accessToken 옵션 없이 사용 (공개 데이터 접근용)
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
        }
      },
    },
  });
}

