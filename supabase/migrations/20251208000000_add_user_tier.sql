-- Users 테이블에 회원 등급 및 추가 필드 추가
-- Phase 21: 회원 관리 기능을 위한 스키마 확장

-- email 컬럼 추가 (Clerk 동기화 시 저장)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email TEXT;

-- tier 컬럼 추가 (회원 등급: normal, vip)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'normal' CHECK (tier IN ('normal', 'vip'));

-- updated_at 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거가 존재하면 삭제 후 재생성
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;

-- updated_at 자동 업데이트 트리거 생성
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 코멘트 추가
COMMENT ON COLUMN public.users.email IS 'Clerk에서 동기화된 사용자 이메일';
COMMENT ON COLUMN public.users.tier IS '회원 등급: normal(일반), vip(VIP)';
COMMENT ON COLUMN public.users.updated_at IS '마지막 수정 일시';

