import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

/**
 * @file admin/page.tsx
 * @description 관리자 대시보드 메인 페이지
 *
 * 주요 통계 카드와 빠른 액세스 링크를 제공합니다.
 * Phase 17에서 실제 데이터와 차트를 추가할 예정입니다.
 */

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* 페이지 제목 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          대시보드
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          쇼핑몰 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* 총 주문 */}
        <StatCard
          title="총 주문"
          value="-"
          description="전체 주문 수"
          icon={ShoppingCart}
          iconColor="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />

        {/* 총 매출 */}
        <StatCard
          title="총 매출"
          value="-"
          description="전체 매출액"
          icon={DollarSign}
          iconColor="text-green-500"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />

        {/* 총 상품 */}
        <StatCard
          title="총 상품"
          value="-"
          description="등록된 상품 수"
          icon={Package}
          iconColor="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />

        {/* 총 회원 */}
        <StatCard
          title="총 회원"
          value="-"
          description="가입 회원 수"
          icon={Users}
          iconColor="text-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* 알림/빠른 액세스 섹션 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 최근 주문 */}
        <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              최근 주문
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-4 flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Phase 17에서 구현 예정</p>
          </div>
        </div>

        {/* 재고 부족 알림 */}
        <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              재고 부족 알림
            </h3>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4 flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Phase 17에서 구현 예정</p>
          </div>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              관리자 대시보드 안내
            </h4>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              이 페이지는 Phase 16에서 기본 구조만 구현되었습니다. Phase 17에서
              실제 통계 데이터, 차트, 최근 주문 목록 등이 추가될 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  bgColor,
}: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

