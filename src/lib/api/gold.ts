/**
 * Gold Price API Functions
 */

import API_CONFIG from "@/config/api";

export interface GoldPrice {
  price: number; // قیمت هر گرم طلا به تومان
  lastUpdated?: string; // تاریخ آخرین به‌روزرسانی
}

interface GoldPriceApiResponse {
  success: boolean;
  message?: string;
  data: {
    pricePerGram: number;
    date?: string;
    lastUpdated?: string;
  };
}

/**
 * دریافت قیمت لحظه‌ای طلا (18 عیار)
 */
export async function getGoldPrice(karat: number = 18): Promise<GoldPrice> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GOLD_PRICE_LATEST}?karat=${karat}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "خطا در دریافت قیمت طلا";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: GoldPriceApiResponse = await response.json();

    // ✅ بررسی اینکه آیا result.success false است
    if (!result.success) {
      throw new Error(
        result.message || "قیمت طلا در دسترس نیست. لطفاً بعداً تلاش کنید."
      );
    }

    // ✅ بررسی اینکه آیا result.data موجود است
    if (!result.data) {
      throw new Error("قیمت طلا در دسترس نیست. لطفاً بعداً تلاش کنید.");
    }

    // ✅ بررسی اینکه آیا pricePerGram موجود است
    if (
      result.data.pricePerGram === undefined ||
      result.data.pricePerGram === null
    ) {
      throw new Error("قیمت طلا در دسترس نیست. لطفاً بعداً تلاش کنید.");
    }

    return {
      price: result.data.pricePerGram,
      lastUpdated: result.data.date || result.data.lastUpdated,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "خطا در اتصال به سرور. لطفاً اتصال اینترنت و سرور را بررسی کنید."
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در دریافت قیمت طلا");
  }
}
