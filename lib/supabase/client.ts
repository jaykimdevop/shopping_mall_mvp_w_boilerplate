import { createBrowserClient } from "@supabase/ssr";

/**
 * 공개 데이터용 Supabase 클라이언트
 *
 * 인증이 필요 없는 공개 데이터 접근용입니다.
 * @supabase/ssr의 createBrowserClient를 사용합니다 (공식 권장).
 *
 * @example
 * ```tsx
 * import { supabase } from '@/lib/supabase/client';
 *
 * // RLS 정책이 'to anon'인 데이터만 접근 가능
 * const { data } = await supabase.from('public_posts').select('*');
 * ```
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
