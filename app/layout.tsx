import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Poppins, Geist_Mono } from "next/font/google";

import { ConditionalLayout } from "@/components/conditional-layout";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "모두쇼핑",
    template: "%s | 모두쇼핑",
  },
  description: "간편하고 빠른 온라인 쇼핑몰",
  keywords: ["쇼핑몰", "온라인 쇼핑", "의류", "패션"],
  authors: [{ name: "모두쇼핑" }],
  creator: "모두쇼핑",
  publisher: "모두쇼핑",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app"
  ),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "모두쇼핑",
    title: "모두쇼핑",
    description: "간편하고 빠른 온라인 쇼핑몰",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "모두쇼핑",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "모두쇼핑",
    description: "간편하고 빠른 온라인 쇼핑몰",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        // Tailwind CSS v4 호환성을 위한 설정
        cssLayerName: "clerk",
      }}
    >
      <html lang="ko">
        <body
          className={`${poppins.variable} ${geistMono.variable} antialiased`}
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          <SyncUserProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster />
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
