/**
 * Order API Functions
 */

import API_CONFIG from "@/config/api";
import { tokenStorage } from "@/lib/utils/tokenStorage";
import { createApiHeaders } from "@/lib/utils/apiHeaders";

// Types
export interface CreateOrderDto {
  cartId: string;
  addressId: string;
  shippingId: string;
}

export interface OrderResponse {
  success: boolean;
  refId: string; // ✅ Authority code از زرین‌پال
  orderId: string; // ✅ ID سفارش
  message: string; // ✅ پیام موفقیت
  paymentUrl: string | null; // ✅ URL پرداخت (می‌تواند null باشد در Mock Payment)
  finalPrice: number; // ✅ قیمت نهایی
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

    // ✅ ساخت headers با Authorization و CSRF Token
    const headers = createApiHeaders({
      method: "POST",
      includeCsrf: true,
    });

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

      // ✅ استخراج پیام خطا
      let errorMessage = "خطا در ایجاد سفارش";
      if (Array.isArray(error.message)) {
        errorMessage = error.message[0] || errorMessage;
      } else if (typeof error.message === "string") {
        errorMessage = error.message;
      }

      // ✅ بررسی اینکه آیا cart expired است
      if (
        res.status === 400 &&
        (error.code === "CART_EXPIRED" ||
          errorMessage.includes("زمان شما تمام شده است") ||
          errorMessage.includes("دسترسی به این سبد خرید ندارید"))
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

      // ✅ بررسی خطای حداقل مبلغ
      if (
        res.status === 400 &&
        (errorMessage.includes("حداقل") ||
          errorMessage.includes("1000") ||
          errorMessage.includes("1,000"))
      ) {
        throw new Error(errorMessage);
      }

      // ✅ بررسی خطاهای درگاه بانکی (422)
      if (
        res.status === 400 &&
        (errorMessage.includes("درگاه بانکی") ||
          errorMessage.includes("422") ||
          errorMessage.includes("مبلغ سفارش نامعتبر") ||
          errorMessage.includes("آدرس بازگشت نامعتبر") ||
          errorMessage.includes("شناسه پذیرنده نامعتبر"))
      ) {
        throw new Error(errorMessage);
      }

      // Handle سایر errors
      throw new Error(errorMessage);
    }

    const result: OrderResponse = await res.json();
    return result;
  } catch (error) {
    // اگر error از داخل try block throw شده باشد، آن را بدون تغییر throw کن
    throw error;
  }
}
