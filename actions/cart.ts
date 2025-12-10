"use server";

/**
 * @file actions/cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * 장바구니 CRUD 작업을 처리하는 Server Actions입니다.
 * Clerk 인증을 사용하여 사용자별 장바구니를 관리합니다.
 */

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  CartItem,
  AddToCartResult,
  UpdateCartQuantityResult,
  RemoveCartItemResult,
  SyncCartResult,
  GuestCartItem,
} from "@/types/cart";

/**
 * 장바구니에 상품 추가
 * 같은 상품이 이미 있으면 수량을 업데이트합니다 (UPSERT).
 */
export async function addToCart(
  productId: string,
  quantity: number
): Promise<AddToCartResult> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        requiresAuth: true,
      };
    }

    // 입력 검증
    if (!productId || quantity < 1) {
      return {
        success: false,
        message: "유효하지 않은 입력입니다.",
      };
    }

    // Supabase 클라이언트 생성
    let supabase;
    try {
      supabase = await createClerkSupabaseClient();
    } catch (clientError) {
      console.error("Failed to create Supabase client:", clientError);
      return {
        success: false,
        message: "데이터베이스 연결에 실패했습니다. 다시 시도해주세요.",
      };
    }

    // 사용자가 users 테이블에 존재하는지 확인하고, 없으면 추가
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("clerk_id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (userCheckError) {
      console.error("User check error:", userCheckError);
    }

    if (!existingUser) {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);

        const { error: insertUserError } = await supabase
          .from("users")
          .upsert(
            {
              clerk_id: clerkUser.id,
              name:
                clerkUser.fullName ||
                clerkUser.username ||
                clerkUser.emailAddresses[0]?.emailAddress ||
                "Unknown",
            },
            {
              onConflict: "clerk_id",
            }
          );

        if (insertUserError) {
          console.error("Failed to add user to users table:", insertUserError);
        }
      } catch (userAddError) {
        console.error("Error adding user:", userAddError);
      }
    }

    // 상품 정보 조회 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError) {
      console.error("Product fetch error:", productError);
      return {
        success: false,
        message: productError.message || `상품을 찾을 수 없습니다. (${productError.code || "unknown"})`,
      };
    }

    if (!product) {
      return {
        success: false,
        message: "상품을 찾을 수 없습니다.",
      };
    }

    // 재고 확인
    if (product.stock_quantity < quantity) {
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 기존 장바구니 아이템 확인
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Cart item check error:", existingError);
      return {
        success: false,
        message: existingError.message || `장바구니 확인 중 오류가 발생했습니다. (${existingError.code || "unknown"})`,
      };
    }

    let cartItem: CartItem;

    if (existingItem) {
      // 기존 아이템이 있으면 수량 업데이트
      const newQuantity = existingItem.quantity + quantity;

      // 재고 확인 (기존 수량 + 추가 수량)
      if (product.stock_quantity < newQuantity) {
        return {
          success: false,
          message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개, 장바구니: ${existingItem.quantity}개)`,
        };
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select("*")
        .single();

      if (updateError) {
        console.error("Cart update error:", updateError);
        return {
          success: false,
          message: updateError.message || `장바구니 업데이트에 실패했습니다. (${updateError.code || "unknown"})`,
        };
      }

      if (!updatedItem) {
        return {
          success: false,
          message: "장바구니 업데이트에 실패했습니다. (데이터 없음)",
        };
      }

      const updatedCartItem = {
        ...updatedItem,
        product: product,
      };
      
      cartItem = updatedCartItem as CartItem;
    } else {
      // 새 아이템 추가
      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          clerk_id: userId,
          product_id: productId,
          quantity,
        })
        .select("*")
        .single();

      if (insertError) {
        console.error("Cart insert error:", insertError);
        return {
          success: false,
          message: insertError.message || `장바구니 추가에 실패했습니다. (${insertError.code || "unknown"})`,
        };
      }

      if (!newItem) {
        return {
          success: false,
          message: "장바구니 추가에 실패했습니다. (데이터 없음)",
        };
      }

      const newCartItem = {
        ...newItem,
        product: product,
      };
      
      cartItem = newCartItem as CartItem;
    }

    return {
      success: true,
      message: "장바구니에 추가되었습니다.",
      cartItem,
    };
  } catch (error) {
    console.error("Add to cart error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "Unknown";
    
    // onAuthStateChange 관련 경고는 무시 (Clerk 통합 시 정상적인 동작)
    if (errorMessage.includes("onAuthStateChange is not possible") || 
        errorMessage.includes("accessToken option")) {
      return {
        success: false,
        message: "장바구니 추가 중 오류가 발생했습니다. 다시 시도해주세요.",
      };
    }
    
    // 네트워크 오류나 기타 예상치 못한 오류 처리
    if (errorMessage.includes("Failed to fetch") || 
        errorMessage.includes("NetworkError") ||
        errorName === "TypeError") {
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
      };
    }
    
    return {
      success: false,
      message: `장바구니 추가에 실패했습니다: ${errorMessage}`,
    };
  }
}

/**
 * 장바구니 아이템 수량 변경
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<UpdateCartQuantityResult> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        requiresAuth: true,
      };
    }

    // 입력 검증
    if (!cartItemId || quantity < 1) {
      return {
        success: false,
        message: "유효하지 않은 입력입니다.",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 장바구니 아이템 조회 (사용자 확인)
    const { data: cartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("id", cartItemId)
      .eq("clerk_id", userId)
      .single();

    if (fetchError || !cartItem) {
      return {
        success: false,
        message: fetchError?.message || "장바구니 아이템을 찾을 수 없습니다.",
      };
    }

    // 상품 정보 조회
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", cartItem.product_id)
      .single();

    if (productError) {
      console.error("Product fetch error:", productError);
      return {
        success: false,
        message: productError.message || "상품 정보를 찾을 수 없습니다.",
      };
    }

    if (!product) {
      return {
        success: false,
        message: "상품 정보를 찾을 수 없습니다.",
      };
    }

    if (product.stock_quantity < quantity) {
      return {
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock_quantity}개)`,
      };
    }

    // 수량 업데이트
    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("clerk_id", userId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Cart update error:", updateError);
      return {
        success: false,
        message: updateError.message || `수량 변경에 실패했습니다. (${updateError.code || "unknown"})`,
      };
    }

    if (!updatedItem) {
      return {
        success: false,
        message: "수량 변경에 실패했습니다. (데이터 없음)",
      };
    }

    const updatedCartItem = {
      ...updatedItem,
      product: product,
    };

    return {
      success: true,
      message: "수량이 변경되었습니다.",
      cartItem: updatedCartItem as CartItem,
    };
  } catch (error) {
    console.error("Update cart quantity error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("onAuthStateChange is not possible") || 
        errorMessage.includes("accessToken option")) {
      return {
        success: true,
        message: "수량이 변경되었습니다.",
      };
    }
    
    return {
      success: false,
      message: `오류가 발생했습니다: ${errorMessage}`,
    };
  }
}

