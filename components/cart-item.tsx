/**
 * @file components/cart-item.tsx
 * @description 장바구니 아이템 컴포넌트
 *
 * 장바구니 페이지에서 개별 아이템을 표시하는 컴포넌트입니다.
 * 수량 변경 및 삭제 기능을 포함합니다.
 */

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantitySelector from "@/components/quantity-selector";
import {
  updateCartItemQuantity,
  removeCartItem,
} from "@/actions/cart";
import type { CartItem } from "@/types/cart";

interface CartItemProps {
  cartItem: CartItem;
  onUpdate?: () => void;
}

/**
 * 가격을 천 단위 콤마로 포맷팅
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

/**
 * 장바구니 아이템 컴포넌트
 */
export default function CartItemComponent({
  cartItem,
  onUpdate,
}: CartItemProps) {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(cartItem.quantity);

  const product = cartItem.product;
  const itemTotal = product.price * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    startTransition(async () => {
      const result = await updateCartItemQuantity(cartItem.id, newQuantity);
      if (result.success) {
        onUpdate?.();
      } else {
        // 실패 시 원래 수량으로 복원
        setQuantity(cartItem.quantity);
        alert(result.message || "수량 변경에 실패했습니다.");
      }
    });
  };

  const handleRemove = () => {
    if (!confirm("장바구니에서 제거하시겠습니까?")) {
      return;
    }

    startTransition(async () => {
      const result = await removeCartItem(cartItem.id);
      if (result.success) {
        onUpdate?.();
      } else {
        alert(result.message || "삭제에 실패했습니다.");
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {/* 상품 이미지 */}
      <Link
        href={`/products/${product.id}`}
        className="relative w-full sm:w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0"
      >
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </Link>

      {/* 상품 정보 */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Link
            href={`/products/${product.id}`}
            className="block mb-2 hover:text-primary transition-colors"
          >
            <h3 className="font-semibold text-lg">{product.name}</h3>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            단가: {formatPrice(product.price)}
          </p>
          <div className="text-lg font-bold text-primary">
            {formatPrice(itemTotal)}
          </div>
        </div>

        {/* 수량 선택 및 삭제 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              수량:
            </span>
            <QuantitySelector
              min={1}
              max={product.stock_quantity}
              initialValue={quantity}
              onChange={handleQuantityChange}
              disabled={isPending}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="장바구니에서 제거"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

