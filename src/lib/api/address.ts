/**
 * Address API Functions
 */

import API_CONFIG from "@/config/api";

// Types
export interface Address {
  _id: string;
  userId?: string | null;
  sessionId?: string | null;
  title: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  email: string | null; // ✅ می‌تواند null باشد (همیشه در response است)
  notes: string | null; // ✅ می‌تواند null باشد (همیشه در response است)
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  title: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  mobile: string;
  email?: string | null; // ✅ اختیاری - می‌تواند null باشد
  notes?: string | null; // ✅ اختیاری - می‌تواند null باشد
  isDefault?: boolean;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {
  email?: string | null; // ✅ می‌تواند null باشد (برای حذف email)
  notes?: string | null; // ✅ می‌تواند null باشد (برای حذف notes)
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
 * دریافت لیست آدرس‌ها
 */
export async function getAddresses(): Promise<Address[]> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/site/addresses`, {
      method: "GET",
      credentials: "include", // ✅ مهم: برای ارسال Cookie
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const errorText = await response.text();
      throw new Error(errorText || "خطا در دریافت آدرس‌ها");
    }

    const result: ApiResponse<Address[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در دریافت آدرس‌ها");
  }
}

/**
 * دریافت یک آدرس خاص
 */
export async function getAddress(id: string): Promise<Address> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/addresses/${id}`,
      {
        method: "GET",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("آدرس یافت نشد");
      }
      if (response.status === 403) {
        throw new Error("دسترسی به این آدرس ندارید");
      }
      const errorText = await response.text();
      throw new Error(errorText || "خطا در دریافت آدرس");
    }

    const result: ApiResponse<Address> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching address:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در دریافت آدرس");
  }
}

/**
 * افزودن آدرس جدید
 */
export async function createAddress(data: CreateAddressDto): Promise<Address> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // ✅ Clean data: فقط فیلدهای مجاز را ارسال می‌کنیم (بدون user, userId, sessionId)
    // ✅ همه فیلدها را trim می‌کنیم
    const cleanedData: CreateAddressDto = {
      title: data.title.trim(),
      province: data.province.trim(),
      city: data.city.trim(),
      postalCode: data.postalCode.trim(),
      address: data.address.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      nationalId: data.nationalId.trim(),
      mobile: data.mobile.trim(),
    };

    // ✅ اگر email یا notes خالی باشند، null ارسال می‌کنیم (backend آن‌ها را null ذخیره می‌کند)
    if (data.email && data.email.trim() !== "") {
      cleanedData.email = data.email.trim();
    } else {
      cleanedData.email = null; // ✅ null ارسال می‌کنیم تا backend آن را null ذخیره کند
    }

    if (data.notes && data.notes.trim() !== "") {
      cleanedData.notes = data.notes.trim();
    } else {
      cleanedData.notes = null; // ✅ null ارسال می‌کنیم تا backend آن را null ذخیره کند
    }

    // ✅ isDefault اختیاری است (default: false)
    // ✅ همیشه ارسال می‌کنیم (حتی اگر false باشد) تا backend بداند
    cleanedData.isDefault = data.isDefault ?? false;

    // ✅ اطمینان از اینکه فقط فیلدهای مجاز ارسال می‌شوند (بدون user, userId, sessionId)
    const response = await fetch(`${API_CONFIG.BASE_URL}/site/addresses`, {
      method: "POST",
      credentials: "include", // ✅ برای ارسال sessionId در cookie (برای کاربران مهمان)
      headers,
      body: JSON.stringify(cleanedData), // ✅ فقط فیلدهای مجاز
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        
        // ✅ Handle MAX_ADDRESSES_EXCEEDED error
        if (errorData.code === "MAX_ADDRESSES_EXCEEDED") {
          const customError = new Error(
            errorData.message?.[0] ||
            errorData.message ||
            "بیشتر از ۲ آدرس نمی‌توانید اضافه کنید"
          ) as Error & { statusCode?: number; code?: string };
          customError.statusCode = errorData.statusCode || 400;
          customError.code = "MAX_ADDRESSES_EXCEEDED";
          throw customError;
        }
        
        const errorMessage =
          errorData.message?.[0] ||
          errorData.message ||
          (errorData.errors && errorData.errors.length > 0
            ? errorData.errors
                .map((e: { field?: string; message: string }) => e.message)
                .join(", ")
            : null) ||
          "خطا در افزودن آدرس";
        throw new Error(errorMessage);
      } catch (error) {
        // اگر error قبلاً throw شده (مثل MAX_ADDRESSES_EXCEEDED)، دوباره throw کن
        if (error instanceof Error && (error as Error & { code?: string }).code === "MAX_ADDRESSES_EXCEEDED") {
          throw error;
        }
        throw new Error(responseText || "خطا در افزودن آدرس");
      }
    }

    // Parse response
    let result: ApiResponse<Address | Address[]>;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse response:", responseText);
      throw new Error("پاسخ نامعتبر از سرور");
    }

    // Check if success is false
    if (result.success === false) {
      const errorMessage =
        result.message ||
        (result.errors && result.errors.length > 0
          ? result.errors.map((e) => e.message).join(", ")
          : null) ||
        "خطا در افزودن آدرس";
      throw new Error(errorMessage);
    }

    // Handle different response formats
    if (Array.isArray(result.data)) {
      // If data is an array, return first element or throw error if empty
      if (result.data.length === 0) {
        console.error("Backend returned empty array. Response:", result);
        throw new Error(
          "آدرس ذخیره نشد. لطفاً فیلدها را بررسی کنید و دوباره تلاش کنید."
        );
      }
      return result.data[0];
    } else if (result.data && typeof result.data === "object") {
      // If data is an object, return it
      return result.data as Address;
    } else {
      // If data is missing or invalid
      console.error("Invalid response format. Response:", result);
      throw new Error("پاسخ نامعتبر از سرور");
    }
  } catch (error) {
    console.error("Error creating address:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در افزودن آدرس");
  }
}

