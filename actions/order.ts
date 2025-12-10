"use server";

/**
 * @file actions/order.ts
 * @description 주문 관련 Server Actions
 *
 * 주문 생성, 조회, 상태 변경 등의 작업을 처리합니다.
 * 장바구니에서 주문으로 전환 시 재고 확인 및 합계 검증을 수행합니다.
 */

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  Order,
  OrderItem,
  CreateOrderInput,
  CreateOrderResult,
  GetOrderResult,
  GetOrdersResult,
  GuestOrderLookupInput,
  GuestOrderLookupResult,
} from "@/types/order";
import type { CartItem } from "@/types/cart";

/**
 * 주문 생성
 * 장바구니 아이템을 주문으로 변환합니다.
 * 회원/비회원 모두 지원합니다.
 * 
 * 처리 순서:
 * 1. 인증 확인 (비회원인 경우 guestEmail/guestPhone 필수)
 * 2. 장바구니 아이템 조회 (비회원인 경우 클라이언트에서 전달받음)
 * 3. 재고 확인 (각 상품별)
 * 4. 합계 검증 (클라이언트 vs 서버 계산)
 * 5. orders 테이블에 주문 생성
 * 6. order_items 테이블에 주문 상세 저장
 * 7. 재고 차감
 * 8. 장바구니 비우기 (회원인 경우)
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    // 1. 인증 확인
    const { userId } = await auth();
    const isGuest = input.isGuest || !userId;

    // 비회원인 경우 이메일 또는 전화번호 필수
    if (isGuest) {
      if (!input.guestEmail && !input.guestPhone) {
        return {
          success: false,
          message: "비회원 주문 시 이메일 또는 전화번호가 필요합니다.",
        };
      }
      
      if (!input.guestCartItems || input.guestCartItems.length === 0) {
        return {
          success: false,
          message: "장바구니가 비어있습니다.",
        };
      }
    }

    // 입력 검증
    const { shippingAddress, orderNote, expectedTotal } = input;
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || 
        !shippingAddress.zipCode || !shippingAddress.address) {
      return {
        success: false,
        message: "배송지 정보를 모두 입력해주세요.",
      };
    }

    // Supabase 클라이언트 생성
    const supabase = await createClerkSupabaseClient();

    // 2. 장바구니 아이템 조회
    let cartItems: Array<{ product_id: string; quantity: number }>;
    
    if (isGuest) {
      // 비회원: 클라이언트에서 전달받은 장바구니 사용
      cartItems = input.guestCartItems!;
    } else {
      // 회원: DB에서 장바구니 조회
      const { data: dbCartItems, error: cartError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("clerk_id", userId);

      if (cartError) {
        console.error("Cart fetch error:", cartError);
        return {
          success: false,
          message: `장바구니 조회에 실패했습니다: ${cartError.message}`,
        };
      }

      if (!dbCartItems || dbCartItems.length === 0) {
        return {
          success: false,
          message: "장바구니가 비어있습니다.",
        };
      }
      
      cartItems = dbCartItems;
    }

    // 상품 정보 조회
    const productIds = cartItems.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError || !products) {
      console.error("Products fetch error:", productsError);
      return {
        success: false,
        message: `상품 정보 조회에 실패했습니다: ${productsError?.message || "데이터 없음"}`,
      };
    }

    // 상품 맵 생성
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 3. 재고 확인
    const stockErrors: string[] = [];
    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      if (!product) {
        stockErrors.push(`상품을 찾을 수 없습니다: ${item.product_id}`);
        continue;
      }
      if (!product.is_active) {
        stockErrors.push(`판매 중지된 상품입니다: ${product.name}`);
        continue;
      }
      if (product.stock_quantity < item.quantity) {
        stockErrors.push(
          `재고 부족: ${product.name} (필요: ${item.quantity}개, 재고: ${product.stock_quantity}개)`
        );
      }
    }

    if (stockErrors.length > 0) {
      return {
        success: false,
        message: stockErrors.join("\n"),
      };
    }

    // 4. 합계 검증 (클라이언트 vs 서버 계산)
    const serverTotal = cartItems.reduce((sum, item) => {
      const product = productMap.get(item.product_id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
    
    // 소수점 오차를 고려하여 비교 (1원 이내 차이는 허용)
    if (Math.abs(serverTotal - expectedTotal) > 1) {
      return {
        success: false,
        message: `주문 금액이 일치하지 않습니다. 장바구니를 다시 확인해주세요. (예상: ${expectedTotal}원, 실제: ${serverTotal}원)`,
      };
    }

    // 5. orders 테이블에 주문 생성
    const orderData: Record<string, unknown> = {
      total_amount: serverTotal,
      status: "pending",
      shipping_address: shippingAddress,
      order_note: orderNote || null,
    };
    
    if (isGuest) {
      // 비회원 주문
      orderData.clerk_id = null;
      orderData.guest_email = input.guestEmail || null;
      orderData.guest_phone = input.guestPhone || null;
    } else {
      // 회원 주문
      orderData.clerk_id = userId;
    }
    
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select("*")
      .single();

    if (orderError || !newOrder) {
      console.error("Order creation error:", orderError);
      return {
        success: false,
        message: `주문 생성에 실패했습니다: ${orderError?.message || "데이터 없음"}`,
      };
    }

    // 6. order_items 테이블에 주문 상세 저장
    const orderItems = cartItems.map((item) => {
      const product = productMap.get(item.product_id)!;
      return {
        order_id: newOrder.id,
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("Order items creation error:", orderItemsError);
      // 주문 아이템 생성 실패 시 주문 삭제 (롤백)
      await supabase.from("orders").delete().eq("id", newOrder.id);
      return {
        success: false,
        message: `주문 상세 저장에 실패했습니다: ${orderItemsError.message}`,
      };
    }

    // 7. 재고 차감
    for (const item of cartItems) {
      const product = productMap.get(item.product_id)!;
      const newStock = product.stock_quantity - item.quantity;
      
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", item.product_id);

      if (stockError) {
        console.error("Stock deduction error for product:", item.product_id, stockError);
        // 재고 차감 실패는 로그만 남기고 계속 진행 (주문은 이미 생성됨)
      }
    }

    // 8. 장바구니 비우기 (회원인 경우만)
    if (!isGuest && userId) {
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("clerk_id", userId);

      if (clearCartError) {
        console.error("Clear cart error:", clearCartError);
        // 장바구니 삭제 실패는 로그만 남기고 계속 진행 (주문은 이미 생성됨)
      }
    }

    // 생성된 주문 조회 (order_items 포함)
    const { data: completeOrder, error: fetchOrderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", newOrder.id)
      .single();

    if (fetchOrderError) {
      console.error("Fetch complete order error:", fetchOrderError);
    }

    const { data: fetchedOrderItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", newOrder.id);

    const order: Order = {
      ...completeOrder || newOrder,
      order_items: fetchedOrderItems || [],
    };

    return {
      success: true,
      message: "주문이 완료되었습니다.",
      order,
    };
  } catch (error) {
    console.error("Create order error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 네트워크 오류 처리
    if (errorMessage.includes("Failed to fetch") || 
        errorMessage.includes("NetworkError")) {
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
      };
    }
    
    return {
      success: false,
      message: `주문 생성에 실패했습니다: ${errorMessage}`,
    };
  }
}

/**
 * 주문 상세 조회
 */