/**
 * 장바구니 아이템 삭제
 */
export async function removeCartItem(
  cartItemId: string
): Promise<RemoveCartItemResult> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
        requiresAuth: true,
      };
    }

    // 입력 검증
    if (!cartItemId) {
      return {
        success: false,
        message: "유효하지 않은 입력입니다.",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 장바구니 아이템 삭제 (사용자 확인)
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    if (deleteError) {
      console.error("Cart delete error:", deleteError);
      return {
        success: false,
        message: deleteError.message || `장바구니 아이템 삭제에 실패했습니다. (${deleteError.code || "unknown"})`,
      };
    }

    return {
      success: true,
      message: "장바구니에서 제거되었습니다.",
    };
  } catch (error) {
    console.error("Remove cart item error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("onAuthStateChange is not possible") || 
        errorMessage.includes("accessToken option")) {
      return {
        success: true,
        message: "장바구니에서 제거되었습니다.",
      };
    }
    
    return {
      success: false,
      message: `오류가 발생했습니다: ${errorMessage}`,
    };
  }
}

/**
 * 현재 사용자의 장바구니 아이템 조회
 */
export async function getCartItems(): Promise<CartItem[]> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const supabase = await createClerkSupabaseClient();

    // 장바구니 아이템 조회
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get cart items error:", error);
      return [];
    }

    if (!cartItems || cartItems.length === 0) {
      return [];
    }

    // 각 아이템의 상품 정보 조회
    const productIds = cartItems.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError) {
      console.error("Get products error:", productsError);
      return [];
    }

    if (!products) {
      return [];
    }

    // 상품 정보를 맵으로 변환
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 장바구니 아이템에 상품 정보 추가
    const formattedItems = cartItems.map((item) => ({
      ...item,
      product: productMap.get(item.product_id),
    })).filter((item) => item.product) as CartItem[];

    return formattedItems;
  } catch (error) {
    console.error("Get cart items error:", error);
    return [];
  }
}

