import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartBadge from "@/components/cart-badge";

const Navbar = () => {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        모두쇼핑
      </Link>
      <div className="flex gap-4 items-center">
        <SignedIn>
          <CartBadge />
          <Link
            href="/mypage"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="마이페이지"
          >
            <User className="w-5 h-5" />
          </Link>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
