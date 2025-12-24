/**
 * Cart API Functions
 */

import API_CONFIG from "@/config/api";
import { GoldInfo } from "./products";
import { setSessionId, removeSessionId } from "@/lib/session";
import { ErrorCode } from "@/types/errors";

// Types
export interface Cart {
  _id: string;
  user?: string | null;
  sessionId?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  lastActivityAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemProduct {
  _id: string;
  name: string;
  slug: string;
  code: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  productType: "jewelry" | "coin" | "melted_gold";
  goldInfo?: GoldInfo;
  weight?: string; // ✅ وزن محصول از backend (مثلاً "24 گرم")
}

export interface CartItem {
  _id: string;
  product: CartItemProduct;
  quantity: number;
  size?: string;
  price: number; // ✅ قیمت کل (با تخفیف) برای quantity فعلی - از backend
  originalPrice: number; // ✅ قیمت کل اصلی (بدون تخفیف) برای quantity فعلی - از backend
  unitPrice: number; // ✅ قیمت واحد (با تخفیف) - از backend
  unitOriginalPrice: number; // ✅ قیمت واحد اصلی (بدون تخفیف) - از backend
  discount: number; // ✅ درصد تخفیف - از backend
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  totalItems: number;
  totalPrice: number;
  expiresAt: string | null;
  remainingSeconds: number;
  expired?: boolean; // ✅ نشان می‌دهد که cart منقضی شده
  sessionId?: string; // ✨ اگر Backend sessionId ایجاد کرده باشد
  prices: {
    totalWithoutDiscount: number;
    totalWithDiscount: number;
    totalSavings: number;
    savingsPercentage: number;
  };
}

// Helper function to get auth token (از tokenStorage)
import { tokenStorage } from "@/lib/utils/tokenStorage";

function getToken(): string | null {
  return tokenStorage.getAccessToken();
}

/**
 * Response خالی برای سبد
 */
function getEmptyCartResponse(): CartResponse {
  return {
    cart: null,
    items: [],
    itemCount: 0,
    totalItems: 0,
    totalPrice: 0,
    expiresAt: null,
    remainingSeconds: 0,
    prices: {
      totalWithoutDiscount: 0,
      totalWithDiscount: 0,
      totalSavings: 0,
      savingsPercentage: 0,
    },
  };
}

/**
 * Get cart from backend
 */
export async function getCart(): Promise<CartResponse | null> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    // اگر لاگین باشد، JWT Token را اضافه کن
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_CONFIG.BASE_URL}/site/cart`, {
      method: "GET",
      credentials: "include", // برای ارسال Cookie (sessionId)
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        // سبد خرید وجود ندارد یا منقضی شده
        return getEmptyCartResponse();
      }

      // Handle 403 - Forbidden (دسترسی به این سبد خرید ندارید)
      if (res.status === 403) {
        const error = await res.json().catch(() => ({
          message: "دسترسی به این سبد خرید ندارید",
        }));
        throw new Error(error.message || "دسترسی به این سبد خرید ندارید");
      }

      // Handle 401 - Unauthorized
      if (res.status === 401) {
        // اگر token نداریم، این طبیعی است - backend باید از Cookie استفاده کند
        if (!token) {
          // Backend باید برای مهمان‌ها از Cookie استفاده کند
          // اگر باز هم 401 می‌دهد، احتمالاً backend مشکل دارد
          console.warn(
            "Cart API returned 401 for guest user. Backend should use sessionId from Cookie."
          );
          return getEmptyCartResponse();
        }
        // اگر token داریم اما باز هم 401 می‌دهد، token نامعتبر است
        throw new Error("Unauthorized - Please login again");
      }

      const errorText = await res.text().catch(() => "");
      throw new Error(errorText || `Failed to fetch cart: ${res.status}`);
    }

    const data = await res.json();

    // ✨ اگر Backend sessionId ایجاد کرده باشد، آن را در Cookie ذخیره کن
    if (data.sessionId && typeof window !== "undefined") {
      setSessionId(data.sessionId);
    }

    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "خطا در دریافت سبد خرید";
    console.error("Error fetching cart:", errorMessage);
    return getEmptyCartResponse();
  }
}

/**
 * Add item to cart
 * POST /site/cart
 */
export async function addToCart(
  productId: string,
  quantity: number = 1,
  size?: string
): Promise<CartResponse> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    // اگر لاگین باشد، JWT Token را اضافه کن
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_CONFIG.BASE_URL}/site/cart`, {
      method: "POST",
      credentials: "include", // برای ارسال Cookie (sessionId)
      headers,
      body: JSON.stringify({
        productId,
        quantity,
        size,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({
        message:
          res.status === 403
            ? "دسترسی به این سبد خرید ندارید"
            : "خطا در افزودن محصول",
      }));

      // ✅ Import ErrorCode در بالای فایل اضافه شده است
      // ✅ اول چک کن که آیا خطا مربوط به OTP Required است
      if (
        res.status === 403 &&
        (error.code === "OTP_REQUIRED" ||
          error.code === ErrorCode.OTP_REQUIRED) &&
        error.requiresRegistration === true &&
        error.isAuthenticated === true &&
        error.requiresOtpVerification === true
      ) {
        // ایجاد یک خطای خاص با تمام اطلاعات
        const errorMessage = Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "لطفاً ابتدا شماره موبایل خود را تأیید کنید";

        // ✅ استفاده از Object.assign برای اطمینان از حفظ properties
        const customError = Object.assign(new Error(errorMessage), {
          statusCode: 403,
          code: ErrorCode.OTP_REQUIRED,
          data: {
            statusCode: 403,
            message: error.message,
            code: ErrorCode.OTP_REQUIRED,
            requiresRegistration: true,
            isAuthenticated: true,
            requiresOtpVerification: true,
            phoneNumber: error.phoneNumber || null,
          },
          requiresRegistration: true,
          isAuthenticated: true,
          requiresOtpVerification: true,
          phoneNumber: error.phoneNumber || null,
        }) as Error & {
          statusCode: number;
          code: ErrorCode;
          data?: any;
          requiresRegistration: boolean;
          isAuthenticated: boolean;
          requiresOtpVerification: boolean;
          phoneNumber: string | null;
        };

        throw customError;
      }

      // ✅ سپس چک کن که آیا خطا مربوط به OTP Verification Expired است
      if (
        res.status === 403 &&
        (error.code === "OTP_VERIFICATION_EXPIRED" ||
          error.code === ErrorCode.OTP_VERIFICATION_EXPIRED) &&
        error.requiresRegistration === true &&
        error.isAuthenticated === false
      ) {
        // ایجاد یک خطای خاص با تمام اطلاعات
        const errorMessage = Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message ||
            "احراز هویت شما منقضی شده است. لطفاً دوباره کد تأیید دریافت کنید";

        // ✅ استفاده از Object.assign برای اطمینان از حفظ properties
        const customError = Object.assign(new Error(errorMessage), {
          statusCode: 403,
          code: ErrorCode.OTP_VERIFICATION_EXPIRED,
          data: {
            statusCode: 403,
            message: error.message,
            code: ErrorCode.OTP_VERIFICATION_EXPIRED,
            requiresRegistration: true,
            isAuthenticated: false,
            phoneNumber: error.phoneNumber || null,
          },
          requiresRegistration: true,
          isAuthenticated: false,
          phoneNumber: error.phoneNumber || null,
        }) as Error & {
          statusCode: number;
          code: ErrorCode;
          data?: any;
          requiresRegistration: boolean;
          isAuthenticated: boolean;
          phoneNumber: string | null;
        };

        throw customError;
      }

      // ✅ سپس چک کن که آیا خطا مربوط به Incomplete Registration است
      if (
        res.status === 403 &&
        (error.code === "INCOMPLETE_REGISTRATION" ||
          error.code === ErrorCode.INCOMPLETE_REGISTRATION) &&
        error.requiresRegistration === true &&
        error.isAuthenticated === true
      ) {
        // ایجاد یک خطای خاص با تمام اطلاعات
        const errorMessage = Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "لطفاً ابتدا اطلاعات تکمیلی خود را کامل کنید";

        // ✅ استفاده از Object.assign برای اطمینان از حفظ properties
        const customError = Object.assign(new Error(errorMessage), {
          statusCode: 403,
          code: ErrorCode.INCOMPLETE_REGISTRATION,
          data: {
            statusCode: 403,
            message: error.message,
            code: ErrorCode.INCOMPLETE_REGISTRATION,
            requiresRegistration: true,
            isAuthenticated: true,
            phoneNumber: error.phoneNumber || null,
          },
          requiresRegistration: true,
          isAuthenticated: true,
          phoneNumber: error.phoneNumber || null,
        }) as Error & {
          statusCode: number;
          code: ErrorCode;
          data?: any;
          requiresRegistration: boolean;
          isAuthenticated: boolean;
          phoneNumber: string | null;
        };

        throw customError;
      }

      // سایر خطاها
      const errorMessage = Array.isArray(error.message)
        ? error.message.join(", ")
        : error.message ||
          (res.status === 403
            ? "دسترسی به این سبد خرید ندارید"
            : "خطا در افزودن محصول");

      throw new Error(errorMessage);
    }

    const data = await res.json();

    // ✨ اگر Backend sessionId ایجاد کرده باشد، آن را در Cookie ذخیره کن
    if (data.sessionId && typeof window !== "undefined") {
      setSessionId(data.sessionId);
    }

    return data;
  } catch (error) {
    // ✅ اگر error از داخل try block throw شده باشد (مثل OTP_REQUIRED, INCOMPLETE_REGISTRATION)
    // آن را بدون تغییر throw کن
    // فقط برای خطاهای network یا غیرمنتظره console.error بزن
    const errorWithDetails = error as Error & {
      code?: string;
      statusCode?: number;
      requiresRegistration?: boolean;
      isAuthenticated?: boolean;
      requiresOtpVerification?: boolean;
      phoneNumber?: string | null;
    };

    // ✅ اگر OTP_REQUIRED است، بدون console.error throw کن
    if (
      error instanceof Error &&
      (errorWithDetails?.code === "OTP_REQUIRED" ||
        errorWithDetails?.code === ErrorCode.OTP_REQUIRED)
    ) {
      // ✅ این یک flow عادی است - خطا را نمایش نده
      // ✅ مطمئن شو که properties حفظ می‌شوند
      throw error;
    }

    // ✅ اگر INCOMPLETE_REGISTRATION است، بدون console.error throw کن
    if (
      error instanceof Error &&
      (errorWithDetails?.code === "INCOMPLETE_REGISTRATION" ||
        errorWithDetails?.code === ErrorCode.INCOMPLETE_REGISTRATION)
    ) {
      // ✅ این یک flow عادی است - خطا را نمایش نده
      // ✅ مطمئن شو که properties حفظ می‌شوند
      throw error;
    }

    // ✅ فقط برای خطاهای دیگر console.error بزن
    console.error("Error adding to cart:", error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<CartResponse> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${API_CONFIG.BASE_URL}/site/cart/items/${itemId}`,
      {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify({ quantity }),
      }
    );

    if (!res.ok) {
      // Handle 403 - Forbidden (دسترسی ندارید یا آیتم متعلق به این سبد نیست)
      if (res.status === 403) {
        const error = await res.json().catch(() => ({
          message:
            "دسترسی به این سبد خرید ندارید یا این آیتم متعلق به این سبد نیست",
        }));
        throw new Error(
          error.message ||
            "دسترسی به این سبد خرید ندارید یا این آیتم متعلق به این سبد نیست"
        );
      }

      const error = await res.json().catch(() => ({
        message: "خطا در به‌روزرسانی محصول",
      }));
      throw new Error(error.message || "خطا در به‌روزرسانی محصول");
    }

    const data = await res.json();

    // ✨ اگر Backend sessionId ایجاد کرده باشد، آن را در Cookie ذخیره کن
    if (data.sessionId && typeof window !== "undefined") {
      setSessionId(data.sessionId);
    }

    return data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: string): Promise<CartResponse> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${API_CONFIG.BASE_URL}/site/cart/items/${itemId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers,
      }
    );

    if (!res.ok) {
      // Handle 403 - Forbidden (دسترسی ندارید یا آیتم متعلق به این سبد نیست)
      if (res.status === 403) {
        const error = await res.json().catch(() => ({
          message:
            "دسترسی به این سبد خرید ندارید یا این آیتم متعلق به این سبد نیست",
        }));
        throw new Error(
          error.message ||
            "دسترسی به این سبد خرید ندارید یا این آیتم متعلق به این سبد نیست"
        );
      }

      const error = await res.json().catch(() => ({
        message: "خطا در حذف محصول",
      }));
      throw new Error(error.message || "خطا در حذف محصول");
    }

    const data = await res.json();

    // ✨ اگر Backend sessionId ایجاد کرده باشد، آن را در Cookie ذخیره کن
    if (data.sessionId && typeof window !== "undefined") {
      setSessionId(data.sessionId);
    }

    return data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

/**
 * Merge guest cart to user account
 * ⚠️ باید بعد از لاگین صدا زده شود
 */
export async function mergeCart(): Promise<CartResponse> {
  try {
    const token = getToken();

    if (!token) {
      throw new Error("برای merge کردن سبد، باید لاگین باشید");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${API_CONFIG.BASE_URL}/site/cart/merge`, {
      method: "POST",
      credentials: "include", // برای ارسال Cookie (sessionId مهمان)
      headers,
    });

    if (!res.ok) {
      // Handle 403 - Forbidden
      if (res.status === 403) {
        const error = await res.json().catch(() => ({
          message: "دسترسی به این سبد خرید ندارید",
        }));
        throw new Error(error.message || "دسترسی به این سبد خرید ندارید");
      }

      const error = await res.json().catch(() => ({
        message: "خطا در merge کردن سبد",
      }));
      throw new Error(error.message || "خطا در merge کردن سبد");
    }

    const result = await res.json();

    // بعد از merge موفق، sessionId را حذف کن
    removeSessionId();

    return result;
  } catch (error) {
    console.error("Error merging cart:", error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<void> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_CONFIG.BASE_URL}/site/cart`, {
      method: "DELETE",
      credentials: "include",
      headers,
    });

    if (!res.ok) {
      // Handle 403 - Forbidden
      if (res.status === 403) {
        const error = await res.json().catch(() => ({
          message: "دسترسی به این سبد خرید ندارید",
        }));
        throw new Error(error.message || "دسترسی به این سبد خرید ندارید");
      }

      const error = await res.json().catch(() => ({
        message: "خطا در پاک کردن سبد خرید",
      }));
      throw new Error(error.message || "خطا در پاک کردن سبد خرید");
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}
