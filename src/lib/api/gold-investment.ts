/**
 * Gold Investment API Functions
 */

import API_CONFIG from "@/config/api";

export interface AddGoldToCartResponse {
  success: boolean;
  message: string;
  data: {
    cartItem: {
      _id: string;
      product: {
        _id: string;
        name: string;
        slug: string;
        code: string;
        price: number;
        images: string[];
        stock: number;
        productType: "melted_gold";
        goldInfo: {
          weight: number;
          purity: string;
        };
      };
      quantity: number;
      price: number;
      originalPrice: number;
      unitPrice: number;
      unitOriginalPrice: number;
      discount: number;
      createdAt: string;
      updatedAt: string;
    };
    grams: number; // مقدار به گرم (برای سازگاری)
    milligrams: number; // ✅ مقدار به میلی‌گرم (عدد صحیح)
    goldPricePerGram: number; // ✅ قیمت لحظه‌ای 18 عیار
    calculatedAmount: number; // ✅ مبلغ نهایی (شامل کارمزد)
    commissionAmount: number; // ✅ کارمزد محاسبه شده (تومان)
    originalAmount: number; // ✅ مبلغ اصلی (بدون کارمزد)
  };
}

export interface AddGoldToCartDto {
  amount: number; // مبلغ به تومان (حداقل 1,000,000)
}

// ✨ Interface جدید برای Purchase (جدا از Cart)
export interface GoldPurchaseResponse {
  purchase: {
    _id: string;
    karat: number; // ✅ عیار طلا (معمولاً 18)
    originalAmount: number;
    commissionAmount: number;
    calculatedAmount: number;
    goldPricePerGram: number;
    grams: number;
    milligrams: number;
    commissionType: "percentage" | "fixed" | "none";
    commissionValue: number;
    lastActivityAt: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  };
  totalGrams: number;
  totalMilligrams: number;
  totalAmount: number;
  expiresAt: string;
  remainingSeconds: number;
}

