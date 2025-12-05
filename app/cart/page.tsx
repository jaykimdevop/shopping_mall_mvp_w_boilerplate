/**
 * @file app/cart/page.tsx
 * @description Coloshop 스타일 장바구니 페이지
 *
 * 사용자의 장바구니 아이템을 조회하고 관리하는 페이지입니다.
 * 수량 변경, 삭제, 총액 표시 기능을 제공합니다.
 * 회원/비회원 모두 접근 가능합니다.
 */

import Link from "next/link";
import CartItemsList from "@/components/cart-items-list";

/**
 * 장바구니 페이지
 * 비회원도 접근 가능 (로컬 스토리지 장바구니 사용)
 */
export default async function CartPage() {
  return (
    <div className="min-h-screen mt-[130px]">
      {/* 페이지 헤더 - 히어로 스타일 */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            장바구니
          </h1>
          <p className="text-white/70 text-sm sm:text-base">
            장바구니에 담긴 상품을 확인하고 주문하세요
          </p>
        </div>
      </div>

      {/* 브레드크럼 */}
      <nav className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary trans-300">
              홈
            </Link>
            <span>/</span>
            <span className="text-foreground">장바구니</span>
          </div>
        </div>
      </nav>

      {/* 장바구니 내용 */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <CartItemsList />
      </div>
    </div>
  );
}
