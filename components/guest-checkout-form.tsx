/**
 * @file components/guest-checkout-form.tsx
 * @description 비회원 체크아웃 폼 컴포넌트
 *
 * 비회원 주문을 위한 폼입니다.
 * 배송지 정보 외에 이메일/전화번호 입력이 필수입니다.
 */

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  FormDescription,
} from "@/components/ui/form";
import { createOrder } from "@/actions/order";
import type { ShippingAddress, GuestCartItemInput } from "@/types/order";
import type { GuestCartItem } from "@/types/cart";

/**
 * 비회원 체크아웃 폼 스키마 (Zod)
 */
const guestCheckoutSchema = z.object({
  // 비회원 연락처 정보
  guestEmail: z
    .string()
    .email("유효한 이메일 주소를 입력해주세요.")
    .optional()
    .or(z.literal("")),
  guestPhone: z
    .string()
    .regex(
      /^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/,
      "올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)"
    )
    .optional()
    .or(z.literal("")),
  // 배송지 정보
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
}).refine(
  (data) => data.guestEmail || data.guestPhone,
  {
    message: "주문 조회를 위해 이메일 또는 전화번호 중 하나를 입력해주세요.",
    path: ["guestEmail"],
  }
);

type FormData = z.infer<typeof guestCheckoutSchema>;

interface GuestCheckoutFormProps {
  totalAmount: number;
  guestCartItems: GuestCartItem[];
  onOrderComplete?: () => void;
}

/**
 * 비회원 체크아웃 폼 컴포넌트
 */
export default function GuestCheckoutForm({
  totalAmount,
  guestCartItems,
  onOrderComplete,
}: GuestCheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      guestEmail: "",
      guestPhone: "",
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
        console.log("[GuestCheckoutForm] Submitting order:", data);

        const shippingAddress: ShippingAddress = {
          name: data.name,
          phone: data.phone,
          zipCode: data.zipCode,
          address: data.address,
          detailAddress: data.detailAddress || "",
        };

        // 비회원 장바구니 아이템 변환
        const guestCartItemInputs: GuestCartItemInput[] = guestCartItems.map(
          (item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })
        );

        const result = await createOrder({
          shippingAddress,
          orderNote: data.orderNote,
          expectedTotal: totalAmount,
          isGuest: true,
          guestEmail: data.guestEmail || undefined,
          guestPhone: data.guestPhone || undefined,
          guestCartItems: guestCartItemInputs,
        });

        console.log("[GuestCheckoutForm] Order result:", result);

        if (result.success && result.order) {
          // 로컬 스토리지 장바구니 비우기
          if (onOrderComplete) {
            onOrderComplete();
          }
          
          toast.success("주문이 완료되었습니다!");
          
          // 주문 완료 페이지로 이동 (비회원용)
          router.push(`/orders/guest/complete?orderId=${result.order.id}`);
        } else {
          toast.error(result.message || "주문 처리 중 오류가 발생했습니다.");
        }
      } catch (error) {
        console.error("[GuestCheckoutForm] Error:", error);
        toast.error("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 비회원 연락처 정보 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">
            주문자 정보 (주문 조회용)
          </h3>

          {/* 이메일 */}
          <FormField
            control={form.control}
            name="guestEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  주문 조회 시 사용됩니다
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 주문자 전화번호 */}
          <FormField
            control={form.control}
            name="guestPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>주문자 전화번호</FormLabel>
                <FormControl>
                  <Input
                    placeholder="010-1234-5678"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  주문 조회 시 사용됩니다 (이메일 미입력 시 필수)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

