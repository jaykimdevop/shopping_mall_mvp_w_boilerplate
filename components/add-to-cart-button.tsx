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
        const result = await addToCart(product.id, quantity);
        if (result.success) {
          // 성공 시 장바구니 페이지로 이동하거나 토스트 메시지 표시
          alert(result.message || "장바구니에 추가되었습니다.");
          // 네비게이션 배지 업데이트를 위해 페이지 새로고침
          router.refresh();
        } else {
          // 로그인이 필요한 경우 리다이렉트
          if (result.message?.includes("로그인이 필요")) {
            router.push("/sign-in");
            return;
          }
          alert(result.message || "장바구니 추가에 실패했습니다.");
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        alert("장바구니 추가 중 오류가 발생했습니다.");
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

