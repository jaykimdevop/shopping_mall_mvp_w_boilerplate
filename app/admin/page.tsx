import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
  type RecentOrder,
  type LowStockProduct,
} from "@/actions/admin/dashboard";

/**
 * @file admin/page.tsx
 * @description 관리자 대시보드 메인 페이지
 *
 * Supabase DB에서 실제 데이터를 가져와 표시합니다.
 * - 통계 카드: 총 주문수, 매출, 상품수, 회원수
 * - 최근 주문 목록 위젯
 * - 재고 부족 상품 알림 위젯
 */

export default async function AdminDashboardPage() {
  // 서버에서 데이터 fetch
  const [stats, recentOrders, lowStockProducts] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
    getLowStockProducts(10),
  ]);

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
          value={formatNumber(stats.totalOrders)}
          description="전체 주문 수"
          icon={ShoppingCart}
          iconColor="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />

        {/* 총 매출 */}
        <StatCard
          title="총 매출"
          value={formatCurrency(stats.totalRevenue)}
          description="전체 매출액"
          icon={DollarSign}
          iconColor="text-green-500"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />

        {/* 총 상품 */}
        <StatCard
          title="총 상품"
          value={formatNumber(stats.totalProducts)}
          description="활성 상품 수"
          icon={Package}
          iconColor="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />

        {/* 총 회원 */}
        <StatCard
          title="총 회원"
          value={formatNumber(stats.totalUsers)}
          description="가입 회원 수"
          icon={Users}
          iconColor="text-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* 알림/빠른 액세스 섹션 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 최근 주문 */}
        <RecentOrdersWidget orders={recentOrders} />

        {/* 재고 부족 알림 */}
        <LowStockWidget products={lowStockProducts} />
      </div>
    </div>
  );
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

function formatCurrency(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================================
// 통계 카드 컴포넌트
// ============================================================================

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

// ============================================================================
// 최근 주문 위젯
// ============================================================================

const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "대기중",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  confirmed: {
    label: "확인됨",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  shipped: {
    label: "배송중",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  delivered: {
    label: "배송완료",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  cancelled: {
    label: "취소됨",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

function RecentOrdersWidget({ orders }: { orders: RecentOrder[] }) {
  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          최근 주문
        </h3>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          전체보기
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <TrendingUp className="h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">아직 주문이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
              label: order.status,
              className: "bg-gray-100 text-gray-800",
            };

            return (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.className}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {order.customer_name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 재고 부족 위젯
// ============================================================================

function LowStockWidget({ products }: { products: LowStockProduct[] }) {
  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          재고 부족 알림
        </h3>
        <Link
          href="/admin/products"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          상품관리
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">재고 부족 상품이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const isOutOfStock = product.stock_quantity === 0;

            return (
              <div
                key={product.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.category || "미분류"} · {formatCurrency(product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      isOutOfStock
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {isOutOfStock ? "품절" : `${product.stock_quantity}개`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
