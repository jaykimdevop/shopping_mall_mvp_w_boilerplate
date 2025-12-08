import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Image,
  Users,
  Truck,
  Store,
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

/**
 * @file admin/layout.tsx
 * @description 관리자 전용 레이아웃
 *
 * 관리자 페이지를 위한 사이드바 네비게이션과 헤더를 제공합니다.
 * 기존 Navbar/Footer 대신 관리자 전용 UI를 사용합니다.
 *
 * 서버 컴포넌트에서 currentUser()를 사용하여 publicMetadata.role을 확인합니다.
 * 관리자가 아닌 경우 홈으로 리다이렉트합니다.
 */

export const metadata: Metadata = {
  title: {
    default: "관리자",
    template: "%s | 관리자 - 모두쇼핑",
  },
  description: "모두쇼핑 관리자 대시보드",
  robots: {
    index: false,
    follow: false,
  },
};

// 사이드바 메뉴 항목
const sidebarMenuItems = [
  {
    href: "/admin",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "상품 관리",
    icon: Package,
  },
  {
    href: "/admin/orders",
    label: "주문 관리",
    icon: ShoppingCart,
  },
  {
    href: "/admin/banners",
    label: "배너 관리",
    icon: Image,
  },
  {
    href: "/admin/users",
    label: "회원 관리",
    icon: Users,
  },
  {
    href: "/admin/shipping",
    label: "배송 관리",
    icon: Truck,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 서버에서 현재 사용자 정보 조회
  const user = await currentUser();

  // 사용자가 없거나 관리자가 아닌 경우 홈으로 리다이렉트
  if (!user) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const userRole = user.publicMetadata?.role as string | undefined;
  if (userRole !== "admin") {
    redirect("/?unauthorized=admin");
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 사이드바 */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#1e1e27] text-white">
        {/* 로고 영역 */}
        <div className="flex h-16 items-center justify-center border-b border-gray-700">
          <Link href="/admin" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-[#00A2FF]" />
            <span className="text-lg font-bold">모두쇼핑 관리자</span>
          </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {sidebarMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 하단 영역: 사용자 정보 + 테마 토글 + 쇼핑몰 바로가기 */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700 p-4 space-y-4">
          {/* 사용자 프로필 */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-800/50">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName || user.username || "관리자"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.emailAddresses[0]?.emailAddress || ""}
              </p>
            </div>
          </div>

          {/* 테마 토글 */}
          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-gray-400">테마</span>
            <ThemeToggle forceLightIcon />
          </div>

          {/* 쇼핑몰 바로가기 */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#00A2FF] px-4 py-2 text-white transition-colors hover:bg-[#0090e0]"
          >
            <Store className="h-4 w-4" />
            <span>쇼핑몰 바로가기</span>
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="ml-64 flex flex-1 flex-col">
        {/* 페이지 콘텐츠 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

