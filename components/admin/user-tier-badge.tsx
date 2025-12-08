/**
 * @file components/admin/user-tier-badge.tsx
 * @description 회원 등급 배지 컴포넌트
 *
 * 회원의 등급(일반/VIP)을 시각적으로 표시하는 배지 컴포넌트입니다.
 */

import { Badge } from "@/components/ui/badge";
import { Crown, UserCircle } from "lucide-react";
import type { UserTier } from "@/types/user";
import { USER_TIER_LABELS } from "@/types/user";

interface UserTierBadgeProps {
  tier: UserTier;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export function UserTierBadge({
  tier,
  showIcon = true,
  size = "default",
}: UserTierBadgeProps) {
  const isVip = tier === "vip";

  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <Badge
      variant={isVip ? "default" : "outline"}
      className={`${textSize} ${
        isVip
          ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
          : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {showIcon && (
        isVip ? (
          <Crown className={`${iconSize} mr-1`} />
        ) : (
          <UserCircle className={`${iconSize} mr-1`} />
        )
      )}
      {USER_TIER_LABELS[tier]}
    </Badge>
  );
}

