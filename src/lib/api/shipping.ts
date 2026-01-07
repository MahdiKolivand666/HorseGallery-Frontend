/**
 * Shipping Methods API Functions
 */

import API_CONFIG from "@/config/api";

// Types
export interface ShippingMethod {
  _id: string; // MongoDB ObjectId
  name: string; // نام روش ارسال (همان title)
  title: string; // نام روش ارسال
  description: string | null; // توضیحات (می‌تواند null باشد)
  cost: number; // هزینه ارسال (تومان) - همان price
  price: number; // هزینه ارسال (تومان)
  estimatedDays: number | null; // تعداد روزهای تخمینی (می‌تواند null باشد)
  isActive: boolean; // آیا فعال است
  isDefault: boolean; // آیا روش پیش‌فرض است
  freeShippingThreshold: number | null; // حداقل مبلغ برای ارسال رایگان (می‌تواند null باشد)
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * دریافت لیست Shipping Methods
 * GET /site/shipping/methods
 */
export async function getShippingMethods(): Promise<ShippingMethod[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/shipping/methods`,
      {
        method: "GET",
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "خطا در دریافت روش‌های ارسال",
      }));

      const errorMessage = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || "خطا در دریافت روش‌های ارسال";

      throw new Error(errorMessage);
    }

    const result: ApiResponse<ShippingMethod[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "خطا در دریافت روش‌های ارسال");
    }

    // ✅ فیلتر کردن فقط shipping methods فعال
    return (result.data || []).filter((method) => method.isActive);
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در دریافت روش‌های ارسال");
  }
}

/**
 * دریافت Shipping Method با ID
 * @param id - MongoDB ObjectId
 */
export async function getShippingMethodById(
  id: string
): Promise<ShippingMethod | null> {
  try {
    // ✅ Validation: بررسی فرمت MongoDB ID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error("Invalid shipping method ID format");
    }

    const methods = await getShippingMethods();
    return methods.find((method) => method._id === id) || null;
  } catch (error) {
    console.error("Error fetching shipping method by ID:", error);
    return null;
  }
}

/**
 * دریافت Shipping Method پیش‌فرض
 */
export async function getDefaultShippingMethod(): Promise<ShippingMethod | null> {
  try {
    const methods = await getShippingMethods();
    return methods.find((method) => method.isDefault) || methods[0] || null;
  } catch (error) {
    console.error("Error fetching default shipping method:", error);
    return null;
  }
}
