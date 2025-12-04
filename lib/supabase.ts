/**
 * @deprecated 이 파일은 레거시입니다. 
 * 
 * 대신 다음 파일들을 사용하세요:
 * - Client Component: `lib/supabase/clerk-client.ts` (useClerkSupabaseClient)
 * - Server Component: `lib/supabase/server.ts` (createClerkSupabaseClient)
 * - Service Role: `lib/supabase/service-role.ts` (getServiceRoleClient)
 * - Public Data: `lib/supabase/client.ts` (supabase)
 * 
 * 이 파일은 하위 호환성을 위해 유지되지만, 새 코드에서는 사용하지 마세요.
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * @deprecated Use `createClerkSupabaseClient` from `lib/supabase/server.ts` instead
 */
export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
};
