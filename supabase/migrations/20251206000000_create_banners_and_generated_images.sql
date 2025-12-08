-- Migration: Create banners and generated_images tables
-- Description: 배너 관리 및 AI 생성 이미지 보관을 위한 테이블

-- ============================================
-- 1. banners 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cta_text TEXT,
  cta_link TEXT,
  bg_color TEXT,
  image_url TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_sort_order ON banners(sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_product_id ON banners(product_id);

-- 코멘트 추가
COMMENT ON TABLE banners IS '홈페이지 히어로 슬라이더 배너';
COMMENT ON COLUMN banners.title IS '배너 메인 제목';
COMMENT ON COLUMN banners.subtitle IS '배너 부제목';
COMMENT ON COLUMN banners.description IS '배너 설명 텍스트';
COMMENT ON COLUMN banners.cta_text IS 'Call-to-Action 버튼 텍스트';
COMMENT ON COLUMN banners.cta_link IS 'CTA 버튼 클릭 시 이동할 링크';
COMMENT ON COLUMN banners.bg_color IS '배경 그라데이션 색상 (Tailwind CSS 클래스)';
COMMENT ON COLUMN banners.image_url IS '배너 배경 이미지 URL (Supabase Storage)';
COMMENT ON COLUMN banners.product_id IS '연결된 상품 ID';
COMMENT ON COLUMN banners.sort_order IS '표시 순서 (낮을수록 먼저 표시)';
COMMENT ON COLUMN banners.is_active IS '활성화 여부';

-- ============================================
-- 2. generated_images 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT,
  image_type TEXT DEFAULT 'product' CHECK (image_type IN ('product', 'banner')),
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_generated_images_product_id ON generated_images(product_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_image_type ON generated_images(image_type);
CREATE INDEX IF NOT EXISTS idx_generated_images_is_used ON generated_images(is_used);

-- 코멘트 추가
COMMENT ON TABLE generated_images IS 'AI로 생성된 이미지 보관 테이블';
COMMENT ON COLUMN generated_images.product_id IS '연결된 상품 ID';
COMMENT ON COLUMN generated_images.image_url IS '생성된 이미지 URL (Supabase Storage)';
COMMENT ON COLUMN generated_images.prompt IS '이미지 생성에 사용된 프롬프트';
COMMENT ON COLUMN generated_images.image_type IS '이미지 유형 (product: 상품 이미지, banner: 배너 이미지)';
COMMENT ON COLUMN generated_images.is_used IS '실제 사용 여부 (상품/배너에 적용되었는지)';

-- ============================================
-- 3. updated_at 자동 업데이트 트리거 (banners)
-- ============================================
CREATE OR REPLACE FUNCTION update_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_banners_updated_at();

-- ============================================
-- 4. RLS 비활성화 (개발 환경)
-- ============================================
-- 개발 환경에서는 RLS를 비활성화합니다.
-- 프로덕션 환경에서는 적절한 RLS 정책을 설정해야 합니다.
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images DISABLE ROW LEVEL SECURITY;

