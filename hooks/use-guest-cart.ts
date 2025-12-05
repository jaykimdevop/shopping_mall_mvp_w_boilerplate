"use client";

/**
 * @file hooks/use-guest-cart.ts
 * @description 비회원 장바구니 관리 훅
 *
 * 로컬 스토리지를 사용하여 비회원 장바구니를 관리합니다.
 * 상품 추가, 수량 변경, 삭제, 장바구니 비우기 기능을 제공합니다.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getFromStorage,
  setToStorage,
  removeFromStorage,
  generateSessionId,
} from "@/lib/storage";
import {
  GUEST_CART_STORAGE_KEY,
  GUEST_SESSION_ID_KEY,
  type GuestCart,
  type GuestCartItem,
} from "@/types/cart";
import type { Product } from "@/types/product";

// 빈 장바구니 초기값
const EMPTY_CART: GuestCart = {
  items: [],
  updated_at: new Date().toISOString(),
};

/**
 * 비회원 장바구니 훅 반환 타입
 */
interface UseGuestCartReturn {
  /** 장바구니 아이템 목록 */
  items: GuestCartItem[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 세션 ID */
  sessionId: string | null;
  /** 장바구니에 상품 추가 */
  addItem: (productId: string, quantity: number) => void;
  /** 장바구니 아이템 수량 변경 */
  updateQuantity: (productId: string, quantity: number) => void;
  /** 장바구니에서 상품 삭제 */
  removeItem: (productId: string) => void;
  /** 장바구니 전체 비우기 */
  clearCart: () => void;
  /** 상품 정보와 함께 장바구니 아이템 반환 (상품 정보는 별도 조회 필요) */
  getItemsWithProducts: (products: Product[]) => GuestCartItem[];
  /** 장바구니 총 아이템 수 (수량 합계) */
  totalItems: number;
  /** 장바구니에 특정 상품이 있는지 확인 */
  hasItem: (productId: string) => boolean;
  /** 특정 상품의 수량 조회 */
  getItemQuantity: (productId: string) => number;
}

/**
 * 비회원 장바구니 관리 훅
 */
export function useGuestCart(): UseGuestCartReturn {
  const [cart, setCart] = useState<GuestCart>(EMPTY_CART);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기화: 로컬 스토리지에서 장바구니 로드
  useEffect(() => {
    const loadCart = () => {
      // 세션 ID 로드 또는 생성
      let storedSessionId = getFromStorage<string | null>(
        GUEST_SESSION_ID_KEY,
        null
      );
      if (!storedSessionId) {
        storedSessionId = generateSessionId();
        setToStorage(GUEST_SESSION_ID_KEY, storedSessionId);
      }
      setSessionId(storedSessionId);

      // 장바구니 로드
      const storedCart = getFromStorage<GuestCart>(
        GUEST_CART_STORAGE_KEY,
        EMPTY_CART
      );
      setCart(storedCart);
      setIsLoading(false);
    };

    loadCart();
  }, []);

  // 장바구니 저장 (상태 변경 시)
  const saveCart = useCallback((newCart: GuestCart) => {
    const updatedCart = {
      ...newCart,
      updated_at: new Date().toISOString(),
    };
    setCart(updatedCart);
    setToStorage(GUEST_CART_STORAGE_KEY, updatedCart);
  }, []);

  // 장바구니에 상품 추가
  const addItem = useCallback(
    (productId: string, quantity: number) => {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.items.findIndex(
          (item) => item.product_id === productId
        );

        let newItems: GuestCartItem[];

        if (existingItemIndex >= 0) {
          // 기존 아이템이 있으면 수량 증가
          newItems = prevCart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // 새 아이템 추가
          newItems = [
            ...prevCart.items,
            {
              product_id: productId,
              quantity,
              added_at: new Date().toISOString(),
            },
          ];
        }

        const newCart: GuestCart = {
          items: newItems,
          updated_at: new Date().toISOString(),
        };

        setToStorage(GUEST_CART_STORAGE_KEY, newCart);
        return newCart;
      });
    },
    []
  );

  // 장바구니 아이템 수량 변경
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        removeItem(productId);
        return;
      }

      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item
        );

        const newCart: GuestCart = {
          items: newItems,
          updated_at: new Date().toISOString(),
        };

        setToStorage(GUEST_CART_STORAGE_KEY, newCart);
        return newCart;
      });
    },
    []
  );

  // 장바구니에서 상품 삭제
  const removeItem = useCallback((productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) => item.product_id !== productId
      );

      const newCart: GuestCart = {
        items: newItems,
        updated_at: new Date().toISOString(),
      };

      setToStorage(GUEST_CART_STORAGE_KEY, newCart);
      return newCart;
    });
  }, []);

  // 장바구니 전체 비우기
  const clearCart = useCallback(() => {
    const emptyCart: GuestCart = {
      items: [],
      updated_at: new Date().toISOString(),
    };
    setCart(emptyCart);
    setToStorage(GUEST_CART_STORAGE_KEY, emptyCart);
  }, []);

  // 상품 정보와 함께 장바구니 아이템 반환
  const getItemsWithProducts = useCallback(
    (products: Product[]): GuestCartItem[] => {
      const productMap = new Map(products.map((p) => [p.id, p]));
      return cart.items.map((item) => ({
        ...item,
        product: productMap.get(item.product_id),
      }));
    },
    [cart.items]
  );

  // 장바구니 총 아이템 수
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // 장바구니에 특정 상품이 있는지 확인
  const hasItem = useCallback(
    (productId: string): boolean => {
      return cart.items.some((item) => item.product_id === productId);
    },
    [cart.items]
  );

  // 특정 상품의 수량 조회
  const getItemQuantity = useCallback(
    (productId: string): number => {
      const item = cart.items.find((item) => item.product_id === productId);
      return item?.quantity ?? 0;
    },
    [cart.items]
  );

  return {
    items: cart.items,
    isLoading,
    sessionId,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemsWithProducts,
    totalItems,
    hasItem,
    getItemQuantity,
  };
}

