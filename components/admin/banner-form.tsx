/**
 * @file components/admin/banner-form.tsx
 * @description 배너 등록/수정 공통 폼 컴포넌트
 *
 * 주요 기능:
 * - 배너 기본 정보 입력 (제목, 부제목, 설명, CTA)
 * - 상품 선택 (검색/선택)
 * - AI 배너 이미지 생성
 * - 배경색 프리셋 선택
 * - 이미지 업로드
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, ImageIcon, Search } from "lucide-react";
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
import { toast } from "sonner";
import AIImageGenerator from "@/components/admin/ai-image-generator";
import {
  createBanner,
  updateBanner,
  uploadBannerImage,
  deleteBannerImage,
} from "@/actions/admin/banner";
import { getAdminProducts } from "@/actions/admin/product";
import type { BannerWithProduct } from "@/types/banner";
import type { Product } from "@/types/product";

// ============================================
// Constants
// ============================================

const BG_COLOR_PRESETS = [
  { name: "다크 슬레이트", value: "from-slate-900 via-slate-800 to-slate-900" },
  { name: "인디고 퍼플", value: "from-indigo-900 via-purple-900 to-indigo-900" },
  { name: "로즈 핑크", value: "from-rose-900 via-pink-900 to-rose-900" },
  { name: "에메랄드 그린", value: "from-emerald-900 via-teal-900 to-emerald-900" },
  { name: "앰버 오렌지", value: "from-amber-900 via-orange-900 to-amber-900" },
  { name: "스카이 블루", value: "from-sky-900 via-blue-900 to-sky-900" },
  { name: "바이올렛", value: "from-violet-900 via-purple-900 to-violet-900" },
  { name: "시안", value: "from-cyan-900 via-teal-900 to-cyan-900" },
];

// ============================================
// Schema
// ============================================

const bannerFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(100, "제목은 100자 이내로 입력해주세요."),
  subtitle: z.string().max(100, "부제목은 100자 이내로 입력해주세요.").optional(),
  description: z.string().max(500, "설명은 500자 이내로 입력해주세요.").optional(),
  cta_text: z.string().max(50, "버튼 텍스트는 50자 이내로 입력해주세요.").optional(),
  cta_link: z.string().max(200, "링크는 200자 이내로 입력해주세요.").optional(),
  bg_color: z.string().optional(),
  product_id: z.string().optional(),
  is_active: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerFormSchema>;

// ============================================
// Types
// ============================================

interface BannerFormProps {
  banner?: BannerWithProduct;
}

// ============================================
// Component
// ============================================

export default function BannerForm({ banner }: BannerFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(banner?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);

  // 상품 검색
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    banner?.product ? {
      id: banner.product.id,
      name: banner.product.name,
      price: banner.product.price,
      image_url: banner.product.image_url,
    } as Product : null
  );

  const isEditMode = !!banner;

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      description: banner?.description || "",
      cta_text: banner?.cta_text || "지금 쇼핑하기",
      cta_link: banner?.cta_link || "/products",
      bg_color: banner?.bg_color || BG_COLOR_PRESETS[0].value,
      product_id: banner?.product_id || undefined,
      is_active: banner?.is_active ?? true,
    },
  });

  // AI 이미지 생성을 위해 폼 값 감시
  const watchedTitle = useWatch({ control: form.control, name: "title" });
  const watchedSubtitle = useWatch({ control: form.control, name: "subtitle" });
  const watchedBgColor = useWatch({ control: form.control, name: "bg_color" });

  // 상품 검색
  useEffect(() => {
    const searchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const result = await getAdminProducts({
          search: productSearchQuery,
          limit: 10,
          status: "active",
        });
        setProducts(result.products);
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [productSearchQuery]);

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadBannerImage(formData);
      setImageUrl(result.url);
      toast.success("이미지가 업로드되었습니다.");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "이미지 업로드에 실패했습니다."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 이미지 삭제 핸들러
  const handleImageRemove = async () => {
    if (!imageUrl) return;

    try {
      await deleteBannerImage(imageUrl);
      setImageUrl(null);
      toast.success("이미지가 삭제되었습니다.");
    } catch (error) {
      console.error("Image delete error:", error);
      setImageUrl(null);
    }
  };

  // 상품 선택 핸들러
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    form.setValue("product_id", product.id);
    // CTA 링크 자동 설정
    form.setValue("cta_link", `/products/${product.id}`);
  };

  // 상품 선택 해제
  const handleProductDeselect = () => {
    setSelectedProduct(null);
    form.setValue("product_id", undefined);
    form.setValue("cta_link", "/products");
  };

  // 폼 제출 핸들러
  const onSubmit = async (values: BannerFormValues) => {
    setIsSubmitting(true);
    try {
      const bannerData = {
        title: values.title,
        subtitle: values.subtitle || null,
        description: values.description || null,
        cta_text: values.cta_text || null,
        cta_link: values.cta_link || null,
        bg_color: values.bg_color || null,
        image_url: imageUrl,
        product_id: values.product_id && values.product_id.trim() !== "" ? values.product_id : null,
        is_active: values.is_active,
      };

      if (isEditMode) {
        await updateBanner(banner.id, bannerData);
        toast.success("배너가 수정되었습니다.");
      } else {
        await createBanner(bannerData);
        toast.success("배너가 등록되었습니다.");
      }

      router.push("/admin/banners");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "배너 수정에 실패했습니다."
            : "배너 등록에 실패했습니다."
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
            {/* 기본 정보 */}
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                기본 정보
              </h3>

              {/* 제목 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>
                      제목 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="예: 최대 30% 할인" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 부제목 */}
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>부제목</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 2024 신상품 컬렉션" {...field} />
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
                    <FormLabel>설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="예: 새로운 시즌을 위한 특별한 상품들을 만나보세요"
                        className="min-h-20 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CTA 버튼 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cta_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>버튼 텍스트</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 지금 쇼핑하기" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cta_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>버튼 링크</FormLabel>
                      <FormControl>
                        <Input placeholder="예: /products" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 상품 연결 */}
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                연결 상품 (선택)
              </h3>

              {/* 선택된 상품 */}
              {selectedProduct ? (
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                  <div className="relative w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                    {selectedProduct.image_url ? (
                      <Image
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.price.toLocaleString()}원
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleProductDeselect}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 상품 검색 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="상품명으로 검색..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* 상품 목록 */}
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {isLoadingProducts ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                        검색 중...
                      </div>
                    ) : products.length > 0 ? (
                      <div className="divide-y">
                        {products.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleProductSelect(product)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <div className="relative w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.price.toLocaleString()}원
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        {productSearchQuery ? "검색 결과가 없습니다." : "상품을 검색해주세요."}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <FormDescription className="mt-2">
                배너와 연결할 상품을 선택하면 AI 이미지 생성 시 상품 정보가 반영됩니다.
              </FormDescription>
            </div>
          </div>

          {/* 오른쪽: 이미지 및 스타일 */}
          <div className="space-y-6">
            {/* 배너 이미지 */}
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                배너 이미지
              </h3>

              <div className="space-y-4">
                {/* 이미지 미리보기 */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt="배너 이미지"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : watchedBgColor ? (
                    <div className={`w-full h-full bg-gradient-to-r ${watchedBgColor} flex items-center justify-center`}>
                      <div className="text-white text-center p-4">
                        <p className="text-xs uppercase tracking-wider opacity-70">{watchedSubtitle || "부제목"}</p>
                        <p className="text-lg font-bold">{watchedTitle || "제목"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="mb-2 h-12 w-12" />
                      <span className="text-sm">이미지 없음</span>
                    </div>
                  )}
                </div>

                {/* 업로드 및 AI 생성 버튼 */}
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-image-upload"
                  />
                  <Label
                    htmlFor="banner-image-upload"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-[#00A2FF] hover:bg-[#00A2FF]/5 hover:text-[#00A2FF] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                      imageType="banner"
                      productId={selectedProduct?.id}
                      productInfo={selectedProduct ? {
                        name: selectedProduct.name,
                      } : undefined}
                      bannerInfo={{
                        title: watchedTitle || "",
                        subtitle: watchedSubtitle || undefined,
                      }}
                      currentImageUrl={imageUrl}
                      onImageSelect={(url) => setImageUrl(url)}
                      disabled={!watchedTitle}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 배경색 선택 */}
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                배경색 (이미지 없을 때)
              </h3>

              <FormField
                control={form.control}
                name="bg_color"
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="배경색 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BG_COLOR_PRESETS.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded bg-gradient-to-r ${preset.value}`} />
                              {preset.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      배너 이미지가 없을 때 표시될 배경 그라데이션입니다.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* 상태 설정 */}
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                표시 상태
              </h3>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel className="text-base">배너 활성화</FormLabel>
                      <FormDescription>
                        비활성화된 배너는 홈페이지에 표시되지 않습니다.
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
              "배너 수정"
            ) : (
              "배너 등록"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