export async function getOrder(orderId: string): Promise<GetOrderResult> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 주문 조회 (사용자 확인)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("clerk_id", userId)
      .single();

    if (orderError) {
      console.error("Order fetch error:", orderError);
      return {
        success: false,
        message: orderError.code === "PGRST116" 
          ? "주문을 찾을 수 없습니다." 
          : `주문 조회에 실패했습니다: ${orderError.message}`,
      };
    }

    if (!order) {
      return {
        success: false,
        message: "주문을 찾을 수 없습니다.",
      };
    }

    // 주문 상세 아이템 조회
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Order items fetch error:", itemsError);
    }

    // 상품 정보 조회 (이미지 등 추가 정보를 위해)
    if (orderItems && orderItems.length > 0) {
      const productIds = orderItems.map((item) => item.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      if (products) {
        const productMap = new Map(products.map((p) => [p.id, p]));
        orderItems.forEach((item: OrderItem) => {
          item.product = productMap.get(item.product_id);
        });
      }
    }

    return {
      success: true,
      order: {
        ...order,
        order_items: orderItems || [],
      },
    };
  } catch (error) {
    console.error("Get order error:", error);
    return {
      success: false,
      message: `주문 조회에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * 사용자의 주문 목록 조회
 */
export async function getOrders(): Promise<GetOrdersResult> {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 주문 목록 조회 (최신순)
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Orders fetch error:", ordersError);
      return {
        success: false,
        message: `주문 목록 조회에 실패했습니다: ${ordersError.message}`,
      };
    }

    return {
      success: true,
      orders: orders || [],
    };
  } catch (error) {
    console.error("Get orders error:", error);
    return {
      success: false,
      message: `주문 목록 조회에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * 장바구니 아이템 조회 (주문 생성용)
 * 상품 정보를 포함한 장바구니 아이템을 반환합니다.
 */
export async function getCartItemsForCheckout(): Promise<CartItem[]> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const supabase = await createClerkSupabaseClient();

    // 장바구니 아이템 조회
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (cartError || !cartItems) {
      console.error("Cart fetch error:", cartError);
      return [];
    }

    if (cartItems.length === 0) {
      return [];
    }

    // 상품 정보 조회
    const productIds = cartItems.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError || !products) {
      console.error("Products fetch error:", productsError);
      return [];
    }

    // 상품 맵 생성
    const productMap = new Map(products.map((p) => [p.id, p]));

    // 장바구니 아이템에 상품 정보 추가
    return cartItems
      .map((item) => ({
        ...item,
        product: productMap.get(item.product_id),
      }))
      .filter((item) => item.product) as CartItem[];
  } catch (error) {
    console.error("Get cart items for checkout error:", error);
    return [];
  }
}

