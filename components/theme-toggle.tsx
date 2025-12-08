/**
 * @file components/theme-toggle.tsx
 * @description 다크모드 토글 버튼 컴포넌트
 *
 * 라이트/다크 모드를 전환하는 버튼입니다.
 */

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  /** 항상 밝은 색상의 아이콘을 표시 (어두운 배경에서 사용 시) */
  forceLightIcon?: boolean;
}

export default function ThemeToggle({ forceLightIcon = false }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 실행
  useEffect(() => {
    setMounted(true);
    // 로컬 스토리지에서 테마 확인
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // 아이콘 색상 클래스 결정
  const iconColorClass = forceLightIcon 
    ? "text-gray-300 hover:text-white" 
    : "text-foreground hover:text-colo-purple";

  const bgHoverClass = forceLightIcon
    ? "hover:bg-gray-700"
    : "hover:bg-muted";

  // 마운트 전에는 렌더링하지 않음 (hydration mismatch 방지)
  if (!mounted) {
    return (
      <button
        className={`p-2 ${iconColorClass} trans-300 rounded-full`}
        aria-label="테마 변경"
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 ${iconColorClass} trans-300 rounded-full ${bgHoverClass}`}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

