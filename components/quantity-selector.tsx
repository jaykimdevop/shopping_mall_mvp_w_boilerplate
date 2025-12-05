/**
 * @file components/quantity-selector.tsx
 * @description Coloshop 스타일 수량 선택 컴포넌트
 *
 * 상품 상세 페이지에서 사용할 수량 선택 UI입니다.
 */

"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  min?: number;
  max: number;
  initialValue?: number;
  onChange?: (quantity: number) => void;
  disabled?: boolean;
}

/**
 * 수량 선택 컴포넌트
 */
export default function QuantitySelector({
  min = 1,
  max,
  initialValue = 1,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialValue);

  const handleDecrease = () => {
    if (quantity > min && !disabled) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (quantity < max && !disabled) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max && !disabled) {
      setQuantity(value);
      onChange?.(value);
    }
  };

  return (
    <div className="inline-flex items-center border border-border rounded overflow-hidden">
      {/* 감소 버튼 */}
      <button
        type="button"
        onClick={handleDecrease}
        disabled={quantity <= min || disabled}
        className="w-10 h-10 flex items-center justify-center bg-background hover:bg-muted text-foreground trans-300 disabled:opacity-50 disabled:cursor-not-allowed border-r border-border"
        aria-label="수량 감소"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* 수량 입력 */}
      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-14 h-10 text-center bg-background text-foreground text-sm font-medium focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="수량"
      />

      {/* 증가 버튼 */}
      <button
        type="button"
        onClick={handleIncrease}
        disabled={quantity >= max || disabled}
        className="w-10 h-10 flex items-center justify-center bg-background hover:bg-muted text-foreground trans-300 disabled:opacity-50 disabled:cursor-not-allowed border-l border-border"
        aria-label="수량 증가"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
