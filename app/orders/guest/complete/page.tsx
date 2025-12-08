/**
 * @file app/orders/guest/complete/page.tsx
 * @description 비회원 주문 완료 페이지
 *
 * 비회원 주문이 완료되었을 때 표시되는 페이지입니다.
 * 주문 번호와 조회 방법을 안내합니다.
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderDetail from "@/components/order-detail";
import { getGuestOrder } from "@/actions/order";
import type { Order } from "@/types/order";

function GuestOrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        // 비회원 주문은 orderId만으로 조회 가능하도록 특별 처리
        // (방금 생성된 주문이므로 인증 없이 조회 허용)
        const result = await getGuestOrder({
          orderId: orderId!,
          // 방금 생성된 주문이므로 email/phone 없이 조회 시도
        });

        if (result.success && result.order) {
          setOrder(result.order);
        }
        // 주문을 찾지 못한 경우에도 기본 정보 표시
      } catch (err) {
        console.error("Failed to fetch order:", err);
        // 에러가 있어도 기본 완료 화면 표시
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="w-full max-w-3xl mx-auto">
        {/* 성공 아이콘 */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">주문이 완료되었습니다!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            주문해주셔서 감사합니다.
          </p>
        </div>

        {/* 주문 번호 안내 */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">주문 정보</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">주문 번호</span>
              <span className="font-mono font-semibold">{orderId}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>주문 조회 안내:</strong> 비회원 주문 조회 페이지에서 주문 번호와 
              주문 시 입력한 이메일 또는 전화번호로 주문 상태를 확인하실 수 있습니다.
            </p>
          </div>
        </div>

        {/* 주문 상세 (조회 성공 시) */}
        {order && (
          <div className="mb-8">
            <OrderDetail order={order} />
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/orders/guest">
            <Button variant="outline" className="w-full sm:w-auto">
              <Package className="w-4 h-4 mr-2" />
              주문 조회하기
            </Button>
          </Link>
          <Link href="/products">
            <Button className="w-full sm:w-auto">
              계속 쇼핑하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GuestOrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <GuestOrderCompleteContent />
    </Suspense>
  );
}

