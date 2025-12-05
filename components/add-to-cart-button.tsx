/**
 * @file components/add-to-cart-button.tsx
 * @description Coloshop 스타일 장바구니 추가 버튼 컴포넌트
 *
 * 상품 상세 페이지에서 사용하는 장바구니 추가 버튼입니다.
 * 수량 선택과 장바구니 추가 기능을 통합합니다.
 * 회원/비회원 모두 지원합니다.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { ShoppingCart, Loader2 } from "lucide-react";
import QuantitySelector from "@/components/quantity-selector";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";
import { useGuestCart } from "@/hooks/use-guest-cart";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 * 회원: Server Action으로 DB에 저장
 * 비회원: 로컬 스토리지에 저장
 */
export default function AddToCartButton({
  product,
  disabled = false,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const { addItem: addToGuestCart } = useGuestCart();

  const handleAddToCart = () => {
    if (disabled || isPending) {
      return;
    }

    // 비회원인 경우 로컬 스토리지에 추가
    if (isLoaded && !isSignedIn) {
      // 재고 확인
      if (product.stock_quantity < quantity) {
        toast.error("재고가 부족합니다", {
          description: `현재 재고: ${product.stock_quantity}개`,
        });
        return;
      }

      addToGuestCart(product.id, quantity);
      toast.success("장바구니에 추가되었습니다", {
        description: `${product.name} ${quantity}개`,
      });
      // 비회원 장바구니 배지 업데이트를 위해 이벤트 발생
      window.dispatchEvent(new CustomEvent("guestCartUpdated"));
      return;
    }

    // 회원인 경우 Server Action 호출
    startTransition(async () => {
      try {
        console.log("[AddToCartButton] Calling addToCart:", {
          productId: product.id,
          quantity,
        });
        const result = await addToCart(product.id, quantity);
        console.log("[AddToCartButton] Result:", result);

        // result가 null이거나 undefined인 경우 처리
        if (!result) {
          console.error("[AddToCartButton] Result is null or undefined");
          toast.error("장바구니 추가에 실패했습니다", {
            description: "서버 응답이 없습니다.",
          });
          return;
        }

        // result가 객체가 아닌 경우 처리
        if (typeof result !== "object") {
          console.error("[AddToCartButton] Result is not an object:", result);
          toast.error("장바구니 추가에 실패했습니다", {
            description: "잘못된 서버 응답입니다.",
          });
          return;
        }

        if (result.success) {
          // 성공 시 네비게이션 배지 업데이트를 위해 페이지 새로고침
          router.refresh();
          // 성공 메시지 표시
          toast.success("장바구니에 추가되었습니다", {
            description: `${product.name} ${quantity}개`,
          });
        } else {
          console.error("[AddToCartButton] Failed:", result);

          // 로그인이 필요한 경우 비회원 장바구니에 추가
          if (
            result.requiresAuth ||
            result.message?.includes("로그인이 필요")
          ) {
            // 비회원 장바구니에 추가
            addToGuestCart(product.id, quantity);
            toast.success("장바구니에 추가되었습니다", {
              description: `${product.name} ${quantity}개 (비회원)`,
            });
            window.dispatchEvent(new CustomEvent("guestCartUpdated"));
            return;
          }

          // 에러 메시지 표시
          toast.error("장바구니 추가에 실패했습니다", {
            description: result.message || "알 수 없는 오류가 발생했습니다.",
          });
        }
      } catch (error) {
        console.error("[AddToCartButton] Error:", error);
        toast.error("장바구니 추가 중 오류가 발생했습니다", {
          description: "다시 시도해주세요.",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* 수량 선택 */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">수량:</span>
        <QuantitySelector
          min={1}
          max={product.stock_quantity}
          initialValue={quantity}
          onChange={setQuantity}
          disabled={disabled}
        />
      </div>

      {/* 장바구니 추가 버튼 */}
      <Button
        size="lg"
        className="w-full gap-2"
        disabled={disabled || isPending}
        onClick={handleAddToCart}
      >
        {disabled ? (
          "품절"
        ) : isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            추가 중...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            장바구니에 추가
          </>
        )}
      </Button>
    </div>
  );
}
