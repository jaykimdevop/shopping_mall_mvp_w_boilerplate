/**
 * @file components/checkout-content.tsx
 * @description 체크아웃 콘텐츠 컴포넌트 (Client Component)
 *
 * 회원/비회원에 따라 다른 체크아웃 플로우를 제공합니다.
 * 회원: DB 장바구니에서 주문 생성
 * 비회원: 로컬 스토리지 장바구니에서 주문 생성
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CheckoutForm from "@/components/checkout-form";
import GuestCheckoutForm from "@/components/guest-checkout-form";
import OrderSummary, { calculateTotal } from "@/components/order-summary";
import { getCartItems, getProductsByIds } from "@/actions/cart";
import { useGuestCart } from "@/hooks/use-guest-cart";
import type { CartItem, GuestCartItem } from "@/types/cart";
import type { Product } from "@/types/product";

/**
 * 체크아웃 콘텐츠 컴포넌트
 */
export default function CheckoutContent() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const {
    items: guestItems,
    isLoading: isGuestCartLoading,
    clearCart: clearGuestCart,
  } = useGuestCart();

  // 회원 장바구니 상태
  const [memberCartItems, setMemberCartItems] = useState<CartItem[]>([]);
  const [isMemberCartLoading, setIsMemberCartLoading] = useState(true);

  // 비회원 장바구니 상품 정보
  const [guestCartProducts, setGuestCartProducts] = useState<Product[]>([]);
  const [isGuestProductsLoading, setIsGuestProductsLoading] = useState(true);

  // 회원 장바구니 로드
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsMemberCartLoading(false);
      return;
    }

    async function loadMemberCart() {
      try {
        const items = await getCartItems();
        setMemberCartItems(items);
      } catch (error) {
        console.error("Failed to load member cart:", error);
      } finally {
        setIsMemberCartLoading(false);
      }
    }

    loadMemberCart();
  }, [isLoaded, isSignedIn]);

  // 비회원 장바구니 상품 정보 로드
  useEffect(() => {
    if (!isLoaded || isSignedIn || isGuestCartLoading) {
      setIsGuestProductsLoading(false);
      return;
    }

    if (guestItems.length === 0) {
      setIsGuestProductsLoading(false);
      return;
    }

    async function loadGuestProducts() {
      try {
        const productIds = guestItems.map((item) => item.product_id);
        const result = await getProductsByIds(productIds);
        if (result.success && result.products) {
          setGuestCartProducts(result.products as Product[]);
        }
      } catch (error) {
        console.error("Failed to load guest cart products:", error);
      } finally {
        setIsGuestProductsLoading(false);
      }
    }

    loadGuestProducts();
  }, [isLoaded, isSignedIn, isGuestCartLoading, guestItems]);

  // 비회원 장바구니 아이템에 상품 정보 추가
  const guestCartItemsWithProducts: GuestCartItem[] = guestItems.map((item) => ({
    ...item,
    product: guestCartProducts.find((p) => p.id === item.product_id),
  }));

  // 비회원 장바구니 총액 계산
  const guestTotalAmount = guestCartItemsWithProducts.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // 로딩 상태
  const isLoading =
    !isLoaded ||
    (isSignedIn && isMemberCartLoading) ||
    (!isSignedIn && (isGuestCartLoading || isGuestProductsLoading));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 비회원 체크아웃
  if (!isSignedIn) {
    // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
    if (guestItems.length === 0) {
      return (
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">장바구니가 비어있습니다</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            상품을 장바구니에 추가하고 다시 시도해주세요
          </p>
          <Link href="/products">
            <Button>상품 둘러보기</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽: 비회원 배송지 입력 폼 */}
        <div>
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              비회원 주문입니다. 주문 조회를 위해 이메일 또는 전화번호를 입력해주세요.
            </p>
          </div>
          <GuestCheckoutForm
            totalAmount={guestTotalAmount}
            guestCartItems={guestItems}
            onOrderComplete={() => {
              clearGuestCart();
              window.dispatchEvent(new CustomEvent("guestCartUpdated"));
            }}
          />
        </div>

        {/* 오른쪽: 주문 요약 */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <OrderSummary
            cartItems={[]}
            guestItems={guestCartItemsWithProducts}
            isGuest={true}
          />
        </div>
      </div>
    );
  }

  // 회원 체크아웃
  // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
  if (memberCartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">장바구니가 비어있습니다</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          상품을 장바구니에 추가하고 다시 시도해주세요
        </p>
        <Link href="/products">
          <Button>상품 둘러보기</Button>
        </Link>
      </div>
    );
  }

  // 총액 계산
  const memberTotalAmount = calculateTotal(memberCartItems);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 왼쪽: 배송지 입력 폼 */}
      <div>
        <CheckoutForm totalAmount={memberTotalAmount} />
      </div>

      {/* 오른쪽: 주문 요약 */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <OrderSummary cartItems={memberCartItems} />
      </div>
    </div>
  );
}

