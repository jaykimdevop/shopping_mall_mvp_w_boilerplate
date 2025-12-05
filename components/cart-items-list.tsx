/**
 * @file components/cart-items-list.tsx
 * @description 장바구니 아이템 목록 컴포넌트 (Client Component)
 *
 * 장바구니 아이템 목록을 표시하고 실시간 업데이트를 지원합니다.
 * 회원/비회원 장바구니 모두 지원합니다.
 */

"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CartItem from "@/components/cart-item";
import GuestCartItem from "@/components/guest-cart-item";
import CartSummary from "@/components/cart-summary";
import { getCartItems, getProductsByIds } from "@/actions/cart";
import { useGuestCart } from "@/hooks/use-guest-cart";
import type { CartItem as CartItemType, GuestCartItem as GuestCartItemType } from "@/types/cart";
import type { Product } from "@/types/product";

/**
 * 장바구니 아이템 목록 컴포넌트
 * 회원: Server Action으로 DB에서 조회
 * 비회원: 로컬 스토리지에서 조회
 */
export default function CartItemsList() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [guestCartProducts, setGuestCartProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const {
    items: guestItems,
    isLoading: isGuestCartLoading,
    updateQuantity: updateGuestQuantity,
    removeItem: removeGuestItem,
    clearCart: clearGuestCart,
  } = useGuestCart();

  // 회원 장바구니 새로고침
  const refreshCart = useCallback(() => {
    startTransition(async () => {
      const items = await getCartItems();
      setCartItems(items);
      router.refresh(); // 네비게이션 배지도 업데이트
    });
  }, [router]);

  // 비회원 장바구니 상품 정보 조회
  const loadGuestCartProducts = useCallback(async () => {
    if (guestItems.length === 0) {
      setGuestCartProducts([]);
      return;
    }

    const productIds = guestItems.map((item) => item.product_id);
    const result = await getProductsByIds(productIds);
    if (result.success && result.products) {
      setGuestCartProducts(result.products as Product[]);
    }
  }, [guestItems]);

  // 회원 장바구니 로드
  useEffect(() => {
    if (!isLoaded) return;

    async function loadCartItems() {
      try {
        if (isSignedIn) {
          const items = await getCartItems();
          setCartItems(items);
        }
      } catch (error) {
        console.error("Failed to load cart items:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isSignedIn) {
      loadCartItems();
    } else {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // 비회원 장바구니 상품 정보 로드
  useEffect(() => {
    if (!isLoaded || isSignedIn || isGuestCartLoading) return;
    loadGuestCartProducts();
  }, [isLoaded, isSignedIn, isGuestCartLoading, guestItems, loadGuestCartProducts]);

  // 비회원 장바구니 아이템에 상품 정보 추가
  const guestCartItemsWithProducts: GuestCartItemType[] = guestItems.map((item) => ({
    ...item,
    product: guestCartProducts.find((p) => p.id === item.product_id),
  }));

  // 비회원 장바구니 수량 변경 핸들러
  const handleGuestQuantityChange = (productId: string, quantity: number) => {
    updateGuestQuantity(productId, quantity);
    window.dispatchEvent(new CustomEvent("guestCartUpdated"));
  };

  // 비회원 장바구니 삭제 핸들러
  const handleGuestRemove = (productId: string) => {
    removeGuestItem(productId);
    window.dispatchEvent(new CustomEvent("guestCartUpdated"));
  };

  // 로딩 상태
  const showLoading = isLoading || !isLoaded || (isSignedIn === false && isGuestCartLoading);

  if (showLoading) {
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

  // 비회원 장바구니
  if (!isSignedIn) {
    if (guestItems.length === 0) {
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

    // 비회원 장바구니 총액 계산
    const guestTotalPrice = guestCartItemsWithProducts.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 비회원 장바구니 아이템 목록 */}
        <div className="lg:col-span-2">
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              비회원 장바구니입니다. 로그인하시면 장바구니가 자동으로 동기화됩니다.
            </p>
          </div>
          <div className="space-y-4">
            {guestCartItemsWithProducts.map((item) => (
              <GuestCartItem
                key={item.product_id}
                item={item}
                onQuantityChange={handleGuestQuantityChange}
                onRemove={handleGuestRemove}
              />
            ))}
          </div>
        </div>

        {/* 장바구니 요약 */}
        <div className="lg:col-span-1">
          <CartSummary
            cartItems={[]}
            guestItems={guestCartItemsWithProducts}
            totalPrice={guestTotalPrice}
            isGuest={true}
          />
        </div>
      </div>
    );
  }

  // 회원 장바구니
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

