/**
 * Location API Functions
 * API برای دریافت استان‌ها و شهرهای ایران
 */

import API_CONFIG from "@/config/api";

// Types
export interface Province {
  _id: string;
  externalId: number;
  name: string;
}

export interface City {
  _id: string;
  externalId: number;
  name: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * دریافت لیست همه استان‌ها
 */
export async function getProvinces(): Promise<Province[]> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/locations/provinces`,
      {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "خطا در دریافت استان‌ها");
    }

    const result: ApiResponse<Province[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "خطا در دریافت استان‌ها");
    }

    return result.data || [];
  } catch (error) {
    console.error("Error fetching provinces:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در دریافت استان‌ها");
  }
}

/**
 * دریافت لیست شهرهای یک استان
 * @param provinceId - MongoDB ObjectId استان (اختیاری)
 * @param provinceExternalId - External ID استان (اختیاری)
 * @param provinceName - نام استان (اختیاری)
 */
export async function getCities(
  options: {
    provinceId?: string;
    provinceExternalId?: number;
    provinceName?: string;
  }
): Promise<City[]> {
  try {
    const { provinceId, provinceExternalId, provinceName } = options;

    // بررسی اینکه حداقل یکی از پارامترها ارسال شده باشد
    if (!provinceId && provinceExternalId === undefined && !provinceName) {
      throw new Error(
        "لطفاً یکی از پارامترهای provinceId، provinceExternalId یا provinceName را ارسال کنید"
      );
    }

    // ساخت query parameters
    const queryParams = new URLSearchParams();
    if (provinceId) {
      queryParams.append("provinceId", provinceId);
    }
    if (provinceExternalId !== undefined) {
      queryParams.append("provinceExternalId", provinceExternalId.toString());
    }
    if (provinceName) {
      queryParams.append("provinceName", provinceName);
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/locations/cities?${queryParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "خطا در دریافت شهرها");
    }

    const result: ApiResponse<City[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "خطا در دریافت شهرها");
    }

    // ✅ بررسی اینکه data وجود دارد
    if (!result.data) {
      return [];
    }

    // ✅ بررسی اینکه data array است
    if (!Array.isArray(result.data)) {
      return [];
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در دریافت شهرها");
  }
}

