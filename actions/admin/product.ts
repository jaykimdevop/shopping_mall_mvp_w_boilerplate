"use server";

/**
 * @file actions/admin/product.ts
 * @description 관리자 상품 관리 Server Actions
 *
 * 상품 CRUD 및 관리 기능을 제공합니다.
 * - 상품 목록 조회 (검색, 필터, 정렬, 페이지네이션)
 * - 상품 생성, 수정, 삭제
 * - 상품 상태 토글 (활성/비활성)
 * - 일괄 삭제
 *
 * @dependencies
 * - @/lib/supabase/service-role: RLS 우회를 위한 서비스 역할 클라이언트
 * - @/types/product: 상품 관련 타입
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  AdminProductQueryOptions,
  PaginatedProductsResponse,
} from "@/types/product";

// ============================================================================
// 이미지 업로드
// ============================================================================

/**
 * 상품 이미지 업로드
 *
 * @param formData 이미지 파일을 포함한 FormData
 * @returns 업로드된 이미지의 공개 URL
 */
export async function uploadProductImage(
  formData: FormData
): Promise<{ url: string }> {
  const supabase = getServiceRoleClient();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("파일이 없습니다.");
  }

  // 파일 유효성 검사
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("지원하지 않는 이미지 형식입니다. (JPEG, PNG, WebP, GIF만 가능)");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("파일 크기는 5MB 이하여야 합니다.");
  }

  // 고유한 파일명 생성
  const ext = file.name.split(".").pop();
  const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

  // Supabase Storage에 업로드
  const { error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Failed to upload image:", uploadError);
    throw new Error("이미지 업로드에 실패했습니다.");
  }

  // 공개 URL 생성
  const { data: publicUrlData } = supabase.storage
    .from("uploads")
    .getPublicUrl(fileName);

  return { url: publicUrlData.publicUrl };
}

/**
 * 상품 이미지 삭제
 *
 * @param imageUrl 삭제할 이미지 URL
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  const supabase = getServiceRoleClient();

  // URL에서 파일 경로 추출
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split("/storage/v1/object/public/uploads/");
  if (pathParts.length !== 2) {
    console.warn("Invalid image URL format:", imageUrl);
    return;
  }

  const filePath = pathParts[1];

  const { error } = await supabase.storage.from("uploads").remove([filePath]);

  if (error) {
    console.error("Failed to delete image:", error);
    // 이미지 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

// ============================================================================
// 상품 조회
// ============================================================================

/**
 * 관리자용 상품 목록 조회
 *
 * @param options 검색, 필터, 정렬, 페이지네이션 옵션
 * @returns 페이지네이션된 상품 목록
 */
export async function getAdminProducts(
  options: AdminProductQueryOptions = {}
): Promise<PaginatedProductsResponse> {
  const supabase = getServiceRoleClient();

  const {
    search = "",
    status = "all",
    category,
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = options;

  // 기본 쿼리 구성
  let query = supabase.from("products").select("*", { count: "exact" });

  // 검색 필터 (상품명, 카테고리)
  if (search) {
    query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
  }

  // 상태 필터
  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  // 카테고리 필터
  if (category) {
    query = query.eq("category", category);
  }

  // 정렬
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // 페이지네이션
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch products:", error);
    throw new Error("상품 목록을 불러오는데 실패했습니다.");
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products: (data || []) as Product[],
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * 상품 상세 조회
 *
 * @param id 상품 ID
 * @returns 상품 정보 또는 null
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }

  return data as Product;
}

/**
 * 모든 카테고리 목록 조회
 *
 * @returns 고유한 카테고리 목록
 */
export async function getCategories(): Promise<string[]> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);

  if (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }

  // 중복 제거 및 정렬
  const categories = [
    ...new Set(data?.map((item) => item.category).filter(Boolean) as string[]),
  ].sort();

  return categories;
}

// ============================================================================
// 상품 생성
// ============================================================================

/**
 * 새 상품 생성
 *
 * @param input 상품 생성 데이터
 * @returns 생성된 상품
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      description: input.description || null,
      price: input.price,
      category: input.category || null,
      stock_quantity: input.stock_quantity ?? 0,
      is_active: input.is_active ?? true,
      image_url: input.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create product:", error);
    throw new Error("상품 등록에 실패했습니다.");
  }

  // 관련 페이지 캐시 무효화
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return data as Product;
}

// ============================================================================
// 상품 수정
// ============================================================================

/**
 * 상품 정보 수정
 *
 * @param id 상품 ID
 * @param input 수정할 데이터
 * @returns 수정된 상품
 */
export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const supabase = getServiceRoleClient();

  // undefined 값 제거 (null은 유지)
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.stock_quantity !== undefined)
    updateData.stock_quantity = input.stock_quantity;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;
  if (input.image_url !== undefined) updateData.image_url = input.image_url;

  // updated_at 자동 갱신
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update product:", error);
    throw new Error("상품 수정에 실패했습니다.");
  }

  // 관련 페이지 캐시 무효화
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
  revalidatePath("/");

  return data as Product;
}

/**
 * 상품 활성/비활성 상태 토글
 *
 * @param id 상품 ID
 * @returns 토글 후 상태
 */
export async function toggleProductStatus(
  id: string
): Promise<{ is_active: boolean }> {
  const supabase = getServiceRoleClient();

  // 현재 상태 조회
  const { data: current, error: fetchError } = await supabase
    .from("products")
    .select("is_active")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    console.error("Failed to fetch product status:", fetchError);
    throw new Error("상품을 찾을 수 없습니다.");
  }

  // 상태 토글
  const newStatus = !current.is_active;
  const { error: updateError } = await supabase
    .from("products")
    .update({ is_active: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to toggle product status:", updateError);
    throw new Error("상품 상태 변경에 실패했습니다.");
  }

  // 관련 페이지 캐시 무효화
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { is_active: newStatus };
}

// ============================================================================
// 상품 삭제
// ============================================================================

/**
 * 상품 삭제
 *
 * @param id 상품 ID
 */
export async function deleteProduct(id: string): Promise<void> {
  const supabase = getServiceRoleClient();

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete product:", error);
    throw new Error("상품 삭제에 실패했습니다.");
  }

  // 관련 페이지 캐시 무효화
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
}

/**
 * 상품 일괄 삭제
 *
 * @param ids 삭제할 상품 ID 배열
 * @returns 삭제된 상품 수
 */
export async function deleteProducts(ids: string[]): Promise<{ count: number }> {
  const supabase = getServiceRoleClient();

  if (ids.length === 0) {
    return { count: 0 };
  }

  const { error, count } = await supabase
    .from("products")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Failed to delete products:", error);
    throw new Error("상품 일괄 삭제에 실패했습니다.");
  }

  // 관련 페이지 캐시 무효화
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return { count: count || ids.length };
}

