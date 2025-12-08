-- Orders 테이블에 배송 관련 컬럼 추가

-- 운송장 번호 컬럼 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 배송 업체 컬럼 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT CHECK (
    shipping_carrier IS NULL OR 
    shipping_carrier IN ('cj', 'hanjin', 'lotte', 'logen', 'epost', 'ups', 'fedex', 'other')
);

-- 배송 시작 일시 컬럼 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;

-- 배송 완료 일시 컬럼 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_carrier ON public.orders(shipping_carrier);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON public.orders(shipped_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON public.orders(delivered_at);

-- 복합 인덱스: 배송 상태별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON public.orders(status, shipped_at, delivered_at);

COMMENT ON COLUMN public.orders.tracking_number IS '운송장 번호';
COMMENT ON COLUMN public.orders.shipping_carrier IS '배송 업체 코드 (cj, hanjin, lotte, logen, epost, ups, fedex, other)';
COMMENT ON COLUMN public.orders.shipped_at IS '배송 시작 일시';
COMMENT ON COLUMN public.orders.delivered_at IS '배송 완료 일시';

