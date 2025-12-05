/**
 * @file components/benefits-section.tsx
 * @description Coloshop 스타일 혜택 섹션 (4컬럼)
 *
 * 주요 기능:
 * - 4컬럼 아이콘 + 텍스트
 * - 반응형 레이아웃
 * - 다크모드 지원
 */

import { Truck, Wallet, RotateCcw, Clock } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "무료 배송",
    description: "5만원 이상 주문 시",
  },
  {
    icon: Wallet,
    title: "안전 결제",
    description: "100% 안전한 결제",
  },
  {
    icon: RotateCcw,
    title: "30일 반품",
    description: "무료 반품 서비스",
  },
  {
    icon: Clock,
    title: "연중무휴",
    description: "24시간 고객 지원",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-10 sm:py-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className={`flex items-center gap-4 p-4 sm:p-6 bg-muted ${
                  index < benefits.length - 1
                    ? "border-r border-background"
                    : ""
                } ${index < 2 ? "border-b lg:border-b-0 border-background" : ""}`}
              >
                <div className="flex-shrink-0">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div>
                  <h6 className="font-medium text-sm sm:text-base uppercase mb-0.5">
                    {benefit.title}
                  </h6>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

