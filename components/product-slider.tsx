/**
 * @file components/product-slider.tsx
 * @description Coloshop 스타일 베스트셀러 상품 슬라이더
 *
 * 주요 기능:
 * - 상품 캐러셀
 * - 좌우 네비게이션 화살표
 * - 반응형 슬라이드 개수
 * - 다크모드 지원
 */

"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";

interface ProductSliderProps {
  title: string;
  products: Product[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

export default function ProductSlider({ title, products }: ProductSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* 섹션 타이틀 */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-block relative">
            <h2 className="text-3xl sm:text-4xl font-bold">{title}</h2>
            <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-16 h-1 bg-primary" />
          </div>
        </div>

        {/* 슬라이더 컨테이너 */}
        <div className="relative group">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] xl:flex-[0_0_20%] min-w-0 pl-4"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="block bg-background border border-border rounded-lg overflow-hidden product-card-hover group/card"
                  >
                    {/* 상품 이미지 */}
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover/card:scale-105 trans-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <svg
                            className="w-16 h-16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* 찜하기 아이콘 */}
                      <button
                        className="absolute top-3 right-3 w-8 h-8 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 trans-300 hover:bg-primary hover:text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          // 찜하기 기능 추가 예정
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>

                      {/* 배지 */}
                      {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                        <span className="product-badge product-badge-sale">
                          한정
                        </span>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="p-4 text-center">
                      <h6 className="font-medium text-sm line-clamp-2 mb-2 group-hover/card:text-colo-purple trans-300">
                        {product.name}
                      </h6>
                      <p className="text-primary font-semibold">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 네비게이션 화살표 */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-16 bg-muted-foreground/50 hover:bg-muted-foreground/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 trans-300 z-10"
            aria-label="이전 상품"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-16 bg-muted-foreground/50 hover:bg-muted-foreground/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 trans-300 z-10"
            aria-label="다음 상품"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

