/**
 * @file components/hero-slider.tsx
 * @description Coloshop 스타일 히어로 슬라이더
 *
 * 주요 기능:
 * - DB에서 활성화된 배너 동적 로드
 * - 전체 너비 배경 이미지 또는 그라데이션
 * - 오버레이 텍스트 + CTA 버튼
 * - 자동 슬라이드 (embla-carousel)
 * - 다크모드 지원
 * - 배너가 없을 경우 기본 슬라이드 표시
 */

import { getActiveBanners } from "@/actions/admin/banner";
import HeroSliderClient from "./hero-slider-client";
import type { BannerWithProduct } from "@/types/banner";

// 기본 슬라이드 (DB에 배너가 없을 때 사용)
const defaultSlides = [
  {
    id: "default-1",
    title: "최대 30% 할인",
    subtitle: "2024 신상품 컬렉션",
    description: "새로운 시즌을 위한 특별한 상품들을 만나보세요",
    cta_text: "지금 쇼핑하기",
    cta_link: "/products",
    bg_color: "from-slate-900 via-slate-800 to-slate-900",
    image_url: null,
    product_id: null,
    sort_order: 0,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    title: "무료 배송",
    subtitle: "5만원 이상 구매 시",
    description: "전 상품 무료 배송 이벤트 진행 중",
    cta_text: "상품 보기",
    cta_link: "/products",
    bg_color: "from-indigo-900 via-purple-900 to-indigo-900",
    image_url: null,
    product_id: null,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "default-3",
    title: "베스트셀러",
    subtitle: "인기 상품 모음",
    description: "가장 많이 사랑받는 상품들을 확인하세요",
    cta_text: "베스트 보기",
    cta_link: "/products?sort=popular",
    bg_color: "from-rose-900 via-pink-900 to-rose-900",
    image_url: null,
    product_id: null,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
] as BannerWithProduct[];

export default async function HeroSlider() {
  let banners: BannerWithProduct[] = [];

  try {
    banners = await getActiveBanners();
  } catch (error) {
    console.error("[HeroSlider] Error fetching banners:", error);
  }

  // 배너가 없으면 기본 슬라이드 사용
  const slides = banners.length > 0 ? banners : defaultSlides;

  return <HeroSliderClient slides={slides} />;
}
