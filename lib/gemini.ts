/**
 * @file lib/gemini.ts
 * @description Google Gemini API 클라이언트 설정 및 이미지 생성 유틸리티
 *
 * 주요 기능:
 * - Gemini API 클라이언트 초기화
 * - Imagen 모델을 사용한 이미지 생성
 * - 상품 이미지 생성 (1024x1024, 1:1)
 * - 배너 이미지 생성 (1792x1024, 16:9)
 *
 * @dependencies
 * - @google/genai: Google Generative AI SDK
 */

import { GoogleGenAI } from "@google/genai";
import {
  IMAGE_SIZES,
  DEFAULT_PRODUCT_IMAGE_PROMPT,
  DEFAULT_BANNER_IMAGE_PROMPT,
  type GeneratedImageType,
} from "@/types/banner";

// ============================================
// Client Initialization
// ============================================

/**
 * Gemini API 클라이언트 인스턴스
 * 환경변수 GEMINI_API_KEY가 필요합니다.
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY 환경변수가 설정되지 않았습니다. .env.local 파일에 GEMINI_API_KEY를 추가해주세요."
    );
  }

  return new GoogleGenAI({ apiKey });
}

// ============================================
// Image Generation
// ============================================

/**
 * Imagen 모델을 사용하여 이미지 생성
 *
 * @param prompt - 이미지 생성 프롬프트
 * @param imageType - 이미지 유형 ('product' | 'banner')
 * @returns base64 인코딩된 이미지 데이터
 */
export async function generateImageWithImagen(
  prompt: string,
  imageType: GeneratedImageType = "product"
): Promise<{ imageBase64: string; mimeType: string } | null> {
  try {
    const ai = getGeminiClient();
    const size = IMAGE_SIZES[imageType === "product" ? "PRODUCT" : "BANNER"];

    console.log(`[Gemini] Generating ${imageType} image with Imagen...`);
    console.log(`[Gemini] Size: ${size.width}x${size.height} (${size.aspectRatio})`);

    // Imagen 4.0 모델 사용 (최신 버전)
    // 참고: imagen-3.0-generate-002도 사용 가능
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: size.aspectRatio as "1:1" | "16:9" | "9:16" | "3:4" | "4:3",
      },
    });

    if (
      response.generatedImages &&
      response.generatedImages.length > 0 &&
      response.generatedImages[0].image
    ) {
      const imageBytes = response.generatedImages[0].image.imageBytes;
      if (imageBytes) {
        console.log(`[Gemini] Image generated successfully with Imagen`);
        return {
          imageBase64: typeof imageBytes === "string" ? imageBytes : Buffer.from(imageBytes).toString("base64"),
          mimeType: "image/png",
        };
      }
    }

    console.error("[Gemini] No image generated from Imagen");
    return null;
  } catch (error) {
    console.error("[Gemini] Error generating image with Imagen:", error);
    // Imagen 실패 시 null 반환하여 fallback으로 진행
    return null;
  }
}

/**
 * Gemini 모델을 사용하여 이미지 생성 (텍스트-이미지 생성)
 * Imagen이 실패할 경우 대체 방법으로 사용
 *
 * @param prompt - 이미지 생성 프롬프트
 * @returns base64 인코딩된 이미지 데이터
 */
export async function generateImageWithGemini(
  prompt: string
): Promise<{ imageBase64: string; mimeType: string } | null> {
  try {
    const ai = getGeminiClient();

    console.log(`[Gemini] Generating image with Gemini 3 Pro Image model...`);

    // Gemini 3 Pro Image Preview 모델 사용 (고급 텍스트-이미지 생성)
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: `Generate an image based on this description: ${prompt}`,
    });

    // 응답에서 이미지 파트 찾기
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          console.log(`[Gemini] Image generated successfully with Gemini model`);
          return {
            imageBase64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || "image/png",
          };
        }
      }
    }

    console.error("[Gemini] No image in response");
    return null;
  } catch (error) {
    console.error("[Gemini] Error generating image with Gemini:", error);
    throw error;
  }
}

// ============================================
// Prompt Builders
// ============================================

/**
 * 상품 이미지 생성을 위한 프롬프트 생성
 *
 * @param productName - 상품명
 * @param category - 카테고리 (선택)
 * @param description - 상품 설명 (선택)
 * @param customPrompt - 사용자 정의 추가 프롬프트 (선택)
 * @returns 완성된 프롬프트
 */
