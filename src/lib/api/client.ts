/**
 * 🔒 API Client with Auto-Refresh Token
 *
 * این client به صورت خودکار Access Token را refresh می‌کند
 * هنگام دریافت 401 error
 */

import API_CONFIG from "@/config/api";
import { tokenStorage } from "@/lib/utils/tokenStorage";

// ✅ Request queue برای retry بعد از refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * ✅ Refresh Access Token
 */
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const result = await response.json();

    // ✅ طبق مستندات backend: response می‌تواند access_token یا data.token داشته باشد
    let newAccessToken: string | null = null;

    if (result.access_token) {
      // ✅ فرمت جدید: { success: true, access_token: "..." }
      newAccessToken = result.access_token;
    } else if (result.success && result.data?.token) {
      // ✅ فرمت قدیمی: { success: true, data: { token: "..." } }
      newAccessToken = result.data.token;
    } else if (result.data?.access_token) {
      // ✅ فرمت جایگزین: { success: true, data: { access_token: "..." } }
      newAccessToken = result.data.access_token;
    }

    if (!newAccessToken) {
      throw new Error("Invalid refresh response: access_token not found");
    }

    tokenStorage.setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    // ✅ اگر refresh failed، tokens را پاک کن
    tokenStorage.clearAll();
    throw error;
  }
}

/**
 * ✅ API Request با auto-refresh
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.getAccessToken();

  // ✅ اضافه کردن Access Token به header
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // ✅ اگر 401 error و هنوز retry نکرده‌ایم
    if (response.status === 401 && token && !(options as any)._retry) {
      // ✅ اگر در حال refresh هستیم، request را در queue قرار بده
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            // ✅ Retry با token جدید
            return apiRequest<T>(endpoint, {
              ...options,
              headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // ✅ شروع refresh
      isRefreshing = true;
      (options as any)._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        // ✅ Process queue
        processQueue(null, newAccessToken);

        // ✅ Retry original request
        return apiRequest<T>(endpoint, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        });
      } catch (refreshError) {
        // ✅ اگر refresh failed، queue را reject کن
        processQueue(refreshError, null);

        // ✅ Redirect به login
        if (typeof window !== "undefined") {
          // پاک کردن userInfo هم
          localStorage.removeItem("userInfo");
          window.location.href = "/";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ اگر response موفق نبود، error throw کن
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "خطا در درخواست",
      }));

      const error = new Error(
        typeof errorData.message === "string"
          ? errorData.message
          : Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : "خطا در درخواست"
      ) as Error & { statusCode?: number; data?: any };

      error.statusCode = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    // ✅ اگر network error یا error دیگر
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در درخواست");
  }
}
