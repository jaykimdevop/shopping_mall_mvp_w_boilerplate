import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 가격을 한국 원화 형식으로 포맷팅
 * @param price 가격 (숫자)
 * @returns 포맷팅된 가격 문자열 (예: ₩10,000)
 */
export function formatCurrency(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}