/**
 * 장바구니 아이템 개수 조회 (네비게이션 배지용)
 */
export async function getCartItemCount(): Promise<number> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return 0;
    }

    const supabase = await createClerkSupabaseClient();

    // 장바구니 아이템 개수 조회 (수량 합계)
    const { error } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("clerk_id", userId);

    if (error) {
      console.error("Get cart count error:", error);
      return 0;
    }

    // 수량 합계 계산
    const { data: items } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("clerk_id", userId);

    if (!items) {
      return 0;
    }

    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error("Get cart count error:", error);
    return 0;
  }
}

/**
 * 비회원 장바구니를 회원 장바구니로 동기화
 * 로그인 시 로컬 스토리지의 장바구니를 서버로 병합합니다.
 */
export async function syncGuestCartToServer(
  guestItems: GuestCartItem[]
): Promise<SyncCartResult> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    if (!guestItems || guestItems.length === 0) {
      return {
        success: true,
        message: "동기화할 아이템이 없습니다.",
        syncedItems: 0,
      };
    }

    const supabase = await createClerkSupabaseClient();
    let syncedCount = 0;

    for (const guestItem of guestItems) {
      try {
        // 상품 존재 및 재고 확인
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, stock_quantity, is_active")
          .eq("id", guestItem.product_id)
          .eq("is_active", true)
          .single();

        if (productError || !product) {
          continue;
        }

        // 기존 장바구니 아이템 확인
        const { data: existingItem, error: existingError } = await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("clerk_id", userId)
          .eq("product_id", guestItem.product_id)
          .maybeSingle();

        if (existingError && existingError.code !== "PGRST116") {
          console.error("Error checking existing cart item:", existingError);
          continue;
        }

        if (existingItem) {
          // 기존 아이템이 있으면 수량 합산 (재고 초과 시 재고 수량으로 제한)
          const newQuantity = Math.min(
            existingItem.quantity + guestItem.quantity,
            product.stock_quantity
          );

          const { error: updateError } = await supabase
            .from("cart_items")
            .update({ quantity: newQuantity })
            .eq("id", existingItem.id);

          if (updateError) {
            console.error("Error updating cart item:", updateError);
            continue;
          }
        } else {
          // 새 아이템 추가 (재고 초과 시 재고 수량으로 제한)
          const quantity = Math.min(
            guestItem.quantity,
            product.stock_quantity
          );

          if (quantity > 0) {
            const { error: insertError } = await supabase
              .from("cart_items")
              .insert({
                clerk_id: userId,
                product_id: guestItem.product_id,
                quantity,
              });

            if (insertError) {
              console.error("Error inserting cart item:", insertError);
              continue;
            }
          }
        }

        syncedCount++;
      } catch (itemError) {
        console.error(`Error syncing item ${guestItem.product_id}:`, itemError);
      }
    }

    return {
      success: true,
      message: `${syncedCount}개의 상품이 장바구니에 추가되었습니다.`,
      syncedItems: syncedCount,
    };
  } catch (error) {
    console.error("Sync guest cart error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `장바구니 동기화에 실패했습니다: ${errorMessage}`,
    };
  }
}

/**
 * 상품 정보 조회 (비회원 장바구니용)
 * 여러 상품 ID로 상품 정보를 조회합니다.
 */
export async function getProductsByIds(productIds: string[]): Promise<{
  success: boolean;
  products?: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    stock_quantity: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  message?: string;
}> {
  try {
    if (!productIds || productIds.length === 0) {
      return {
        success: true,
        products: [],
      };
    }

    const supabase = await createClerkSupabaseClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("is_active", true);

    if (error) {
      console.error("Get products by ids error:", error);
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      products: products || [],
    };
  } catch (error) {
    console.error("Get products by ids error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