export interface GoldInvestmentInfo {
  minAmount: number; // حداقل مبلغ خرید (تومان)
  maxAmount: number; // حداکثر مبلغ خرید (تومان)
  commission?: number; // کارمزد خرید (درصد) - اختیاری
  commissionAmount?: number; // کارمزد خرید (مبلغ ثابت) - اختیاری
  restrictionsLink?: string; // لینک محدودیت‌های خرید و فروش (اختیاری)
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Helper function to get auth token (از tokenStorage)
import { tokenStorage } from "@/lib/utils/tokenStorage";

function getToken(): string | null {
  return tokenStorage.getAccessToken();
}

/**
 * افزودن طلا به سبد خرید بر اساس مبلغ
 */
export async function addGoldToCart(
  data: AddGoldToCartDto
): Promise<AddGoldToCartResponse> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/gold-investment/add-to-cart`,
      {
        method: "POST",
        credentials: "include", // ✅ مهم: برای ارسال Cookie
        headers,
        body: JSON.stringify(data),
      }
    );

    // Parse response
    const responseText = await response.text();
    let result: ApiResponse<AddGoldToCartResponse["data"]> & {
      statusCode?: number;
    };

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("پاسخ نامعتبر از سرور");
    }

    if (!response.ok) {
      // Handle specific error types
      if (response.status === 429) {
        // Rate limit رسیده
        throw new Error(
          "درخواست‌های زیادی ارسال شده است. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید."
        );
      }

      if (response.status === 500 || response.status === 503) {
        // خطا در API قیمت طلا
        throw new Error(
          "خطا در دریافت قیمت لحظه‌ای طلا. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید."
        );
      }

      // Handle validation errors (400) - شامل حداقل/حداکثر مبلغ
      if (response.status === 400) {
        // اگر پیام خطا در response موجود باشد، از آن استفاده می‌کنیم
        if (result.message) {
          throw new Error(result.message);
        }
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map((e) => e.message).join(", ");
          throw new Error(errorMessages);
        }
        throw new Error("مبلغ وارد شده معتبر نیست");
      }

      // Generic error
      throw new Error(result.message || "خطا در افزودن طلا به سبد خرید");
    }

    if (!result.success) {
      throw new Error(result.message || "خطا در افزودن طلا به سبد خرید");
    }

    return {
      success: true,
      message: result.message || "طلا با موفقیت به سبد خرید اضافه شد",
      data: result.data,
    };
  } catch (error) {
    console.error("Error adding gold to cart:", error);

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "خطا در اتصال به سرور. لطفاً اتصال اینترنت را بررسی کنید."
      );
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در افزودن طلا به سبد خرید");
  }
}

/**
 * دریافت اطلاعات خرید طلا (حداقل/حداکثر، کارمزد)
 */
export async function getGoldInvestmentInfo(): Promise<GoldInvestmentInfo> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GOLD_INVESTMENT_INFO}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseText = await response.text();
    let result: ApiResponse<GoldInvestmentInfo>;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("پاسخ نامعتبر از سرور");
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "خطا در دریافت اطلاعات خرید طلا");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching gold investment info:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "خطا در اتصال به سرور. لطفاً اتصال اینترنت را بررسی کنید."
      );
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در دریافت اطلاعات خرید طلا");
  }
}

/**
 * ✨ افزودن طلای آب شده به purchase (جدا از Cart)
 */
export async function addGoldToPurchase(
  amount: number
): Promise<GoldPurchaseResponse> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/gold-investment/purchase`,
      {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ amount }),
      }
    );

    const responseText = await response.text();
    let result: ApiResponse<GoldPurchaseResponse> & {
      statusCode?: number;
    };

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("پاسخ نامعتبر از سرور");
    }

    if (!response.ok) {
      // Handle 403 - Forbidden (ممکن است مربوط به OTP Verification Expired یا Incomplete Registration باشد)
      if (response.status === 403) {
        // ✅ اول چک کن که آیا خطا مربوط به OTP Verification Expired است
        if (
          result.code === "OTP_VERIFICATION_EXPIRED" &&
          result.requiresRegistration === true &&
          result.isAuthenticated === false
        ) {
          const errorMessage = Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message ||
              "احراز هویت شما منقضی شده است. لطفاً دوباره کد تأیید دریافت کنید";

          const customError = new Error(errorMessage) as Error & {
            statusCode?: number;
            code?: string;
            requiresRegistration?: boolean;
            isAuthenticated?: boolean;
            phoneNumber?: string | null;
          };
          customError.statusCode = 403;
          customError.code = "OTP_VERIFICATION_EXPIRED";
          customError.requiresRegistration = true;
          customError.isAuthenticated = false;
          customError.phoneNumber = result.phoneNumber || null;
          throw customError;
        }

        // ✅ سپس چک کن که آیا خطا مربوط به Incomplete Registration است
        if (
          result.code === "INCOMPLETE_REGISTRATION" &&
          result.requiresRegistration === true &&
          result.isAuthenticated === true
        ) {
          const errorMessage = Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message || "لطفاً ابتدا اطلاعات تکمیلی خود را کامل کنید";

          const customError = new Error(errorMessage) as Error & {
            statusCode?: number;
            code?: string;
            requiresRegistration?: boolean;
            isAuthenticated?: boolean;
            phoneNumber?: string | null;
          };
          customError.statusCode = 403;
          customError.code = "INCOMPLETE_REGISTRATION";
          customError.requiresRegistration = true;
          customError.isAuthenticated = true;
          customError.phoneNumber = result.phoneNumber || null;
          throw customError;
        }

        // سایر خطاهای 403
        const errorMessage = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "دسترسی به این عملیات ندارید";
        throw new Error(errorMessage);
      }

      if (response.status === 429) {
        throw new Error(
          "درخواست‌های زیادی ارسال شده است. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید."
        );
      }

      if (response.status === 500 || response.status === 503) {
        throw new Error(
          "خطا در دریافت قیمت لحظه‌ای طلا. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید."
        );
      }

      if (response.status === 400) {
        if (result.message) {
          const errorMessage = Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message;
          throw new Error(errorMessage);
        }
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map((e) => e.message).join(", ");
          throw new Error(errorMessages);
        }
        throw new Error("مبلغ وارد شده معتبر نیست");
      }

      const errorMessage = Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message || "خطا در افزودن طلا به purchase";
      throw new Error(errorMessage);
    }

    if (!result.success) {
      throw new Error(result.message || "خطا در افزودن طلا به purchase");
    }

    if (!result.data) {
      throw new Error("ساختار response نامعتبر است");
    }

    return result.data;
  } catch (error) {
    console.error("Error adding gold to purchase:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "خطا در اتصال به سرور. لطفاً اتصال اینترنت را بررسی کنید."
      );
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در افزودن طلا به purchase");
  }
}

/**
 * ✨ دریافت purchase فعلی
 */
export async function getGoldPurchase(): Promise<GoldPurchaseResponse | null> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/gold-investment/purchase`,
      {
        method: "GET",
        credentials: "include",
        headers,
      }
    );

    const responseText = await response.text();
    let result: ApiResponse<GoldPurchaseResponse | null>;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("پاسخ نامعتبر از سرور");
    }

    if (!response.ok) {
      throw new Error(result.message || "خطا در دریافت purchase");
    }

    if (!result.success) {
      throw new Error(result.message || "خطا در دریافت purchase");
    }

    return result.data || null;
  } catch (error) {
    console.error("Error fetching gold purchase:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "خطا در اتصال به سرور. لطفاً اتصال اینترنت را بررسی کنید."
      );
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در دریافت purchase");
  }
}

/**
 * ✨ پاک کردن purchase
 */
export async function clearGoldPurchase(): Promise<void> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/gold-investment/purchase/clear`,
      {
        method: "POST",
        credentials: "include",
        headers,
      }
    );

    const responseText = await response.text();
    let result: ApiResponse<null>;

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error("پاسخ نامعتبر از سرور");
    }

    if (!response.ok) {
      throw new Error(result.message || "خطا در پاک کردن purchase");
    }

    if (!result.success) {
      throw new Error(result.message || "خطا در پاک کردن purchase");
    }
  } catch (error) {
    console.error("Error clearing gold purchase:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "خطا در اتصال به سرور. لطفاً اتصال اینترنت را بررسی کنید."
      );
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در پاک کردن purchase");
  }
}
