/**
 * @file components/guest-cart-item.tsx
 * @description 비회원 장바구니 아이템 컴포넌트
 *
 * 비회원 장바구니의 개별 아이템을 표시합니다.
 * 로컬 스토리지에서 관리되는 아이템입니다.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantitySelector from "@/components/quantity-selector";
import type { GuestCartItem as GuestCartItemType } from "@/types/cart";

interface GuestCartItemProps {
  item: GuestCartItemType;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

/**
 * 비회원 장바구니 아이템 컴포넌트
 */
export default function GuestCartItem({
  item,
  onQuantityChange,
  onRemove,
}: GuestCartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const product = item.product;

  // 상품 정보가 없는 경우 (삭제된 상품 등)
  if (!product) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="w-full sm:w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            상품 정보를 불러올 수 없습니다
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-fit text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => onRemove(item.product_id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            삭제
          </Button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange(item.product_id, newQuantity);
  };

  const handleRemove = () => {
    setIsRemoving(true);
    onRemove(item.product_id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {/* 상품 이미지 */}
      <Link
        href={`/products/${product.id}`}
        className="w-full sm:w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden"
      >
        <Package className="w-8 h-8 text-gray-400" />
      </Link>

      {/* 상품 정보 */}
      <div className="flex-1 flex flex-col">
        <Link
          href={`/products/${product.id}`}
          className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
          {product.category || "카테고리 없음"}
        </p>

        <p className="text-lg font-bold text-primary mt-2">
          {formatPrice(product.price)}
        </p>

        {/* 재고 부족 경고 */}
        {product.stock_quantity < item.quantity && (
          <p className="text-sm text-red-500 mt-1">
            재고 부족 (현재 재고: {product.stock_quantity}개)
          </p>
        )}
      </div>

      {/* 수량 조절 및 삭제 */}
      <div className="flex flex-col items-end gap-2">
        <QuantitySelector
          min={1}
          max={product.stock_quantity}
          initialValue={item.quantity}
          onChange={handleQuantityChange}
          disabled={isRemoving}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            소계: {formatPrice(product.price * item.quantity)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

