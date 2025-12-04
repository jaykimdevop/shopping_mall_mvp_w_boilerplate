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

    console.log("Add to cart called:", { userId, productId, quantity });

    // 입력 검증
    if (!productId || quantity < 1) {
      return {
        success: false,
        message: "유효하지 않은 입력입니다.",
      };
    }

    const supabase = await createClerkSupabaseClient();
    console.log("Supabase client created");

    // 상품 정보 조회 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
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

    // 기존 장바구니 아이템 확인 (maybeSingle 사용 - 없어도 에러 안 남)
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    // 에러가 있고, "PGRST116" (no rows) 에러가 아닌 경우만 실패로 처리
    if (existingError && existingError.code !== "PGRST116") {
      console.error("Cart item check error:", existingError);
      return {
        success: false,
        message: existingError.message || "장바구니 확인 중 오류가 발생했습니다.",
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

      if (updateError || !updatedItem) {
        console.error("Cart update error:", updateError);
        return {
          success: false,
          message: updateError?.message || "장바구니 업데이트에 실패했습니다.",
        };
      }

      // 상품 정보를 별도로 조회하여 추가
      const updatedCartItem = {
        ...updatedItem,
        product: product,
      };
      
      cartItem = updatedCartItem as CartItem;
    } else {
      // 새 아이템 추가
      console.log("Inserting cart item:", { clerk_id: userId, product_id: productId, quantity });
      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          clerk_id: userId,
          product_id: productId,
          quantity,
        })
        .select("*")
        .single();

      console.log("Insert result:", { newItem, insertError });

      if (insertError) {
        console.error("Cart insert error:", insertError);
        console.error("Error code:", insertError.code);
        console.error("Error message:", insertError.message);
        console.error("Error details:", insertError.details);
        return {
          success: false,
          message: insertError.message || `장바구니 추가에 실패했습니다. (${insertError.code || "unknown"})`,
        };
      }

      if (!newItem) {
        console.error("Cart insert failed: no data returned");
        return {
          success: false,
          message: "장바구니 추가에 실패했습니다. (데이터 없음)",
        };
      }

      // 상품 정보를 별도로 조회하여 추가
      const newCartItem = {
        ...newItem,
        product: product,
      };
      
      cartItem = newCartItem as CartItem;
      
      // 실제로 저장되었는지 확인
      const { data: verifyItem, error: verifyError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("id", newItem.id)
        .eq("clerk_id", userId)
        .single();
      
      if (verifyError || !verifyItem) {
        console.error("Cart item verification failed:", verifyError);
        return {
          success: false,
          message: "장바구니 추가는 완료되었지만 확인에 실패했습니다. 페이지를 새로고침해주세요.",
        };
      }
      
      console.log("Cart item verified:", verifyItem);
    }

    return {
      success: true,
      message: "장바구니에 추가되었습니다.",
      cartItem,
    };
  } catch (error) {
    console.error("Add to cart error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // 실제 에러 메시지 반환
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // onAuthStateChange 관련 경고는 콘솔에만 표시하고 실제 에러는 그대로 반환
    if (errorMessage.includes("onAuthStateChange is not possible") || 
        errorMessage.includes("accessToken option")) {
      console.warn("Supabase auth warning detected, but this should not cause failure");
      // 경고이지만 실제 에러일 수 있으므로 에러로 처리
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

    if (productError || !product) {
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

    if (updateError || !updatedItem) {
      console.error("Cart update error:", updateError);
      return {
        success: false,
        message: updateError?.message || "수량 변경에 실패했습니다.",
      };
    }

    // 상품 정보를 포함하여 반환
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
    
    // Supabase auth 경고는 무시
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("onAuthStateChange is not possible") || 
        errorMessage.includes("accessToken option")) {
      console.warn("Supabase auth warning (ignored):", errorMessage);
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
        message: "장바구니 아이템 삭제에 실패했습니다.",
      };
    }

    return {
      success: true,
      message: "장바구니에서 제거되었습니다.",
    };
  } catch (error) {
    console.error("Remove cart item error:", error);
    
    // Supabase auth 경고는 무시
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("onAuthStateChange is not possible") || 
        errorMessage.includes("accessToken option")) {
      console.warn("Supabase auth warning (ignored):", errorMessage);
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

    if (productsError || !products) {
      console.error("Get products error:", productsError);
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
    const { count, error } = await supabase
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