/**
 * 비회원 주문 조회
 * 주문 번호 + 이메일 또는 전화번호로 주문을 조회합니다.
 */
export async function getGuestOrder(
  input: GuestOrderLookupInput
): Promise<GuestOrderLookupResult> {
  try {
    const { orderId, email, phone } = input;

    // 입력 검증
    if (!orderId) {
      return {
        success: false,
        message: "주문 번호를 입력해주세요.",
      };
    }

    if (!email && !phone) {
      return {
        success: false,
        message: "이메일 또는 전화번호를 입력해주세요.",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 주문 조회 쿼리 빌드
    let query = supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .is("clerk_id", null); // 비회원 주문만

    // 이메일 또는 전화번호로 필터링
    if (email) {
      query = query.eq("guest_email", email);
    } else if (phone) {
      query = query.eq("guest_phone", phone);
    }

    const { data: order, error: orderError } = await query.maybeSingle();

    if (orderError) {
      console.error("Guest order fetch error:", orderError);
      return {
        success: false,
        message: `주문 조회에 실패했습니다: ${orderError.message}`,
      };
    }

    if (!order) {
      return {
        success: false,
        message: "주문을 찾을 수 없습니다. 주문 번호와 연락처 정보를 확인해주세요.",
      };
    }

    // 주문 상세 아이템 조회
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Order items fetch error:", itemsError);
    }

    // 상품 정보 조회
    if (orderItems && orderItems.length > 0) {
      const productIds = orderItems.map((item) => item.product_id);
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      if (products) {
        const productMap = new Map(products.map((p) => [p.id, p]));
        orderItems.forEach((item: OrderItem) => {
          item.product = productMap.get(item.product_id);
        });
      }
    }

    return {
      success: true,
      order: {
        ...order,
        order_items: orderItems || [],
      },
    };
  } catch (error) {
    console.error("Get guest order error:", error);
    return {
      success: false,
      message: `주문 조회에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
