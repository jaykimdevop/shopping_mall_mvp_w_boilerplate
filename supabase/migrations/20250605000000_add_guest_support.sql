-- ==========================================
-- 비회원 지원을 위한 스키마 수정
-- cart_items와 orders 테이블에 비회원 관련 컬럼 추가
-- ==========================================

-- 1. cart_items 테이블 수정
-- clerk_id를 nullable로 변경하고 session_id 컬럼 추가

-- 기존 Foreign Key 제약 조건 삭제 (존재하는 경우)
ALTER TABLE public.cart_items
DROP CONSTRAINT IF EXISTS cart_items_clerk_id_fkey;

-- clerk_id를 nullable로 변경
ALTER TABLE public.cart_items
ALTER COLUMN clerk_id DROP NOT NULL;

-- session_id 컬럼 추가 (비회원 세션 식별용)
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- session_id 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

-- 비회원 장바구니 UNIQUE 제약 조건 추가 (session_id + product_id)
-- 기존 UNIQUE 제약 조건 삭제
ALTER TABLE public.cart_items
DROP CONSTRAINT IF EXISTS cart_items_clerk_id_product_id_key;

-- 새로운 UNIQUE 제약 조건 추가 (회원용)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_clerk_product 
ON cart_items(clerk_id, product_id) 
WHERE clerk_id IS NOT NULL;

-- 새로운 UNIQUE 제약 조건 추가 (비회원용)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_session_product 
ON cart_items(session_id, product_id) 
WHERE session_id IS NOT NULL;

-- CHECK 제약 조건: clerk_id 또는 session_id 중 하나는 반드시 존재해야 함
ALTER TABLE public.cart_items
ADD CONSTRAINT cart_items_user_check 
CHECK (clerk_id IS NOT NULL OR session_id IS NOT NULL);

-- 2. orders 테이블 수정
-- clerk_id를 nullable로 변경하고 guest_email, guest_phone 컬럼 추가

-- 기존 Foreign Key 제약 조건 삭제 (존재하는 경우)
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_clerk_id_fkey;

-- clerk_id를 nullable로 변경
ALTER TABLE public.orders
ALTER COLUMN clerk_id DROP NOT NULL;

-- guest_email 컬럼 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- guest_phone 컬럼 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- guest_email 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);

-- guest_phone 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_guest_phone ON orders(guest_phone);

-- CHECK 제약 조건: 회원 주문이면 clerk_id 필수, 비회원 주문이면 guest_email 또는 guest_phone 필수
ALTER TABLE public.orders
ADD CONSTRAINT orders_user_check 
CHECK (
  clerk_id IS NOT NULL OR 
  (guest_email IS NOT NULL OR guest_phone IS NOT NULL)
);

-- 3. 비회원 장바구니 만료 처리를 위한 함수 (선택적)
-- 오래된 비회원 장바구니를 정리하는 함수
CREATE OR REPLACE FUNCTION cleanup_guest_cart_items()
RETURNS void AS $$
BEGIN
  -- 7일 이상 된 비회원 장바구니 아이템 삭제
  DELETE FROM cart_items 
  WHERE session_id IS NOT NULL 
    AND clerk_id IS NULL 
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 주석: 이 함수는 cron job 또는 Edge Function으로 주기적으로 실행할 수 있습니다.
-- 예: SELECT cleanup_guest_cart_items();

