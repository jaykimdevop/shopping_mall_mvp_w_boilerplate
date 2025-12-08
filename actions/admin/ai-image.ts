/**
 * @file actions/admin/ai-image.ts
 * @description AI 이미지 생성 Server Actions
 *
 * 주요 기능:
 * - 상품 이미지 AI 생성 (1024x1024, 1:1)
 * - 배너 이미지 AI 생성 (1792x1024, 16:9)
 * - 생성된 이미지 Supabase Storage 저장
 * - 생성된 이미지 기록 DB 저장 (재사용 가능)
 *
 * @dependencies
 * - @/lib/gemini: Gemini API 클라이언트
 * - @/lib/supabase/service-role: Supabase 서비스 롤 클라이언트
 */

"use server";

import { generateProductImage, generateBannerImage } from "@/lib/gemini";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  GeneratedImage,
  GeneratedImageType,
  GenerateImageResult,
} from "@/types/banner";

// ============================================
// Constants
// ============================================

const STORAGE_BUCKET = "uploads";
const GENERATED_IMAGES_FOLDER = "generated";

// ============================================
// Helper Functions
// ============================================

/**
 * Base64 이미지를 Supabase Storage에 업로드
 */
async function uploadBase64ImageToStorage(
  imageBase64: string,
  mimeType: string,
  imageType: GeneratedImageType,
  productId?: string
): Promise<string | null> {
  try {
    const supabase = getServiceRoleClient();

    // 파일 확장자 결정
    const extension = mimeType.includes("png") ? "png" : "jpg";

    // 고유한 파일명 생성
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const folder = productId ? `${GENERATED_IMAGES_FOLDER}/${productId}` : GENERATED_IMAGES_FOLDER;
    const fileName = `${folder}/${imageType}_${timestamp}_${randomId}.${extension}`;

    // Base64를 Buffer로 변환
    const buffer = Buffer.from(imageBase64, "base64");

    // Storage에 업로드
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("[AI Image] Storage upload error:", error);
      return null;
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    console.log("[AI Image] Image uploaded:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error("[AI Image] Error uploading image:", error);
    return null;
  }
}

/**
 * 생성된 이미지 정보를 DB에 저장
 */
async function saveGeneratedImageRecord(
  imageUrl: string,
  prompt: string,
  imageType: GeneratedImageType,
  productId?: string
): Promise<GeneratedImage | null> {
  try {
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("generated_images")
      .insert({
        product_id: productId || null,
        image_url: imageUrl,
        prompt: prompt,
        image_type: imageType,
        is_used: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[AI Image] DB insert error:", error);
      return null;
    }

    return data as GeneratedImage;
  } catch (error) {
    console.error("[AI Image] Error saving record:", error);
    return null;
  }
}

// ============================================
// Server Actions
// ============================================

/**
 * 상품 이미지 AI 생성
 *
 * @param productName - 상품명
 * @param productId - 상품 ID (선택, 이미지 연결용)
 * @param options - 추가 옵션
 * @returns 생성 결과
 */
export async function generateProductImageAction(
  productName: string,
  productId?: string,
  options?: {
    category?: string;
    description?: string;
    customPrompt?: string;
  }
): Promise<GenerateImageResult> {
  try {
    console.log("[AI Image] Generating product image for:", productName);

    // 1. Gemini API로 이미지 생성
    const result = await generateProductImage(productName, options);

    if (!result) {
      return {
        success: false,
        error: "이미지 생성에 실패했습니다. 다시 시도해주세요.",
      };
    }

    // 2. Storage에 업로드
    const imageUrl = await uploadBase64ImageToStorage(
      result.imageBase64,
      result.mimeType,
      "product",
      productId
    );

    if (!imageUrl) {
      return {
        success: false,
        error: "이미지 저장에 실패했습니다.",
      };
    }

    // 3. DB에 기록 저장
    const record = await saveGeneratedImageRecord(
      imageUrl,
      result.prompt,
      "product",
      productId
    );

    return {
      success: true,
      imageUrl,
      generatedImageId: record?.id,
    };
  } catch (error) {
    console.error("[AI Image] Error in generateProductImageAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 배너 이미지 AI 생성
 *
 * @param title - 프로모션 제목
 * @param productId - 연결된 상품 ID (선택)
 * @param options - 추가 옵션
 * @returns 생성 결과
 */
export async function generateBannerImageAction(
  title: string,
  productId?: string,
  options?: {
    subtitle?: string;
    productName?: string;
    customPrompt?: string;
  }
): Promise<GenerateImageResult> {
  try {
    console.log("[AI Image] Generating banner image for:", title);

    // 1. Gemini API로 이미지 생성
    const result = await generateBannerImage(title, options);

    if (!result) {
      return {
        success: false,
        error: "배너 이미지 생성에 실패했습니다. 다시 시도해주세요.",
      };
    }

    // 2. Storage에 업로드
    const imageUrl = await uploadBase64ImageToStorage(
      result.imageBase64,
      result.mimeType,
      "banner",
      productId
    );

    if (!imageUrl) {
      return {
        success: false,
        error: "이미지 저장에 실패했습니다.",
      };
    }

    // 3. DB에 기록 저장
    const record = await saveGeneratedImageRecord(
      imageUrl,
      result.prompt,
      "banner",
      productId
    );

    return {
      success: true,
      imageUrl,
      generatedImageId: record?.id,
    };
  } catch (error) {
    console.error("[AI Image] Error in generateBannerImageAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 상품별 생성된 이미지 목록 조회
 *
 * @param productId - 상품 ID
 * @param imageType - 이미지 유형 필터 (선택)
 * @returns 생성된 이미지 목록
 */
export async function getGeneratedImagesByProduct(
  productId: string,
  imageType?: GeneratedImageType
): Promise<GeneratedImage[]> {
  try {
    const supabase = getServiceRoleClient();

    let query = supabase
      .from("generated_images")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (imageType) {
      query = query.eq("image_type", imageType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[AI Image] Error fetching generated images:", error);
      return [];
    }

    return data as GeneratedImage[];
  } catch (error) {
    console.error("[AI Image] Error in getGeneratedImagesByProduct:", error);
    return [];
  }
}

/**
 * 이미지 유형별 생성된 이미지 목록 조회 (상품 미연결)
 *
 * @param imageType - 이미지 유형
 * @param limit - 조회 개수 제한
 * @returns 생성된 이미지 목록
 */
export async function getGeneratedImagesByType(
  imageType: GeneratedImageType,
  limit: number = 20
): Promise<GeneratedImage[]> {
  try {
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("generated_images")
      .select("*")
      .eq("image_type", imageType)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[AI Image] Error fetching generated images:", error);
      return [];
    }

    return data as GeneratedImage[];
  } catch (error) {
    console.error("[AI Image] Error in getGeneratedImagesByType:", error);
    return [];
  }
}

/**
 * 생성된 이미지 사용 상태 업데이트
 *
 * @param imageId - 이미지 ID
 * @param isUsed - 사용 여부
 */
export async function updateGeneratedImageUsage(
  imageId: string,
  isUsed: boolean
): Promise<boolean> {
  try {
    const supabase = getServiceRoleClient();

    const { error } = await supabase
      .from("generated_images")
      .update({ is_used: isUsed })
      .eq("id", imageId);

    if (error) {
      console.error("[AI Image] Error updating image usage:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[AI Image] Error in updateGeneratedImageUsage:", error);
    return false;
  }
}

/**
 * 생성된 이미지 삭제 (Storage + DB)
 *
 * @param imageId - 이미지 ID
 */
export async function deleteGeneratedImage(imageId: string): Promise<boolean> {
  try {
    const supabase = getServiceRoleClient();

    // 1. 이미지 정보 조회
    const { data: image, error: fetchError } = await supabase
      .from("generated_images")
      .select("image_url")
      .eq("id", imageId)
      .single();

    if (fetchError || !image) {
      console.error("[AI Image] Image not found:", imageId);
      return false;
    }

    // 2. Storage에서 파일 삭제
    const imageUrl = image.image_url;
    const urlParts = imageUrl.split(`${STORAGE_BUCKET}/`);
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    }

    // 3. DB에서 레코드 삭제
    const { error: deleteError } = await supabase
      .from("generated_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      console.error("[AI Image] Error deleting image record:", deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[AI Image] Error in deleteGeneratedImage:", error);
    return false;
  }
}

