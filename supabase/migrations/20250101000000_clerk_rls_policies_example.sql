-- Clerk + Supabase 통합을 위한 RLS 정책 예시
-- 
-- 이 마이그레이션은 Clerk user ID 기반 RLS 정책의 예시를 제공합니다.
-- 실제 프로덕션 환경에서는 각 테이블의 요구사항에 맞게 정책을 수정해야 합니다.
--
-- 참고: 현재 개발 단계에서는 RLS가 비활성화되어 있지만,
-- 프로덕션 배포 전에는 반드시 RLS를 활성화하고 적절한 정책을 적용해야 합니다.

-- ============================================================================
-- 예시 1: tasks 테이블 (사용자별 작업 관리)
-- ============================================================================

-- tasks 테이블 생성 (예시)
-- 실제 프로젝트에서는 이미 테이블이 있을 수 있습니다.
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT (SELECT auth.jwt()->>'sub'),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화 (개발 단계에서는 주석 처리)
-- ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 정책 1: 사용자가 자신의 작업만 조회 가능
CREATE POLICY IF NOT EXISTS "Users can view their own tasks"
ON "public"."tasks"
FOR SELECT
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 정책 2: 사용자가 자신의 작업만 생성 가능
CREATE POLICY IF NOT EXISTS "Users can insert their own tasks"
ON "public"."tasks"
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 정책 3: 사용자가 자신의 작업만 수정 가능
CREATE POLICY IF NOT EXISTS "Users can update their own tasks"
ON "public"."tasks"
FOR UPDATE
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = user_id::text
)
WITH CHECK (
    (SELECT auth.jwt()->>'sub') = user_id::text
);

-- 정책 4: 사용자가 자신의 작업만 삭제 가능
CREATE POLICY IF NOT EXISTS "Users can delete their own tasks"
ON "public"."tasks"
FOR DELETE
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = user_id::text
);

-- ============================================================================
-- 예시 2: users 테이블 (프로덕션용 RLS 정책)
-- ============================================================================

-- users 테이블에 대한 RLS 정책 (프로덕션 배포 전 활성화 필요)
-- 현재는 개발 단계이므로 주석 처리되어 있습니다.

-- RLS 활성화 (프로덕션 배포 시 주석 해제)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 정책 1: 사용자가 자신의 프로필만 조회 가능
CREATE POLICY IF NOT EXISTS "Users can view their own profile"
ON "public"."users"
FOR SELECT
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = clerk_id::text
);

-- 정책 2: 사용자가 자신의 프로필만 수정 가능
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
ON "public"."users"
FOR UPDATE
TO authenticated
USING (
    (SELECT auth.jwt()->>'sub') = clerk_id::text
)
WITH CHECK (
    (SELECT auth.jwt()->>'sub') = clerk_id::text
);

-- 정책 3: 사용자 생성은 서버 사이드에서만 가능 (service-role 사용)
-- 일반 사용자는 직접 생성할 수 없도록 정책을 생성하지 않음

-- ============================================================================
-- 예시 3: 조직 기반 접근 제어 (고급)
-- ============================================================================

-- 조직 기반 테이블 예시 (실제 프로젝트에 필요 시 사용)
CREATE TABLE IF NOT EXISTS public.organization_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 활성화
-- ALTER TABLE public.organization_data ENABLE ROW LEVEL SECURITY;

-- 정책: 조직 관리자만 데이터 삽입 가능
CREATE POLICY IF NOT EXISTS "Only organization admins can insert"
ON "public"."organization_data"
FOR INSERT
TO authenticated
WITH CHECK (
    (
        (SELECT auth.jwt()->>'org_role') = 'org:admin'
        OR
        (SELECT auth.jwt()->'o'->>'rol') = 'admin'
    )
    AND
    organization_id = (
        SELECT COALESCE(
            auth.jwt()->>'org_id',
            auth.jwt()->'o'->>'id'
        )
    )
);

-- 정책: 조직 멤버는 자신의 조직 데이터만 조회 가능
CREATE POLICY IF NOT EXISTS "Users can view their organization data"
ON "public"."organization_data"
FOR SELECT
TO authenticated
USING (
    organization_id = (
        SELECT COALESCE(
            auth.jwt()->>'org_id',
            auth.jwt()->'o'->>'id'
        )
    )
);

-- ============================================================================
-- 유용한 쿼리: JWT 내용 확인
-- ============================================================================

-- 현재 인증된 사용자의 Clerk ID 확인
-- SELECT auth.jwt()->>'sub' as clerk_user_id;

-- JWT의 모든 클레임 확인
-- SELECT auth.jwt() as jwt_claims;

-- 조직 정보 확인 (조직 기반 접근 제어 사용 시)
-- SELECT 
--     auth.jwt()->>'org_id' as organization_id,
--     auth.jwt()->>'org_role' as organization_role,
--     auth.jwt()->'o'->>'id' as org_id_alt,
--     auth.jwt()->'o'->>'rol' as org_role_alt;

-- ============================================================================
-- 주의사항
-- ============================================================================

-- 1. 개발 단계에서는 RLS를 비활성화하여 개발 경험을 향상시킬 수 있습니다.
--    하지만 프로덕션 배포 전에는 반드시 RLS를 활성화해야 합니다.

-- 2. RLS 정책은 테이블별로 세밀하게 설정해야 합니다.
--    모든 테이블에 동일한 정책을 적용하는 것은 권장되지 않습니다.

-- 3. `auth.jwt()->>'sub'`는 Clerk user ID를 반환합니다.
--    이 값은 테이블의 `clerk_id` 또는 `user_id` 컬럼과 비교해야 합니다.

-- 4. 정책 테스트는 여러 사용자 계정으로 로그인하여 각각의 데이터만 접근 가능한지 확인하세요.

