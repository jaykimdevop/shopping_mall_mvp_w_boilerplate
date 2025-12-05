/**
 * @file components/Footer.tsx
 * @description Coloshop 스타일 푸터 컴포넌트
 *
 * 주요 기능:
 * - 푸터 내비게이션 링크
 * - 소셜 미디어 아이콘
 * - 저작권 정보
 * - 다크모드 지원
 */

"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Heart } from "lucide-react";

const footerLinks = [
  { href: "/products", label: "상품" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "문의하기" },
];

const socialLinks = [
  { href: "#", icon: Facebook, label: "Facebook" },
  { href: "#", icon: Twitter, label: "Twitter" },
  { href: "#", icon: Instagram, label: "Instagram" },
  { href: "#", icon: Youtube, label: "Youtube" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4">
        {/* 상단 영역: 네비게이션 + 소셜 */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-8 gap-6">
          {/* 푸터 네비게이션 */}
          <nav className="flex items-center gap-6 sm:gap-10">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 소셜 아이콘 */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* 하단 영역: 저작권 */}
        <div className="border-t border-border py-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy;{currentYear} All Rights Reserved. Made with{" "}
            <Heart className="inline-block w-4 h-4 text-primary mx-1" /> by{" "}
            <span className="text-primary font-medium">모두쇼핑</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

