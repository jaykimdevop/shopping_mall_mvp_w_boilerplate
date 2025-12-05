/**
 * @file components/deal-of-week.tsx
 * @description Coloshop 스타일 Deal of the Week 섹션
 *
 * 주요 기능:
 * - 좌우 분할 레이아웃
 * - 카운트다운 타이머
 * - CTA 버튼
 * - 다크모드 지원
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function DealOfWeek() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // 이번 주 일요일 자정까지 카운트다운
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);

      const difference = endOfWeek.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const timerItems = [
    { value: timeLeft.days, label: "일" },
    { value: timeLeft.hours, label: "시간" },
    { value: timeLeft.minutes, label: "분" },
    { value: timeLeft.seconds, label: "초" },
  ];

  return (
    <section className="bg-muted py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* 왼쪽: 이미지/아이콘 영역 */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
              {/* 장식 원 */}
              <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-full animate-spin-slow" />
              <div className="absolute inset-8 border-2 border-primary/20 rounded-full" />
              
              {/* 중앙 아이콘 */}
              <div className="relative z-10 text-center">
                <ShoppingBag className="w-20 h-20 sm:w-24 sm:h-24 text-primary mx-auto mb-4" />
                <p className="text-2xl sm:text-3xl font-bold text-primary">50% OFF</p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 콘텐츠 영역 */}
          <div className="text-center lg:text-right">
            {/* 섹션 타이틀 */}
            <div className="inline-block relative mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold">이번 주 특가</h2>
              <div className="absolute left-1/2 lg:left-auto lg:right-0 -translate-x-1/2 lg:translate-x-0 mt-3 w-16 h-1 bg-primary" />
            </div>

            {/* 타이머 */}
            <div className="flex items-center justify-center lg:justify-end gap-2 sm:gap-4 mb-8 sm:mb-10">
              {timerItems.map((item, index) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-background rounded-full shadow-md"
                >
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-primary">
                    {String(item.value).padStart(2, "0")}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA 버튼 */}
            <Link
              href="/products?sale=true"
              className="btn-colo-secondary inline-flex"
            >
              지금 쇼핑하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

