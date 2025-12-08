/**
 * @file components/hero-slider-client.tsx
 * @description 히어로 슬라이더 클라이언트 컴포넌트
 *
 * embla-carousel을 사용한 슬라이더 UI를 렌더링합니다.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BannerWithProduct } from "@/types/banner";

interface HeroSliderClientProps {
  slides: BannerWithProduct[];
}

export default function HeroSliderClient({ slides }: HeroSliderClientProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      watchDrag: false, // 드래그 비활성화
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
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

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full mt-[130px] py-8 sm:py-12">
      {/* 슬라이더 컨테이너 */}
      <div className="container mx-auto px-4">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex-[0_0_100%] min-w-0"
              >
                {/* 카드 형식 배너 */}
                <div className="relative h-[400px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  {/* 배경 이미지 또는 그라데이션 */}
                  {slide.image_url ? (
                    <div className="absolute inset-0">
                      <Image
                        src={slide.image_url}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                        priority={slides.indexOf(slide) === 0}
                      />
                      {/* 이미지 위 어두운 오버레이 */}
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg_color || "from-slate-900 via-slate-800 to-slate-900"}`}>
                      {/* 배경 패턴 오버레이 */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
                      </div>
                    </div>
                  )}

                  {/* 콘텐츠 */}
                  <div className="relative h-full flex items-center px-6 sm:px-12 lg:px-16 z-10">
                    <div className="w-full lg:w-1/2 text-white">
                      {slide.subtitle && (
                        <h6 className="text-xs sm:text-sm font-medium uppercase tracking-wider mb-3 sm:mb-4 text-white/90">
                          {slide.subtitle}
                        </h6>
                      )}
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-3 sm:mb-4">
                        {slide.title}
                      </h1>
                      {slide.description && (
                        <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-5 sm:mb-6 max-w-lg">
                          {slide.description}
                        </p>
                      )}
                      {slide.cta_link && slide.cta_text && (
                        <Link
                          href={slide.cta_link}
                          className="inline-block bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-6 sm:px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          {slide.cta_text}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 네비게이션 화살표 */}
      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 z-20"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 z-20"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* 도트 인디케이터 */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? "bg-white w-8 shadow-md"
                  : "bg-white/50 hover:bg-white/70 w-2"
              }`}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

