/**
 * @file components/guest-order-lookup.tsx
 * @description 비회원 주문 조회 폼 컴포넌트
 *
 * 비회원이 주문 번호와 이메일/전화번호로 주문을 조회할 수 있는 폼입니다.
 */

"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { getGuestOrder } from "@/actions/order";
import OrderDetail from "@/components/order-detail";
import type { Order } from "@/types/order";

// 이메일로 조회 스키마
const emailLookupSchema = z.object({
  orderId: z.string().min(1, "주문 번호를 입력해주세요."),
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
});

// 전화번호로 조회 스키마
const phoneLookupSchema = z.object({
  orderId: z.string().min(1, "주문 번호를 입력해주세요."),
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(
      /^\d{2,3}-\d{3,4}-\d{4}$/,
      "유효한 전화번호 형식이 아닙니다. (예: 010-1234-5678)"
    ),
});

type EmailLookupFormValues = z.infer<typeof emailLookupSchema>;
type PhoneLookupFormValues = z.infer<typeof phoneLookupSchema>;

/**
 * 비회원 주문 조회 폼 컴포넌트
 */
export default function GuestOrderLookup() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lookupMethod, setLookupMethod] = useState<"email" | "phone">("email");

  // 이메일 조회 폼
  const emailForm = useForm<EmailLookupFormValues>({
    resolver: zodResolver(emailLookupSchema),
    defaultValues: {
      orderId: "",
      email: "",
    },
  });

  // 전화번호 조회 폼
  const phoneForm = useForm<PhoneLookupFormValues>({
    resolver: zodResolver(phoneLookupSchema),
    defaultValues: {
      orderId: "",
      phone: "",
    },
  });

  // 이메일로 주문 조회
  const handleEmailLookup = (values: EmailLookupFormValues) => {
    startTransition(async () => {
      const result = await getGuestOrder({
        orderId: values.orderId,
        email: values.email,
      });

      if (result.success && result.order) {
        setOrder(result.order);
        toast.success("주문을 찾았습니다.");
      } else {
        toast.error(result.message || "주문을 찾을 수 없습니다.");
        setOrder(null);
      }
    });
  };

  // 전화번호로 주문 조회
  const handlePhoneLookup = (values: PhoneLookupFormValues) => {
    startTransition(async () => {
      const result = await getGuestOrder({
        orderId: values.orderId,
        phone: values.phone,
      });

      if (result.success && result.order) {
        setOrder(result.order);
        toast.success("주문을 찾았습니다.");
      } else {
        toast.error(result.message || "주문을 찾을 수 없습니다.");
        setOrder(null);
      }
    });
  };

  // 초기화
  const handleReset = () => {
    setOrder(null);
    emailForm.reset();
    phoneForm.reset();
  };

  // 주문을 찾은 경우 주문 상세 표시
  if (order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">주문 상세</h2>
          <Button variant="outline" onClick={handleReset}>
            다른 주문 조회
          </Button>
        </div>
        <OrderDetail order={order} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">비회원 주문 조회</h2>
        <p className="text-gray-600 dark:text-gray-400">
          주문 번호와 이메일 또는 전화번호로 주문을 조회하세요
        </p>
      </div>

      <Tabs
        value={lookupMethod}
        onValueChange={(v) => setLookupMethod(v as "email" | "phone")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">이메일로 조회</TabsTrigger>
          <TabsTrigger value="phone">전화번호로 조회</TabsTrigger>
        </TabsList>

        {/* 이메일로 조회 */}
        <TabsContent value="email">
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(handleEmailLookup)}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주문 번호</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="주문 번호를 입력하세요"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      주문 완료 시 안내된 주문 번호를 입력하세요
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="email"
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
                      주문 시 입력한 이메일 주소를 입력하세요
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  "조회 중..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    주문 조회
                  </>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* 전화번호로 조회 */}
        <TabsContent value="phone">
          <Form {...phoneForm}>
            <form
              onSubmit={phoneForm.handleSubmit(handlePhoneLookup)}
              className="space-y-4"
            >
              <FormField
                control={phoneForm.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주문 번호</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="주문 번호를 입력하세요"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      주문 완료 시 안내된 주문 번호를 입력하세요
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="010-1234-5678"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      주문 시 입력한 전화번호를 입력하세요
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  "조회 중..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    주문 조회
                  </>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

