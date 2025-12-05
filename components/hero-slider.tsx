/**
 * @file components/hero-slider.tsx
 * @description Coloshop 스타일 히어로 슬라이더
 *
 * 주요 기능:
 * - 전체 너비 배경 이미지
 * - 오버레이 텍스트 + CTA 버튼
 * - 자동 슬라이드 (embla-carousel)
 * - 다크모드 지원
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  bgImage?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "최대 30% 할인",
    subtitle: "2024 신상품 컬렉션",
    description: "새로운 시즌을 위한 특별한 상품들을 만나보세요",
    ctaText: "지금 쇼핑하기",
    ctaLink: "/products",
    bgColor: "from-slate-900 via-slate-800 to-slate-900",
  },
  {
    id: 2,
    title: "무료 배송",
    subtitle: "5만원 이상 구매 시",
    description: "전 상품 무료 배송 이벤트 진행 중",
    ctaText: "상품 보기",
    ctaLink: "/products",
    bgColor: "from-indigo-900 via-purple-900 to-indigo-900",
  },
  {
    id: 3,
    title: "베스트셀러",
    subtitle: "인기 상품 모음",
    description: "가장 많이 사랑받는 상품들을 확인하세요",
    ctaText: "베스트 보기",
    ctaLink: "/products?sort=popular",
    bgColor: "from-rose-900 via-pink-900 to-rose-900",
  },
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full mt-[130px]">
      {/* 슬라이더 컨테이너 */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`flex-[0_0_100%] min-w-0 relative h-[500px] sm:h-[600px] lg:h-[700px] bg-gradient-to-r ${slide.bgColor}`}
            >
              {/* 배경 패턴 오버레이 */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
              </div>

              {/* 콘텐츠 */}
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="w-full lg:w-3/5 text-white">
                  <h6 className="text-sm sm:text-base font-medium uppercase tracking-wider mb-4 sm:mb-6 text-white/80">
                    {slide.subtitle}
                  </h6>
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg text-white/70 mb-6 sm:mb-8 max-w-lg">
                    {slide.description}
                  </p>
                  <Link
                    href={slide.ctaLink}
                    className="btn-colo-primary text-sm sm:text-base px-6 sm:px-8"
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 네비게이션 화살표 */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center trans-300"
        aria-label="이전 슬라이드"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center trans-300"
        aria-label="다음 슬라이드"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* 도트 인디케이터 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full trans-300 ${
              index === selectedIndex
                ? "bg-primary w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}

