/**
 * @file components/Navbar.tsx
 * @description Coloshop 스타일 2단 네비게이션 바
 *
 * 구조:
 * - 상단 바: 프로모션 메시지, 언어/계정 드롭다운 (다크 배경)
 * - 메인 내비: 로고, 메뉴, 검색/사용자/장바구니 아이콘
 * - 모바일 햄버거 메뉴
 * - 관리자: 관리자 대시보드 버튼 (관리자만 표시)
 */

"use client";

import { useState } from "react";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Search, User, Menu, X, Package, ChevronDown, Globe, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartBadge from "@/components/cart-badge";
import ThemeToggle from "@/components/theme-toggle";
import { useAdmin } from "@/hooks/use-admin";

const navLinks = [
  { href: "/", label: "홈" },
  { href: "/products", label: "상품" },
  { href: "/products?category=전자기기", label: "전자기기" },
  { href: "/products?category=패션", label: "패션" },
  { href: "/products?category=가전", label: "가전" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, isLoaded } = useAdmin();

  return (
    <header className="fixed top-0 left-0 w-full bg-background z-50 trans-300">
      {/* 메인 네비게이션 */}
      <div className="bg-background shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-[80px]">
            {/* 로고 */}
            <Link href="/" className="text-xl sm:text-2xl font-bold text-foreground">
              모두<span className="text-primary">쇼핑</span>
            </Link>

            {/* 데스크톱 메뉴 */}
            <nav className="hidden lg:flex items-center">
              <ul className="flex items-center">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-5 py-2 text-sm font-medium uppercase text-foreground hover:text-colo-purple trans-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* 우측 아이콘 */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* 검색 */}
              <button
                className="p-2 text-foreground hover:text-colo-purple trans-300"
                aria-label="검색"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* 사용자 */}
              <SignedIn>
                <Link
                  href="/mypage"
                  className="p-2 text-foreground hover:text-colo-purple trans-300"
                  title="마이페이지"
                >
                  <User className="w-5 h-5" />
                </Link>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/orders/guest"
                  className="p-2 text-foreground hover:text-colo-purple trans-300"
                  title="비회원 주문조회"
                >
                  <Package className="w-5 h-5" />
                </Link>
              </SignedOut>

              {/* 장바구니 */}
              <CartBadge />

              {/* 테마 토글 */}
              <ThemeToggle />

              {/* 언어 선택 */}
              <div className="relative group hidden sm:block">
                <button
                  className="p-2 text-foreground hover:text-primary trans-300"
                  aria-label="언어 선택"
                >
                  <Globe className="w-5 h-5" />
                </button>
                <ul className="absolute right-0 top-full mt-1 w-28 bg-background border border-border shadow-lg rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible trans-300 z-10">
                  <li>
                    <span className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-muted trans-300 cursor-pointer rounded-t">
                      한국어
                    </span>
                  </li>
                  <li>
                    <span className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-muted trans-300 cursor-pointer">
                      English
                    </span>
                  </li>
                  <li>
                    <span className="block px-4 py-2 text-sm text-foreground hover:text-primary hover:bg-muted trans-300 cursor-pointer rounded-b">
                      日本語
                    </span>
                  </li>
                </ul>
              </div>

              {/* 관리자 대시보드 버튼 (관리자만 표시) */}
              {isLoaded && isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#1e1e27] hover:bg-[#2a2a35] rounded-md trans-300"
                  title="관리자 대시보드"
                >
                  <Settings className="w-4 h-4" />
                  <span>관리자</span>
                </Link>
              )}

              {/* Clerk 사용자 버튼 */}
              <SignedIn>
                <div className="ml-2">
                  <UserButton />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm" className="ml-2 hidden sm:inline-flex">
                    로그인
                  </Button>
                </SignInButton>
              </SignedOut>

              {/* 모바일 햄버거 메뉴 */}
              <button
                className="lg:hidden p-2 ml-2 text-foreground hover:text-colo-purple trans-300"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="메뉴 열기"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden trans-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* 모바일 메뉴 사이드바 */}
      <div
        className={`fixed top-0 right-0 w-[300px] sm:w-[400px] h-full bg-background/95 backdrop-blur-sm z-50 trans-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-6 right-4 p-2 text-foreground hover:text-colo-purple trans-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="메뉴 닫기"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 모바일 메뉴 내용 */}
        <div className="pt-20 px-6 text-right">
          {/* 언어 선택 */}
          <div className="border-b border-colo-purple py-4">
            <p className="text-sm font-medium uppercase mb-2">언어</p>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground hover:text-foreground trans-300 cursor-pointer">
                한국어
              </span>
              <span className="text-sm text-muted-foreground hover:text-foreground trans-300 cursor-pointer">
                English
              </span>
            </div>
          </div>

          {/* 계정 */}
          <div className="border-b border-colo-purple py-4">
            <p className="text-sm font-medium uppercase mb-2">계정</p>
            <SignedOut>
              <div className="flex flex-col gap-1">
                <SignInButton mode="modal">
                  <span className="text-sm text-muted-foreground hover:text-foreground trans-300 cursor-pointer">
                    로그인
                  </span>
                </SignInButton>
                <Link
                  href="/orders/guest"
                  className="text-sm text-muted-foreground hover:text-foreground trans-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  비회원 주문조회
                </Link>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex flex-col gap-1">
                <Link
                  href="/mypage"
                  className="text-sm text-muted-foreground hover:text-foreground trans-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  마이페이지
                </Link>
                <Link
                  href="/mypage/orders"
                  className="text-sm text-muted-foreground hover:text-foreground trans-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  주문내역
                </Link>
                {/* 관리자 대시보드 링크 (관리자만 표시) */}
                {isLoaded && isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm text-primary font-medium hover:text-primary/80 trans-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    관리자 대시보드
                  </Link>
                )}
              </div>
            </SignedIn>
          </div>

          {/* 메뉴 링크 */}
          <nav className="py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-sm font-medium uppercase text-foreground hover:text-colo-purple trans-300 border-b border-colo-purple"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
