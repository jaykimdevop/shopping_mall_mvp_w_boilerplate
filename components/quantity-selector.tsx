/**
 * @file components/quantity-selector.tsx
 * @description 수량 선택 컴포넌트
 *
 * 상품 상세 페이지에서 사용할 수량 선택 UI입니다.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        수량:
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={quantity <= min || disabled}
          className="h-9 w-9"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <input
          type="number"
          min={min}
          max={max}
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-16 h-9 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={quantity >= max || disabled}
          className="h-9 w-9"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        (최대 {max}개)
      </span>
    </div>
  );
}

