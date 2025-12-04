/**
 * @file components/cart-items-list.tsx
 * @description 장바구니 아이템 목록 컴포넌트 (Client Component)
 *
 * 장바구니 아이템 목록을 표시하고 실시간 업데이트를 지원합니다.
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CartItem from "@/components/cart-item";
import CartSummary from "@/components/cart-summary";
import { getCartItems } from "@/actions/cart";
import type { CartItem as CartItemType } from "@/types/cart";

/**
 * 장바구니 아이템 목록 컴포넌트
 */
export default function CartItemsList() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const refreshCart = () => {
    startTransition(async () => {
      const items = await getCartItems();
      setCartItems(items);
      router.refresh(); // 네비게이션 배지도 업데이트
    });
  };

  useEffect(() => {
    async function loadCartItems() {
      try {
        const items = await getCartItems();
        setCartItems(items);
      } catch (error) {
        console.error("Failed to load cart items:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCartItems();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 animate-pulse"
          >
            <div className="w-full sm:w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">장바구니가 비어있습니다</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          상품을 장바구니에 추가해보세요
        </p>
        <Link href="/products">
          <Button>상품 둘러보기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 장바구니 아이템 목록 */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} cartItem={item} onUpdate={refreshCart} />
          ))}
        </div>
      </div>

      {/* 장바구니 요약 */}
      <div className="lg:col-span-1">
        <CartSummary cartItems={cartItems} />
      </div>
    </div>
  );
}