export function buildProductImagePrompt(
  productName: string,
  category?: string,
  description?: string,
  customPrompt?: string
): string {
  const parts: string[] = [DEFAULT_PRODUCT_IMAGE_PROMPT];

  parts.push(`\n상품명: ${productName}`);

  if (category) {
    parts.push(`카테고리: ${category}`);
  }

  if (description) {
    // 설명이 너무 길면 처음 200자만 사용
    const shortDescription = description.length > 200 ? description.slice(0, 200) + "..." : description;
    parts.push(`상품 설명: ${shortDescription}`);
  }

  if (customPrompt) {
    parts.push(`\n추가 지시사항: ${customPrompt}`);
  }

  return parts.join("\n");
}

/**
 * 배너 이미지 생성을 위한 프롬프트 생성
 *
 * @param title - 프로모션 제목
 * @param subtitle - 부제목 (선택)
 * @param productName - 연결된 상품명 (선택)
 * @param customPrompt - 사용자 정의 추가 프롬프트 (선택)
 * @returns 완성된 프롬프트
 */
export function buildBannerImagePrompt(
  title: string,
  subtitle?: string,
  productName?: string,
  customPrompt?: string
): string {
  const parts: string[] = [DEFAULT_BANNER_IMAGE_PROMPT];

  parts.push(`\n프로모션 제목: ${title}`);

  if (subtitle) {
    parts.push(`부제목: ${subtitle}`);
  }

  if (productName) {
    parts.push(`주요 상품: ${productName}`);
  }

  if (customPrompt) {
    parts.push(`\n추가 지시사항: ${customPrompt}`);
  }

  return parts.join("\n");
}

// ============================================
// High-level Generation Functions
// ============================================

/**
 * 상품 이미지 생성 (고수준 API)
 *
 * @param productName - 상품명
 * @param options - 추가 옵션
 * @returns 생성된 이미지 데이터 또는 null
 */
export async function generateProductImage(
  productName: string,
  options?: {
    category?: string;
    description?: string;
    customPrompt?: string;
  }
): Promise<{ imageBase64: string; mimeType: string; prompt: string } | null> {
  const prompt = buildProductImagePrompt(
    productName,
    options?.category,
    options?.description,
    options?.customPrompt
  );

  // 먼저 Gemini 모델로 시도 (더 안정적)
  console.log("[Gemini] Trying Gemini model first...");
  try {
    const geminiResult = await generateImageWithGemini(prompt);
    if (geminiResult) {
      return { ...geminiResult, prompt };
    }
  } catch (error) {
    console.log("[Gemini] Gemini model failed, trying Imagen...");
  }

  // Gemini 실패 시 Imagen으로 재시도
  try {
    const result = await generateImageWithImagen(prompt, "product");
    if (result) {
      return { ...result, prompt };
    }
  } catch (error) {
    console.error("[Gemini] Imagen also failed:", error);
  }

  return null;
}

/**
 * 배너 이미지 생성 (고수준 API)
 *
 * @param title - 프로모션 제목
 * @param options - 추가 옵션
 * @returns 생성된 이미지 데이터 또는 null
 */
export async function generateBannerImage(
  title: string,
  options?: {
    subtitle?: string;
    productName?: string;
    customPrompt?: string;
  }
): Promise<{ imageBase64: string; mimeType: string; prompt: string } | null> {
  const prompt = buildBannerImagePrompt(
    title,
    options?.subtitle,
    options?.productName,
    options?.customPrompt
  );

  // 먼저 Gemini 모델로 시도 (더 안정적)
  console.log("[Gemini] Trying Gemini model first...");
  try {
    const geminiResult = await generateImageWithGemini(prompt);
    if (geminiResult) {
      return { ...geminiResult, prompt };
    }
  } catch (error) {
    console.log("[Gemini] Gemini model failed, trying Imagen...");
  }

  // Gemini 실패 시 Imagen으로 재시도
  try {
    const result = await generateImageWithImagen(prompt, "banner");
    if (result) {
      return { ...result, prompt };
    }
  } catch (error) {
    console.error("[Gemini] Imagen also failed:", error);
  }

  return null;
}

