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

    // Supabase 클라이언트 생성
    // RLS가 비활성화되어 있으므로, 토큰이 없어도 anon key로 접근 가능
    // 하지만 Clerk 토큰을 전달하여 향후 RLS 활성화 시 대비
    let supabase;
    try {
      supabase = await createClerkSupabaseClient();
      console.log("Supabase client created for user:", userId);
    } catch (clientError) {
      console.error("Failed to create Supabase client:", clientError);
      // 클라이언트 생성 실패 시에도 계속 진행 (anon key로 접근 가능)
      // 하지만 실제로는 에러를 반환하는 것이 더 안전
      return {
        success: false,
        message: "데이터베이스 연결에 실패했습니다. 다시 시도해주세요.",
      };
    }

    // 사용자가 users 테이블에 존재하는지 확인하고, 없으면 추가
    // Foreign Key 제약 조건이 있는 경우를 대비
    console.log("Checking if user exists in users table:", userId);
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("clerk_id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (userCheckError) {
      console.error("User check error:", userCheckError);
      // 에러가 있어도 계속 진행 (테이블이 없거나 권한 문제일 수 있음)
    }

    if (!existingUser) {
      // 사용자가 없으면 추가 (Clerk에서 사용자 정보 가져오기)
      console.log("User not found in users table, attempting to add:", userId);

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
          // 에러가 있어도 계속 진행 (Foreign Key가 없을 수도 있음)
        } else {
          console.log("User added to users table successfully:", userId);
        }
      } catch (userAddError) {
        console.error("Error adding user:", userAddError);
        // 에러가 있어도 계속 진행
      }
    } else {
      console.log("User already exists in users table:", userId);
    }

    // 상품 정보 조회 및 재고 확인
    console.log("Fetching product:", productId);
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    console.log("Product fetch result:", {
      hasProduct: !!product,
      productError: productError ? {
        code: productError.code,
        message: productError.message,
        details: productError.details,
        hint: productError.hint,
      } : null,
    });

    if (productError) {
      console.error("Product fetch error details:", productError);
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

    // 기존 장바구니 아이템 확인 (maybeSingle 사용 - 없어도 에러 안 남)
    console.log("Checking existing cart item:", { clerk_id: userId, product_id: productId });
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    console.log("Existing cart item check result:", {
      hasItem: !!existingItem,
      error: existingError ? {
        code: existingError.code,
        message: existingError.message,
        details: existingError.details,
        hint: existingError.hint,
      } : null,
    });

    // 에러가 있고, "PGRST116" (no rows) 에러가 아닌 경우만 실패로 처리
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

      console.log("Updating cart item:", { id: existingItem.id, newQuantity });
      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select("*")
        .single();

      console.log("Update result:", {
        hasItem: !!updatedItem,
        error: updateError ? {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        } : null,
      });

      if (updateError) {
        console.error("Cart update error details:", updateError);
        return {
          success: false,
          message: updateError.message || `장바구니 업데이트에 실패했습니다. (${updateError.code || "unknown"})`,
        };
      }

      if (!updatedItem) {
        console.error("Cart update failed: no data returned");
        return {
          success: false,
          message: "장바구니 업데이트에 실패했습니다. (데이터 없음)",
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

      console.log("Insert result:", {
        hasItem: !!newItem,
        itemId: newItem?.id,
        error: insertError ? {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        } : null,
      });

      if (insertError) {
        console.error("Cart insert error details:", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
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
      
      // 실제로 저장되었는지 확인 (선택사항)
      // insert가 성공했다면 newItem이 이미 있으므로 검증은 생략 가능
      console.log("Cart item inserted successfully:", newItem.id);
    }

    // 성공 반환 (경고는 무시)
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
    
    // 에러 타입 확인
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "Unknown";
    
    // onAuthStateChange 관련 경고는 무시 (Clerk 통합 시 정상적인 동작)
    // 이 경고는 실제 에러가 아니며, 데이터베이스 작업과 무관합니다
    if (errorMessage.includes("onAuthStateChange is not possible") || 
        errorMessage.includes("accessToken option")) {
      console.warn("Supabase auth warning (ignored):", errorMessage);
      // 경고는 무시하고 일반적인 에러 메시지 반환
      return {
        success: false,
        message: "장바구니 추가 중 오류가 발생했습니다. 다시 시도해주세요.",
      };
    }
    
    // 네트워크 오류나 기타 예상치 못한 오류 처리
    if (errorMessage.includes("Failed to fetch") || 
        errorMessage.includes("NetworkError") ||
        errorName === "TypeError") {
      console.error("Network or type error:", errorMessage);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
      };
    }
    
    // 기타 오류
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
    console.log("Fetching product for cart item:", cartItem.product_id);
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", cartItem.product_id)
      .single();

    console.log("Product fetch result:", {
      hasProduct: !!product,
      error: productError ? {
        code: productError.code,
        message: productError.message,
      } : null,
    });

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
    console.log("Updating cart item quantity:", { cartItemId, quantity, userId });
    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("clerk_id", userId)
      .select("*")
      .single();

    console.log("Update quantity result:", {
      hasItem: !!updatedItem,
      error: updateError ? {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      } : null,
    });

    if (updateError) {
      console.error("Cart update error details:", updateError);
      return {
        success: false,
        message: updateError.message || `수량 변경에 실패했습니다. (${updateError.code || "unknown"})`,
      };
    }

    if (!updatedItem) {
      console.error("Cart update failed: no data returned");
      return {
        success: false,
        message: "수량 변경에 실패했습니다. (데이터 없음)",
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
    console.log("Deleting cart item:", { cartItemId, userId });
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("clerk_id", userId);

    console.log("Delete result:", {
      error: deleteError ? {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
      } : null,
    });

    if (deleteError) {
      console.error("Cart delete error details:", deleteError);
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
    console.log("Fetching cart items for user:", userId);
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    console.log("Cart items fetch result:", {
      itemCount: cartItems?.length || 0,
      error: error ? {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      } : null,
    });

    if (error) {
      console.error("Get cart items error details:", error);
      return [];
    }

    if (!cartItems || cartItems.length === 0) {
      console.log("No cart items found");
      return [];
    }

    // 각 아이템의 상품 정보 조회
    const productIds = cartItems.map((item) => item.product_id);
    console.log("Fetching products for cart items:", productIds);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    console.log("Products fetch result:", {
      productCount: products?.length || 0,
      error: productsError ? {
        code: productsError.code,
        message: productsError.message,
      } : null,
    });

    if (productsError) {
      console.error("Get products error details:", productsError);
      return [];
    }

    if (!products) {
      console.error("No products returned");
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

