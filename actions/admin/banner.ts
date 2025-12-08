/**
 * @file actions/admin/banner.ts
 * @description 배너 관리 Server Actions
 *
 * 주요 기능:
 * - 배너 CRUD (생성, 조회, 수정, 삭제)
 * - 배너 순서 변경
 * - 배너 활성화/비활성화
 * - 활성 배너 조회 (홈페이지용)
 */

"use server";

import { revalidatePath } from "next/cache";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  Banner,
  BannerWithProduct,
  CreateBannerInput,
  UpdateBannerInput,
} from "@/types/banner";

// ============================================
// Read Operations
// ============================================

/**
 * 모든 배너 조회 (관리자용)
 */
export async function getBanners(): Promise<BannerWithProduct[]> {
  try {
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("banners")
      .select(`
        *,
        product:products(id, name, price, image_url)
      `)
      .order("sort_order", { ascending: true });

    if (error) {
      // 테이블이 없는 경우 빈 배열 반환 (마이그레이션 미적용 상태)
      if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
        console.warn("[Banner] Banners table not found. Please run migrations.");
        return [];
      }
      console.error("[Banner] Error fetching banners:", error);
      throw new Error("배너 목록을 불러오는데 실패했습니다.");
    }

    return data as BannerWithProduct[];
  } catch (error) {
    console.error("[Banner] Error in getBanners:", error);
    throw error;
  }
}

/**
 * 활성화된 배너만 조회 (홈페이지용)
 */
export async function getActiveBanners(): Promise<BannerWithProduct[]> {
  try {
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("banners")
      .select(`
        *,
        product:products(id, name, price, image_url)
      `)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      // 테이블이 없는 경우 빈 배열 반환 (마이그레이션 미적용 상태)
      if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
        console.warn("[Banner] Banners table not found. Please run migrations.");
        return [];
      }
      console.error("[Banner] Error fetching active banners:", error);
      throw new Error("배너를 불러오는데 실패했습니다.");
    }

    return data as BannerWithProduct[];
  } catch (error) {
    console.error("[Banner] Error in getActiveBanners:", error);
    throw error;
  }
}

/**
 * 배너 상세 조회
 */
