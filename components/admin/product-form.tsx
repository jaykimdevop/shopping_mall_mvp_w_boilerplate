"use client";

/**
 * @file components/admin/product-form.tsx
 * @description 상품 등록/수정 공통 폼 컴포넌트
 *
 * react-hook-form + Zod를 사용한 유효성 검사 폼입니다.
 * 이미지 업로드, 미리보기 기능을 포함합니다.
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, Package } from "lucide-react";
import AIImageGenerator from "@/components/admin/ai-image-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
} from "@/actions/admin/product";
import type { Product } from "@/types/product";
import { toast } from "sonner";

// 폼 유효성 검사 스키마
const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "상품명을 입력해주세요.")
    .max(100, "상품명은 100자 이내로 입력해주세요."),
  description: z.string().max(2000, "설명은 2000자 이내로 입력해주세요.").optional(),
  price: z
    .number({ invalid_type_error: "가격을 입력해주세요." })
    .min(0, "가격은 0 이상이어야 합니다.")
    .max(100000000, "가격이 너무 큽니다."),
  category: z.string().optional(),
  stock_quantity: z
    .number({ invalid_type_error: "재고 수량을 입력해주세요." })
    .int("재고 수량은 정수여야 합니다.")
    .min(0, "재고 수량은 0 이상이어야 합니다."),
  is_active: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  categories?: string[];
}

export default function ProductForm({ product, categories = [] }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const isEditMode = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      category: product?.category || "",
      stock_quantity: product?.stock_quantity || 0,
      is_active: product?.is_active ?? true,
    },
  });

  // AI 이미지 생성을 위해 폼 값 감시
  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedCategory = useWatch({ control: form.control, name: "category" });
  const watchedDescription = useWatch({ control: form.control, name: "description" });

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadProductImage(formData);
      setImageUrl(result.url);
      toast.success("이미지가 업로드되었습니다.");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "이미지 업로드에 실패했습니다."
      );
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = async () => {
    if (!imageUrl) return;

    try {
      await deleteProductImage(imageUrl);
      setImageUrl(null);
      toast.success("이미지가 삭제되었습니다.");
    } catch (error) {
      console.error("Image delete error:", error);
      // 이미지 삭제 실패해도 UI에서는 제거
      setImageUrl(null);
    }
  };

  // 폼 제출 핸들러
  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateProduct(product.id, {
          name: values.name,
          description: values.description || null,
          price: values.price,
          category: values.category || null,
          stock_quantity: values.stock_quantity,
          is_active: values.is_active,
          image_url: imageUrl,
        });
        toast.success("상품이 수정되었습니다.");
      } else {
        await createProduct({
          name: values.name,
          description: values.description || null,
          price: values.price,
          category: values.category || null,
          stock_quantity: values.stock_quantity,
          is_active: values.is_active,
          image_url: imageUrl,
        });
        toast.success("상품이 등록되었습니다.");
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "상품 수정에 실패했습니다."
            : "상품 등록에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 왼쪽: 기본 정보 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                기본 정보
              </h3>

              {/* 상품명 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>
                      상품명 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="상품명을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 설명 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>상품 설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="상품에 대한 상세 설명을 입력하세요"
                        className="min-h-32 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>최대 2000자까지 입력 가능합니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 가격 */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>
                      가격 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          원
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 카테고리 */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>카테고리</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        value={field.value || "none"}
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="카테고리 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">선택 안함</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Input
                          placeholder="새 카테고리"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (newCategory.trim()) {
                              field.onChange(newCategory.trim());
                              setNewCategory("");
                            }
                          }}
                          disabled={!newCategory.trim()}
                        >
                          추가
                        </Button>
                      </div>
                    </div>
                    <FormDescription>
                      기존 카테고리를 선택하거나 새 카테고리를 입력하세요.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 재고 수량 */}
              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>재고 수량</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* 오른쪽: 이미지 및 상태 */}
          <div className="space-y-6">
            {/* 이미지 업로드 */}
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                상품 이미지
              </h3>

              <div className="space-y-4">
                {/* 이미지 미리보기 */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt="상품 이미지"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-gray-400">
                      <Package className="mb-2 h-12 w-12" />
                      <span className="text-sm">이미지 없음</span>
                    </div>
                  )}
                </div>

                {/* 업로드 버튼 및 AI 생성 버튼 */}
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-[#00A2FF] hover:bg-[#00A2FF]/5 hover:text-[#00A2FF] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-[#00A2FF]"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        이미지 업로드
                      </>
                    )}
                  </Label>

                  {/* AI 이미지 생성 버튼 */}
                  <div className="flex justify-center">
                    <AIImageGenerator
                      imageType="product"
                      productId={product?.id}
                      productInfo={{
                        name: watchedName || "",
                        category: watchedCategory || undefined,
                        description: watchedDescription || undefined,
                      }}
                      currentImageUrl={imageUrl}
                      onImageSelect={(url) => setImageUrl(url)}
                      disabled={!watchedName}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    JPEG, PNG, WebP, GIF (최대 5MB) 또는 AI로 생성
                  </p>
                </div>
              </div>
            </div>

            {/* 상태 설정 */}
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                판매 상태
              </h3>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel className="text-base">상품 활성화</FormLabel>
                      <FormDescription>
                        비활성화된 상품은 쇼핑몰에 표시되지 않습니다.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#00A2FF] hover:bg-[#0090e0]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "수정 중..." : "등록 중..."}
              </>
            ) : isEditMode ? (
              "상품 수정"
            ) : (
              "상품 등록"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

