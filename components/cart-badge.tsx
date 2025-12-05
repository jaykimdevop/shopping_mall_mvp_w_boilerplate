/**
 * @file components/cart-badge.tsx
 * @description 장바구니 배지 컴포넌트
 *
 * 네비게이션 바에 표시할 장바구니 아이콘과 아이템 개수 배지입니다.
 * 회원/비회원 장바구니 모두 지원합니다.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { getCartItemCount } from "@/actions/cart";
import { useGuestCart } from "@/hooks/use-guest-cart";

/**
 * 장바구니 배지 컴포넌트
 * 회원: Server Action으로 DB에서 조회
 * 비회원: 로컬 스토리지에서 조회
 */
export default function CartBadge() {
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const { totalItems: guestCartItems, isLoading: isGuestCartLoading } = useGuestCart();

  // 클라이언트 마운트 확인 (Hydration 불일치 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 회원 장바구니 개수 조회
  const fetchMemberCartCount = useCallback(async () => {
    try {
      const count = await getCartItemCount();
      setItemCount(count);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 비회원 장바구니 업데이트 이벤트 핸들러
  const handleGuestCartUpdate = useCallback(() => {
    if (!isSignedIn) {
      setItemCount(guestCartItems);
    }
  }, [isSignedIn, guestCartItems]);

  useEffect(() => {
    // 클라이언트 마운트 및 Clerk 로딩 완료 대기
    if (!isMounted || !isLoaded) {
      return;
    }

    if (isSignedIn) {
      // 회원인 경우 서버에서 조회
      fetchMemberCartCount();

      // 주기적으로 업데이트 (5초마다)
      const interval = setInterval(fetchMemberCartCount, 5000);
      return () => clearInterval(interval);
    } else {
      // 비회원인 경우 로컬 스토리지에서 조회
      setIsLoading(isGuestCartLoading);
      setItemCount(guestCartItems);
    }
  }, [isMounted, isLoaded, isSignedIn, guestCartItems, isGuestCartLoading, fetchMemberCartCount]);

  // 비회원 장바구니 업데이트 이벤트 리스너
  useEffect(() => {
    if (!isMounted) return;
    
    window.addEventListener("guestCartUpdated", handleGuestCartUpdate);
    return () => {
      window.removeEventListener("guestCartUpdated", handleGuestCartUpdate);
    };
  }, [isMounted, handleGuestCartUpdate]);

  // 배지 숫자는 클라이언트에서만 렌더링 (Hydration 불일치 방지)
  const showBadge = isMounted && !isLoading && itemCount > 0;

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
      aria-label="장바구니"
      data-testid="cart-badge"
    >
      <ShoppingCart className="h-6 w-6" />
      {showBadge && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-600 rounded-full">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

