/**
 * Order API Functions
 */

import API_CONFIG from "@/config/api";
import { tokenStorage } from "@/lib/utils/tokenStorage";

// Types
export interface CreateOrderDto {
  cartId: string;
  addressId: string;
  shippingId: string;
}

export interface OrderResponse {
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    paymentUrl?: string;
    // ... سایر فیلدهای order
  };
  message?: string;
}

// Helper function to get auth token
function getToken(): string | null {
  return tokenStorage.getAccessToken();
}

/**
 * ایجاد سفارش از سبد خرید
 * POST /site/order
 */
export async function createOrder(
  data: CreateOrderDto
): Promise<OrderResponse> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("برای ایجاد سفارش باید وارد شوید");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${API_CONFIG.BASE_URL}/site/order`, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message: ["خطا در ایجاد سفارش"],
        statusCode: res.status,
        code: "ORDER_ERROR",
      }));

      // ✅ بررسی اینکه آیا cart expired است
      if (
        res.status === 400 &&
        (error.code === "CART_EXPIRED" ||
          (Array.isArray(error.message) &&
            error.message.some((msg: string) =>
              msg.includes("زمان شما تمام شده است")
            )) ||
          (typeof error.message === "string" &&
            error.message.includes("زمان شما تمام شده است")))
      ) {
        // ✅ ایجاد یک خطای خاص برای cart expired
        const expiredError = new Error(
          "زمان شما تمام شده است. لطفاً مجدداً محصول را به سبد خرید اضافه کنید"
        ) as Error & {
          statusCode: number;
          code: string;
          isCartExpired: boolean;
        };
        expiredError.statusCode = 400;
        expiredError.code = "CART_EXPIRED";
        expiredError.isCartExpired = true;
        throw expiredError;
      }

      // Handle سایر errors
      const errorMessage = Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message || "خطا در ایجاد سفارش";
      throw new Error(errorMessage);
    }

    const result: OrderResponse = await res.json();
    return result;
  } catch (error) {
    // اگر error از داخل try block throw شده باشد، آن را بدون تغییر throw کن
    throw error;
  }
}

