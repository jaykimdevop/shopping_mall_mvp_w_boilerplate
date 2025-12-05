/**
 * @file components/add-to-cart-button.tsx
 * @description 장바구니 추가 버튼 컴포넌트
 *
 * 상품 상세 페이지에서 사용하는 장바구니 추가 버튼입니다.
 * 수량 선택과 장바구니 추가 기능을 통합합니다.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QuantitySelector from "@/components/quantity-selector";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
}

/**
 * 장바구니 추가 버튼 컴포넌트
 */
export default function AddToCartButton({
  product,
  disabled = false,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAddToCart = () => {
    if (disabled || isPending) {
      return;
    }

    startTransition(async () => {
      try {
        console.log("[AddToCartButton] Calling addToCart:", { productId: product.id, quantity });
        const result = await addToCart(product.id, quantity);
        console.log("[AddToCartButton] Result:", result);
        console.log("[AddToCartButton] Result type:", typeof result);
        console.log("[AddToCartButton] Result keys:", result ? Object.keys(result) : "null/undefined");
        
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
          console.error("[AddToCartButton] Failed - success:", result.success);
          console.error("[AddToCartButton] Failed - message:", result.message);
          console.error("[AddToCartButton] Failed - requiresAuth:", result.requiresAuth);

          // 로그인이 필요한 경우 리다이렉트
          if (result.requiresAuth || result.message?.includes("로그인이 필요")) {
            toast.error("로그인이 필요합니다", {
              description: "로그인 페이지로 이동합니다.",
            });
            router.push("/sign-in");
            return;
          }

          // 에러 메시지 표시
          toast.error("장바구니 추가에 실패했습니다", {
            description: result.message || "알 수 없는 오류가 발생했습니다.",
          });
        }
      } catch (error) {
        console.error("[AddToCartButton] Error:", error);
        console.error("[AddToCartButton] Error stack:", error instanceof Error ? error.stack : "No stack");
        toast.error("장바구니 추가 중 오류가 발생했습니다", {
          description: "다시 시도해주세요.",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* 수량 선택 */}
      <div>
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
        className="w-full"
        disabled={disabled || isPending}
        onClick={handleAddToCart}
      >
        {disabled
          ? "품절"
          : isPending
            ? "추가 중..."
            : "장바구니에 추가"}
      </Button>
    </div>
  );
}

