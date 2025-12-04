/**
 * @file components/cart-badge.tsx
 * @description 장바구니 배지 컴포넌트
 *
 * 네비게이션 바에 표시할 장바구니 아이콘과 아이템 개수 배지입니다.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCartItemCount } from "@/actions/cart";

/**
 * 장바구니 배지 컴포넌트
 */
export default function CartBadge() {
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCartCount() {
      try {
        const count = await getCartItemCount();
        setItemCount(count);
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCartCount();

    // 주기적으로 업데이트 (5초마다)
    const interval = setInterval(fetchCartCount, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
      aria-label="장바구니"
    >
      <ShoppingCart className="h-6 w-6" />
      {!isLoading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-600 rounded-full">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

