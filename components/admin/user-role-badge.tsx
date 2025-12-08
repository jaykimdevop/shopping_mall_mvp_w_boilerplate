/**
 * @file components/admin/user-role-badge.tsx
 * @description 회원 역할 배지 컴포넌트
 *
 * 회원의 역할(관리자/일반)을 시각적으로 표시하는 배지 컴포넌트입니다.
 */

import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";
import type { UserRole } from "@/types/user";
import { USER_ROLE_LABELS } from "@/types/user";

interface UserRoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export function UserRoleBadge({
  role,
  showIcon = true,
  size = "default",
}: UserRoleBadgeProps) {
  const isAdmin = role === "admin";

  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <Badge
      variant={isAdmin ? "default" : "secondary"}
      className={`${textSize} ${
        isAdmin
          ? "bg-purple-600 hover:bg-purple-700 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      }`}
    >
      {showIcon && (
        isAdmin ? (
          <Shield className={`${iconSize} mr-1`} />
        ) : (
          <User className={`${iconSize} mr-1`} />
        )
      )}
      {USER_ROLE_LABELS[role]}
    </Badge>
  );
}

