/**
 * @file components/sort-selector.tsx
 * @description Coloshop 스타일 정렬 선택 컴포넌트
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface SortSelectorProps {
  currentSort: string;
  category?: string;
}

const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "price-asc", label: "낮은 가격순" },
  { value: "price-desc", label: "높은 가격순" },
  { value: "name", label: "이름순" },
];

export default function SortSelector({ currentSort, category }: SortSelectorProps) {
  const router = useRouter();

  const buildUrl = (sortValue: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (sortValue !== "newest") params.set("sort", sortValue);
    const queryString = params.toString();
    return `/products${queryString ? `?${queryString}` : ""}`;
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(buildUrl(e.target.value));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        정렬:
      </span>
      <select
        className="sm:hidden px-3 py-2 text-sm border border-border rounded bg-background text-foreground"
        defaultValue={currentSort}
        onChange={handleSelectChange}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="hidden sm:flex gap-1">
        {sortOptions.map((option) => (
          <Link
            key={option.value}
            href={buildUrl(option.value)}
            className={`px-3 py-1.5 text-xs font-medium border rounded trans-300 ${
              currentSort === option.value
                ? "bg-primary text-white border-primary"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