/**
 * به‌روزرسانی آدرس
 */
export async function updateAddress(
  id: string,
  data: UpdateAddressDto
): Promise<Address> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // ✅ Clean data: فقط فیلدهای مجاز را ارسال می‌کنیم (بدون user, userId, sessionId)
    // ✅ فقط فیلدهایی که در data هستند را ارسال می‌کنیم (partial update)
    const cleanedData: UpdateAddressDto = {};

    // ✅ فیلدهای الزامی (اگر در data هستند و string هستند)
    if (data.title !== undefined && typeof data.title === "string") {
      cleanedData.title = data.title.trim();
    }
    if (data.province !== undefined && typeof data.province === "string") {
      cleanedData.province = data.province.trim();
    }
    if (data.city !== undefined && typeof data.city === "string") {
      cleanedData.city = data.city.trim();
    }
    if (data.postalCode !== undefined && typeof data.postalCode === "string") {
      cleanedData.postalCode = data.postalCode.trim();
    }
    if (data.address !== undefined && typeof data.address === "string") {
      cleanedData.address = data.address.trim();
    }
    if (data.firstName !== undefined && typeof data.firstName === "string") {
      cleanedData.firstName = data.firstName.trim();
    }
    if (data.lastName !== undefined && typeof data.lastName === "string") {
      cleanedData.lastName = data.lastName.trim();
    }
    if (data.nationalId !== undefined && typeof data.nationalId === "string") {
      cleanedData.nationalId = data.nationalId.trim();
    }
    if (data.mobile !== undefined && typeof data.mobile === "string") {
      cleanedData.mobile = data.mobile.trim();
    }

    // ✅ اگر email در data است و خالی است، null ارسال می‌کنیم
    if ("email" in data) {
      if (data.email && data.email.trim() !== "") {
        cleanedData.email = data.email.trim();
      } else {
        cleanedData.email = null; // ✅ null ارسال می‌کنیم تا backend آن را null ذخیره کند
      }
    }

    // ✅ اگر notes در data است و خالی است، null ارسال می‌کنیم
    if ("notes" in data) {
      if (data.notes && data.notes.trim() !== "") {
        cleanedData.notes = data.notes.trim();
      } else {
        cleanedData.notes = null; // ✅ null ارسال می‌کنیم تا backend آن را null ذخیره کند
      }
    }

    // ✅ isDefault اختیاری است
    // ✅ اگر در data است، ارسال می‌کنیم (حتی اگر false باشد)
    if ("isDefault" in data) {
      cleanedData.isDefault = data.isDefault ?? false;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/addresses/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers,
        body: JSON.stringify(cleanedData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "خطا در به‌روزرسانی آدرس",
      }));
      throw new Error(errorData.message || "خطا در به‌روزرسانی آدرس");
    }

    const result: ApiResponse<Address> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating address:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در به‌روزرسانی آدرس");
  }
}

/**
 * حذف آدرس
 */
export async function deleteAddress(id: string): Promise<void> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/addresses/${id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "خطا در حذف آدرس",
      }));
      throw new Error(errorData.message || "خطا در حذف آدرس");
    }
  } catch (error) {
    console.error("Error deleting address:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در حذف آدرس");
  }
}

/**
 * تنظیم آدرس به عنوان پیش‌فرض
 */
export async function setDefaultAddress(id: string): Promise<Address> {
  try {
    const token = getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/addresses/${id}/set-default`,
      {
        method: "PATCH",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "خطا در تنظیم آدرس پیش‌فرض",
      }));
      throw new Error(errorData.message || "خطا در تنظیم آدرس پیش‌فرض");
    }

    const result: ApiResponse<Address> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error setting default address:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در تنظیم آدرس پیش‌فرض");
  }
}

/**
 * Merge آدرس‌های مهمان به کاربر (بعد از لاگین)
 * ⚠️ این endpoint فقط برای کاربران لاگین شده است
 */
export async function mergeAddresses(): Promise<Address[]> {
  try {
    const token = getToken();

    if (!token) {
      throw new Error("برای merge کردن آدرس‌ها باید لاگین باشید");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/site/addresses/merge`,
      {
        method: "POST",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "خطا در merge کردن آدرس‌ها",
      }));
      throw new Error(errorData.message || "خطا در merge کردن آدرس‌ها");
    }

    const result: ApiResponse<Address[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error merging addresses:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در merge کردن آدرس‌ها");
  }
}
