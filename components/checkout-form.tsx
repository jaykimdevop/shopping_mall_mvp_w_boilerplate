/**
 * @file components/checkout-form.tsx
 * @description 체크아웃 배송지/메모 입력 폼 컴포넌트
 *
 * react-hook-form + Zod를 사용하여 폼 검증을 수행합니다.
 * 주문 완료 시 createOrder Server Action을 호출합니다.
 */

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createOrder } from "@/actions/order";
import type { ShippingAddress } from "@/types/order";

/**
 * 배송지 정보 스키마 (Zod)
 */
const shippingAddressSchema = z.object({
  name: z
    .string()
    .min(1, "수령인 이름을 입력해주세요.")
    .max(50, "이름은 50자 이내로 입력해주세요."),
  phone: z
    .string()
    .min(1, "연락처를 입력해주세요.")
    .regex(
      /^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/,
      "올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)"
    ),
  zipCode: z
    .string()
    .min(1, "우편번호를 입력해주세요.")
    .regex(/^[0-9]{5}$/, "5자리 우편번호를 입력해주세요."),
  address: z
    .string()
    .min(1, "기본 주소를 입력해주세요.")
    .max(200, "주소는 200자 이내로 입력해주세요."),
  detailAddress: z
    .string()
    .max(100, "상세 주소는 100자 이내로 입력해주세요.")
    .default(""),
  orderNote: z
    .string()
    .max(500, "배송 메모는 500자 이내로 입력해주세요.")
    .optional(),
});

type FormData = z.infer<typeof shippingAddressSchema>;

interface CheckoutFormProps {
  totalAmount: number;
  onSuccess?: (orderId: string) => void;
}

/**
 * 체크아웃 폼 컴포넌트
 */
export default function CheckoutForm({ totalAmount, onSuccess }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      name: "",
      phone: "",
      zipCode: "",
      address: "",
      detailAddress: "",
      orderNote: "",
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        console.log("[CheckoutForm] Submitting order:", data);

        const shippingAddress: ShippingAddress = {
          name: data.name,
          phone: data.phone,
          zipCode: data.zipCode,
          address: data.address,
          detailAddress: data.detailAddress || "",
        };

        const result = await createOrder({
          shippingAddress,
          orderNote: data.orderNote,
          expectedTotal: totalAmount,
        });

        console.log("[CheckoutForm] Order result:", result);

        if (result.success && result.order) {
          if (onSuccess) {
            onSuccess(result.order.id);
          } else {
            router.push(`/orders/${result.order.id}/complete`);
          }
        } else {
          // 에러 메시지 표시
          alert(result.message || "주문 처리 중 오류가 발생했습니다.");
          
          if (result.requiresAuth) {
            router.push("/sign-in");
          }
        }
      } catch (error) {
        console.error("[CheckoutForm] Error:", error);
        alert("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 배송지 정보 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
            배송지 정보
          </h3>

          {/* 수령인 이름 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  수령인 <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="수령인 이름을 입력하세요"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 연락처 */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  연락처 <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="010-1234-5678"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 우편번호 */}
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  우편번호 <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="12345"
                    maxLength={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 기본 주소 */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  기본 주소 <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="기본 주소를 입력하세요"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 상세 주소 */}
          <FormField
            control={form.control}
            name="detailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세 주소</FormLabel>
                <FormControl>
                  <Input
                    placeholder="상세 주소를 입력하세요 (동/호수 등)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 배송 메모 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
            배송 메모
          </h3>

          <FormField
            control={form.control}
            name="orderNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>요청 사항</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="배송 시 요청사항을 입력해주세요 (선택)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              주문 처리 중...
            </>
          ) : (
            `${totalAmount.toLocaleString()}원 결제하기`
          )}
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          주문 버튼을 클릭하면 이용약관에 동의한 것으로 간주됩니다.
        </p>
      </form>
    </Form>
  );
}

