-- ==========================================
-- users 테이블과 다른 테이블 간 Foreign Key 관계 추가
-- ==========================================

-- cart_items.clerk_id가 users.clerk_id를 참조하도록 Foreign Key 추가
ALTER TABLE public.cart_items
ADD CONSTRAINT cart_items_clerk_id_fkey
FOREIGN KEY (clerk_id) REFERENCES public.users(clerk_id) ON DELETE CASCADE;

-- orders.clerk_id가 users.clerk_id를 참조하도록 Foreign Key 추가
ALTER TABLE public.orders
ADD CONSTRAINT orders_clerk_id_fkey
FOREIGN KEY (clerk_id) REFERENCES public.users(clerk_id) ON DELETE CASCADE;

-- 인덱스 추가 (Foreign Key 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

