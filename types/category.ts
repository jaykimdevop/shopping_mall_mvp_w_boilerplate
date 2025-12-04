/**
 * @file types/category.ts
 * @description 카테고리 관련 TypeScript 타입 정의
 */

/**
 * 카테고리 정보
 */
export interface Category {
  name: string;
  code: string;
  count: number;
}

/**
 * 카테고리 코드를 한글 이름으로 매핑
 */
export const CATEGORY_NAMES: Record<string, string> = {
  electronics: "전자제품",
  clothing: "의류",
  books: "도서",
  food: "식품",
  sports: "스포츠",
  beauty: "뷰티",
  home: "생활/가정",
};

/**
 * 카테고리 코드를 한글 이름으로 변환
 */
export function getCategoryName(code: string | null): string {
  if (!code) return "전체";
  return CATEGORY_NAMES[code] || code;
}

/**
 * 카테고리 아이콘 (lucide-react 아이콘 이름)
 * 나중에 실제 아이콘 컴포넌트로 교체 가능
 */
export const CATEGORY_ICONS: Record<string, string> = {
  electronics: "Smartphone",
  clothing: "Shirt",
  books: "Book",
  food: "Utensils",
  sports: "Dumbbell",
  beauty: "Sparkles",
  home: "Home",
};

