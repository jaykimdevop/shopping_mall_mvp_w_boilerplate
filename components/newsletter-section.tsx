/**
 * @file components/newsletter-section.tsx
 * @description Coloshop 스타일 뉴스레터 구독 섹션
 *
 * 주요 기능:
 * - 이메일 입력 폼
 * - 배경색 구분
 * - 다크모드 지원
 */

"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // 실제 구현에서는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
    setEmail("");
  };

  return (
    <section className="bg-muted py-10 sm:py-14">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* 텍스트 */}
          <div className="text-center lg:text-left">
            <h4 className="text-xl sm:text-2xl font-semibold mb-2">뉴스레터</h4>
            <p className="text-sm sm:text-base text-muted-foreground">
              구독하시면 첫 구매 시 20% 할인 쿠폰을 드립니다
            </p>
          </div>

          {/* 폼 */}
          <div className="w-full lg:w-auto">
            {isSubmitted ? (
              <div className="flex items-center justify-center gap-2 text-colo-green">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">구독해 주셔서 감사합니다!</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력하세요"
                  required
                  className="w-full sm:w-[300px] h-12 bg-background border-none px-5 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-border focus:outline-none rounded-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto h-12 px-6 bg-primary hover:bg-colo-primary-hover text-white font-medium uppercase text-sm trans-300 disabled:opacity-50 rounded-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      구독하기
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

