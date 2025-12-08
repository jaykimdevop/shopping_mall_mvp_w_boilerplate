/**
 * @file types/banner.ts
 * @description 배너 및 AI 생성 이미지 관련 타입 정의
 */

// ============================================
// Banner Types
// ============================================

/**
 * 배너 기본 타입
 */
export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_text: string | null;
  cta_link: string | null;
  bg_color: string | null;
  image_url: string | null;
  product_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 배너 생성 입력 타입
 */
export interface CreateBannerInput {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  bg_color?: string | null;
  image_url?: string | null;
  product_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * 배너 수정 입력 타입
 */
export interface UpdateBannerInput {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  bg_color?: string | null;
  image_url?: string | null;
  product_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * 배너 + 상품 정보 (조인된 데이터)
 */
export interface BannerWithProduct extends Banner {
  product?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  } | null;
}

// ============================================
// Generated Image Types
// ============================================

/**
 * AI 생성 이미지 유형
 */
export type GeneratedImageType = 'product' | 'banner';

/**
 * AI 생성 이미지 기본 타입
 */
export interface GeneratedImage {
  id: string;
  product_id: string | null;
  image_url: string;
  prompt: string | null;
  image_type: GeneratedImageType;
  is_used: boolean;
  created_at: string;
}

/**
 * AI 이미지 생성 요청 타입
 */
export interface GenerateImageRequest {
  prompt: string;
  imageType: GeneratedImageType;
  productId?: string;
  /** 상품 정보 (프롬프트 자동 생성용) */
  productInfo?: {
    name: string;
    category?: string;
    description?: string;
  };
  /** 배너 정보 (프롬프트 자동 생성용) */
  bannerInfo?: {
    title: string;
    subtitle?: string;
  };
}

/**
 * AI 이미지 생성 결과 타입
 */
export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  generatedImageId?: string;
  error?: string;
}

// ============================================
// Default Prompts
// ============================================

/**
 * 상품 이미지 기본 프롬프트
 * - 흰색 배경
 * - 1024x1024px (1:1 정사각형)
 */
export const DEFAULT_PRODUCT_IMAGE_PROMPT = `전문적인 이커머스 상품 사진.

순수한 흰색 배경 (#FFFFFF).
깔끔하고 미니멀한 구도.
상품이 프레임 중앙에 배치.
부드럽고 균일한 조명, 은은한 그림자.
고해상도, 선명한 초점.
텍스트나 워터마크 없음.
정사각형 1:1 비율.`;

/**
 * 배너 이미지 기본 프롬프트
 * - 1792x1024px (16:9 가로형)
 */
export const DEFAULT_BANNER_IMAGE_PROMPT = `고품질 이커머스 프로모션 배너 배경 이미지.

IMPORTANT: NO TEXT, NO LETTERS, NO WORDS in the image.
절대로 이미지 안에 텍스트나 글자를 포함하지 마세요.

현대적이고 깔끔한 디자인.
상품이 오른쪽 또는 중앙에 배치됨.
왼쪽 1/3 공간은 비워두거나 단순한 그라데이션으로 처리.
부드러운 그라데이션 배경.
전문적인 조명과 그림자.
16:9 가로형 비율.
왼쪽 영역은 텍스트 오버레이를 위해 시각적으로 단순하게 유지.
생동감 있지만 과하지 않은 색상.
미니멀하고 세련된 느낌.`;

// ============================================
// Image Size Constants
// ============================================

/**
 * 이미지 크기 상수
 */
export const IMAGE_SIZES = {
  /** 상품 이미지: 1024x1024 (1:1) */
  PRODUCT: {
    width: 1024,
    height: 1024,
    aspectRatio: '1:1',
  },
  /** 배너 이미지: 1792x1024 (16:9) */
  BANNER: {
    width: 1792,
    height: 1024,
    aspectRatio: '16:9',
  },
} as const;

// ============================================
// Background Color Presets
// ============================================

/**
 * 배너 배경색 프리셋 (Tailwind CSS 그라데이션)
 */
export const BANNER_BG_COLOR_PRESETS = [
  {
    name: '다크 슬레이트',
    value: 'from-slate-900 via-slate-800 to-slate-900',
  },
  {
    name: '인디고 퍼플',
    value: 'from-indigo-900 via-purple-900 to-indigo-900',
  },
  {
    name: '로즈 핑크',
    value: 'from-rose-900 via-pink-900 to-rose-900',
  },
  {
    name: '에메랄드 그린',
    value: 'from-emerald-900 via-teal-900 to-emerald-900',
  },
  {
    name: '앰버 오렌지',
    value: 'from-amber-900 via-orange-900 to-amber-900',
  },
  {
    name: '스카이 블루',
    value: 'from-sky-900 via-blue-900 to-sky-900',
  },
  {
    name: '바이올렛',
    value: 'from-violet-900 via-purple-900 to-violet-900',
  },
  {
    name: '시안',
    value: 'from-cyan-900 via-teal-900 to-cyan-900',
  },
] as const;

export type BannerBgColorPreset = typeof BANNER_BG_COLOR_PRESETS[number];

