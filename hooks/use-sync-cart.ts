"use client";

/**
 * @file hooks/use-sync-cart.ts
 * @description 로그인 시 로컬 스토리지 장바구니를 서버로 동기화하는 훅
 *
 * 사용자가 로그인하면 비회원 장바구니(로컬 스토리지)를 
 * 회원 장바구니(DB)로 자동 동기화합니다.
 */

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { syncGuestCartToServer } from "@/actions/cart";
import {
  getFromStorage,
  removeFromStorage,
} from "@/lib/storage";
import {
  GUEST_CART_STORAGE_KEY,
  GUEST_SESSION_ID_KEY,
  type GuestCart,
} from "@/types/cart";

/**
 * 로그인 시 장바구니 동기화 훅
 */
export function useSyncCart() {
  const { isSignedIn, isLoaded } = useUser();
  const hasSynced = useRef(false);
  const previousSignedIn = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    // Clerk 로딩 완료 대기
    if (!isLoaded) {
      return;
    }

    // 로그인 상태 변경 감지 (로그아웃 → 로그인)
    const justSignedIn = previousSignedIn.current === false && isSignedIn === true;
    previousSignedIn.current = isSignedIn;

    // 로그인 상태가 아니거나, 이미 동기화했거나, 방금 로그인하지 않은 경우 스킵
    if (!isSignedIn || hasSynced.current) {
      return;
    }

    // 로컬 스토리지에서 비회원 장바구니 조회
    const guestCart = getFromStorage<GuestCart | null>(
      GUEST_CART_STORAGE_KEY,
      null
    );

    // 비회원 장바구니가 비어있으면 스킵
    if (!guestCart || guestCart.items.length === 0) {
      hasSynced.current = true;
      return;
    }

    // 동기화 실행
    async function syncCart() {
      try {
        console.log("[useSyncCart] Syncing guest cart to server:", guestCart?.items.length, "items");
        
        const result = await syncGuestCartToServer(guestCart!.items);
        
        if (result.success) {
          // 동기화 성공 시 로컬 스토리지 비우기
          removeFromStorage(GUEST_CART_STORAGE_KEY);
          
          // 세션 ID는 유지 (다음 로그아웃 시 새 장바구니를 위해)
          // removeFromStorage(GUEST_SESSION_ID_KEY);
          
          if (result.syncedItems && result.syncedItems > 0) {
            toast.success("장바구니가 동기화되었습니다", {
              description: `${result.syncedItems}개의 상품이 장바구니에 추가되었습니다.`,
            });
          }
          
          // 장바구니 배지 업데이트를 위해 이벤트 발생
          window.dispatchEvent(new CustomEvent("guestCartUpdated"));
        } else {
          console.error("[useSyncCart] Sync failed:", result.message);
          // 동기화 실패 시 로컬 스토리지는 유지
          toast.error("장바구니 동기화에 실패했습니다", {
            description: "나중에 다시 시도해주세요.",
          });
        }
      } catch (error) {
        console.error("[useSyncCart] Sync error:", error);
        toast.error("장바구니 동기화 중 오류가 발생했습니다");
      } finally {
        hasSynced.current = true;
      }
    }

    syncCart();
  }, [isLoaded, isSignedIn]);

  // 컴포넌트 언마운트 시 리셋 (다음 로그인을 위해)
  useEffect(() => {
    return () => {
      hasSynced.current = false;
    };
  }, []);
}

