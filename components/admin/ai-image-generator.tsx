/**
 * @file components/admin/ai-image-generator.tsx
 * @description AI 이미지 생성 공통 UI 컴포넌트
 *
 * 주요 기능:
 * - 프롬프트 입력 (기본값 제공)
 * - AI 이미지 생성 버튼
 * - 생성된 이미지 미리보기
 * - 이전에 생성한 이미지 갤러리
 * - 이미지 선택/확정 기능
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Sparkles, RefreshCw, Check, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  generateProductImageAction,
  generateBannerImageAction,
  getGeneratedImagesByProduct,
  deleteGeneratedImage,
} from "@/actions/admin/ai-image";
import {
  DEFAULT_PRODUCT_IMAGE_PROMPT,
  DEFAULT_BANNER_IMAGE_PROMPT,
  type GeneratedImage,
  type GeneratedImageType,
} from "@/types/banner";

// ============================================
// Types
// ============================================

interface AIImageGeneratorProps {
  /** 이미지 유형 */
  imageType: GeneratedImageType;
  /** 상품 ID (이미지 연결용) */
  productId?: string;
  /** 상품 정보 (프롬프트 자동 생성용) */
  productInfo?: {
    name: string;
    category?: string;
    description?: string;
  };
  /** 배너 정보 (프롬프트 자동 생성용) */
  bannerInfo?: {
    title: string;
    subtitle?: string;
  };
  /** 현재 선택된 이미지 URL */
  currentImageUrl?: string | null;
  /** 이미지 선택 시 콜백 */
  onImageSelect: (imageUrl: string) => void;
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
}

// ============================================
// Component
// ============================================

export default function AIImageGenerator({
  imageType,
  productId,
  productInfo,
  bannerInfo,
  currentImageUrl,
  onImageSelect,
  disabled = false,
}: AIImageGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [previousImages, setPreviousImages] = useState<GeneratedImage[]>([]);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);

  // 기본 프롬프트
  const defaultPrompt =
    imageType === "product" ? DEFAULT_PRODUCT_IMAGE_PROMPT : DEFAULT_BANNER_IMAGE_PROMPT;

  // 이전 생성 이미지 로드
  useEffect(() => {
    if (isOpen && productId) {
      loadPreviousImages();
    }
  }, [isOpen, productId]);

  const loadPreviousImages = async () => {
    if (!productId) return;

    setIsLoadingPrevious(true);
    try {
      const images = await getGeneratedImagesByProduct(productId, imageType);
      setPreviousImages(images);
    } catch (error) {
      console.error("Error loading previous images:", error);
    } finally {
      setIsLoadingPrevious(false);
    }
  };

  // 이미지 생성
  const handleGenerate = async () => {
    if (imageType === "product" && !productInfo?.name) {
      toast.error("상품명을 먼저 입력해주세요.");
      return;
    }

    if (imageType === "banner" && !bannerInfo?.title) {
      toast.error("배너 제목을 먼저 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      let result;

      if (imageType === "product") {
        result = await generateProductImageAction(
          productInfo!.name,
          productId,
          {
            category: productInfo?.category,
            description: productInfo?.description,
            customPrompt: customPrompt || undefined,
          }
        );
      } else {
        result = await generateBannerImageAction(
          bannerInfo!.title,
          productId,
          {
            subtitle: bannerInfo?.subtitle,
            productName: productInfo?.name,
            customPrompt: customPrompt || undefined,
          }
        );
      }

      if (result.success && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        toast.success("이미지가 생성되었습니다!");

        // 이전 이미지 목록 새로고침
        if (productId) {
          loadPreviousImages();
        }
      } else {
        toast.error(result.error || "이미지 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 이미지 선택 확정
  const handleConfirmImage = (imageUrl: string) => {
    onImageSelect(imageUrl);
    setIsOpen(false);
    toast.success("이미지가 선택되었습니다.");
  };

  // 이미지 삭제
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    try {
      const success = await deleteGeneratedImage(imageId);
      if (success) {
        setPreviousImages((prev) => prev.filter((img) => img.id !== imageId));
        toast.success("이미지가 삭제되었습니다.");
      } else {
        toast.error("이미지 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={disabled}
        >
          <Sparkles className="w-4 h-4" />
          AI로 이미지 생성
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI 이미지 생성
          </DialogTitle>
          <DialogDescription>
            {imageType === "product"
              ? "상품 정보를 기반으로 깔끔한 상품 이미지를 생성합니다."
              : "프로모션 정보를 기반으로 배너 이미지를 생성합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 프롬프트 입력 */}
          <div className="space-y-2">
            <Label htmlFor="prompt">프롬프트 (기본값 적용됨)</Label>
            <div className="text-xs text-muted-foreground mb-2 p-3 bg-muted rounded-md whitespace-pre-line">
              {defaultPrompt}
              {imageType === "product" && productInfo && (
                <>
                  {"\n\n"}상품명: {productInfo.name}
                  {productInfo.category && `\n카테고리: ${productInfo.category}`}
                </>
              )}
              {imageType === "banner" && bannerInfo && (
                <>
                  {"\n\n"}프로모션 제목: {bannerInfo.title}
                  {bannerInfo.subtitle && `\n부제목: ${bannerInfo.subtitle}`}
                </>
              )}
            </div>
            <Textarea
              id="prompt"
              placeholder="추가 지시사항을 입력하세요 (선택사항)&#10;예: 따뜻한 조명, 고급스러운 느낌..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* 생성 버튼 */}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                이미지 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI로 이미지 생성하기
              </>
            )}
          </Button>

          {/* 생성된 이미지 미리보기 */}
          {generatedImageUrl && (
            <div className="space-y-3">
              <Label>생성된 이미지</Label>
              <div className="relative aspect-square max-w-md mx-auto bg-muted rounded-lg overflow-hidden border">
                <Image
                  src={generatedImageUrl}
                  alt="Generated image"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  다시 생성
                </Button>
                <Button
                  type="button"
                  onClick={() => handleConfirmImage(generatedImageUrl)}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  이 이미지로 확정
                </Button>
              </div>
            </div>
          )}

          {/* 이전에 생성한 이미지 갤러리 */}
          {productId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>이전에 생성한 이미지</Label>
                {isLoadingPrevious && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {previousImages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {previousImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square bg-muted rounded-lg overflow-hidden border group cursor-pointer hover:border-primary transition-colors"
                    >
                      <Image
                        src={image.image_url}
                        alt="Previous generated image"
                        fill
                        className="object-cover"
                        sizes="100px"
                        onClick={() => handleConfirmImage(image.image_url)}
                      />
                      {/* 호버 시 액션 버튼 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="w-8 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmImage(image.image_url);
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="w-8 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* 현재 선택된 이미지 표시 */}
                      {currentImageUrl === image.image_url && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">이전에 생성한 이미지가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

