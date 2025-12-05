"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * @file conditional-layout.tsx
 * @description 경로에 따라 Navbar/Footer를 조건부로 렌더링하는 컴포넌트
 *
 * /admin 경로에서는 Navbar와 Footer를 숨깁니다.
 * 관리자 페이지는 자체 레이아웃(사이드바)을 사용합니다.
 */

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // 관리자 페이지: Navbar/Footer 없이 children만 렌더링
    return <>{children}</>;
  }

  // 일반 페이지: Navbar + children + Footer
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-80px)]">{children}</main>
      <Footer />
    </>
  );
}