export async function getBannerById(id: string): Promise<BannerWithProduct | null> {
  try {
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("banners")
      .select(`
        *,
        product:products(id, name, price, image_url)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("[Banner] Error fetching banner:", error);
      throw new Error("배너를 불러오는데 실패했습니다.");
    }

    return data as BannerWithProduct;
  } catch (error) {
    console.error("[Banner] Error in getBannerById:", error);
    throw error;
  }
}

// ============================================
// Create Operations
// ============================================

/**
 * 배너 생성
 */
export async function createBanner(input: CreateBannerInput): Promise<Banner> {
  try {
    const supabase = getServiceRoleClient();

    // 현재 최대 sort_order 조회
    const { data: maxOrderData } = await supabase
      .from("banners")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = (maxOrderData?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("banners")
      .insert({
        ...input,
        sort_order: input.sort_order ?? nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("[Banner] Error creating banner:", error);
      console.error("[Banner] Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`배너 생성에 실패했습니다: ${error.message}`);
    }

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return data as Banner;
  } catch (error) {
    console.error("[Banner] Error in createBanner:", error);
    throw error;
  }
}

// ============================================
// Update Operations
// ============================================

/**
 * 배너 수정
 */
export async function updateBanner(
  id: string,
  input: UpdateBannerInput
): Promise<Banner> {
  try {
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("banners")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Banner] Error updating banner:", error);
      throw new Error("배너 수정에 실패했습니다.");
    }

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return data as Banner;
  } catch (error) {
    console.error("[Banner] Error in updateBanner:", error);
    throw error;
  }
}

/**
 * 배너 활성화/비활성화 토글
 */
export async function toggleBannerStatus(id: string): Promise<boolean> {
  try {
    const supabase = getServiceRoleClient();

    // 현재 상태 조회
    const { data: current, error: fetchError } = await supabase
      .from("banners")
      .select("is_active")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      throw new Error("배너를 찾을 수 없습니다.");
    }

    // 상태 토글
    const { error: updateError } = await supabase
      .from("banners")
      .update({ is_active: !current.is_active })
      .eq("id", id);

    if (updateError) {
      throw new Error("상태 변경에 실패했습니다.");
    }

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return !current.is_active;
  } catch (error) {
    console.error("[Banner] Error in toggleBannerStatus:", error);
    throw error;
  }
}

/**
 * 배너 순서 변경
 */
export async function reorderBanners(
  orderedIds: string[]
): Promise<void> {
  try {
    const supabase = getServiceRoleClient();

    // 각 배너의 sort_order 업데이트
    const updates = orderedIds.map((id, index) =>
      supabase
        .from("banners")
        .update({ sort_order: index })
        .eq("id", id)
    );

    await Promise.all(updates);

    revalidatePath("/admin/banners");
    revalidatePath("/");
  } catch (error) {
    console.error("[Banner] Error in reorderBanners:", error);
    throw new Error("순서 변경에 실패했습니다.");
  }
}

// ============================================
// Delete Operations
// ============================================

/**
 * 배너 삭제
 */
export async function deleteBanner(id: string): Promise<void> {
  try {
    const supabase = getServiceRoleClient();

    // 배너 정보 조회 (이미지 삭제용)
    const { data: banner } = await supabase
      .from("banners")
      .select("image_url")
      .eq("id", id)
      .single();

    // Storage에서 이미지 삭제
    if (banner?.image_url) {
      const urlParts = banner.image_url.split("uploads/");
      if (urlParts.length > 1) {
        await supabase.storage.from("uploads").remove([urlParts[1]]);
      }
    }

    // 배너 삭제
    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Banner] Error deleting banner:", error);
      throw new Error("배너 삭제에 실패했습니다.");
    }

    revalidatePath("/admin/banners");
    revalidatePath("/");
  } catch (error) {
    console.error("[Banner] Error in deleteBanner:", error);
    throw error;
  }
}

/**
 * 여러 배너 일괄 삭제
 */
export async function deleteBanners(ids: string[]): Promise<void> {
  try {
    const supabase = getServiceRoleClient();

    // 배너 정보 조회 (이미지 삭제용)
    const { data: banners } = await supabase
      .from("banners")
      .select("image_url")
      .in("id", ids);

    // Storage에서 이미지 삭제
    if (banners && banners.length > 0) {
      const filePaths = banners
        .filter((b) => b.image_url)
        .map((b) => {
          const urlParts = b.image_url!.split("uploads/");
          return urlParts.length > 1 ? urlParts[1] : null;
        })
        .filter((path): path is string => path !== null);

      if (filePaths.length > 0) {
        await supabase.storage.from("uploads").remove(filePaths);
      }
    }

    // 배너 삭제
    const { error } = await supabase
      .from("banners")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("[Banner] Error deleting banners:", error);
      throw new Error("배너 삭제에 실패했습니다.");
    }

    revalidatePath("/admin/banners");
    revalidatePath("/");
  } catch (error) {
    console.error("[Banner] Error in deleteBanners:", error);
    throw error;
  }
}

// ============================================
// Image Operations
// ============================================

/**
 * 배너 이미지 업로드
 */
export async function uploadBannerImage(formData: FormData): Promise<{ url: string }> {
  try {
    const supabase = getServiceRoleClient();
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("파일이 없습니다.");
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("파일 크기는 10MB 이하여야 합니다.");
    }

    // 파일 타입 검증
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("지원하지 않는 파일 형식입니다.");
    }

    // 파일명 생성
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `banners/${timestamp}_${randomId}.${extension}`;

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("[Banner] Upload error:", error);
      throw new Error("이미지 업로드에 실패했습니다.");
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  } catch (error) {
    console.error("[Banner] Error in uploadBannerImage:", error);
    throw error;
  }
}

/**
 * 배너 이미지 삭제
 */
export async function deleteBannerImage(imageUrl: string): Promise<void> {
  try {
    const supabase = getServiceRoleClient();

    const urlParts = imageUrl.split("uploads/");
    if (urlParts.length > 1) {
      const { error } = await supabase.storage
        .from("uploads")
        .remove([urlParts[1]]);

      if (error) {
        console.error("[Banner] Delete image error:", error);
      }
    }
  } catch (error) {
    console.error("[Banner] Error in deleteBannerImage:", error);
    // 이미지 삭제 실패는 무시
  }
}

