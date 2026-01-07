/**
 * 🔒 API Client with Auto-Refresh Token
 *
 * این client به صورت خودکار Access Token را refresh می‌کند
 * هنگام دریافت 401 error
 */

import API_CONFIG from "@/config/api";
import { tokenStorage } from "@/lib/utils/tokenStorage";
import { createApiHeaders } from "@/lib/utils/apiHeaders";

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
  // ✅ ساخت headers با Authorization و CSRF Token
  const method = options.method?.toUpperCase() || "GET";
  const headers = createApiHeaders({
    method,
    includeCsrf: ["POST", "PUT", "PATCH", "DELETE"].includes(method),
    customHeaders: options.headers,
  });

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

    // ✅ Handle Rate Limit (429)
    if (response.status === 429) {
      const errorData = await response.json().catch(() => ({
        message: ["تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید"], // ✅ Backend همیشه string[] می‌فرستد
        code: "RATE_LIMIT_EXCEEDED",
      }));

      // ✅ گرفتن requestId از header
      const requestId = response.headers.get("X-Request-ID") || errorData.requestId;

      // ✅ اطمینان از اینکه message همیشه array است (مطابق با Backend)
      if (!Array.isArray(errorData.message)) {
        errorData.message = [errorData.message || "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید"];
      }

      // ✅ اضافه کردن requestId به errorData
      if (requestId) {
        errorData.requestId = requestId;
      }

      const error = new Error(
        Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید"
      ) as Error & {
        statusCode?: number;
        data?: any;
        code?: string;
        requestId?: string; // ✅ اضافه کردن requestId به error object
      };

      error.statusCode = 429;
      error.code = errorData.code || "RATE_LIMIT_EXCEEDED";
      error.data = errorData;
      error.requestId = requestId; // ✅ اضافه کردن requestId به error object
      throw error;
    }

    // ✅ اگر response موفق نبود، error throw کن
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: ["خطا در درخواست"], // ✅ Backend همیشه string[] می‌فرستد
      }));

      // ✅ Handle 401 - Unauthorized (Invalid token format یا expired token)
      if (response.status === 401) {
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || "خطا در احراز هویت";

        // ✅ بررسی اینکه آیا خطا مربوط به Invalid token format است
        if (
          errorMessage.includes("Invalid token format") ||
          errorMessage.includes("invalid token format") ||
          errorMessage.includes("Token format") ||
          errorData.code === "INVALID_TOKEN_FORMAT"
        ) {
          // ✅ Token format نامعتبر - پاک کردن token
          tokenStorage.clearAll();
          if (typeof window !== "undefined") {
            localStorage.removeItem("userInfo");
            window.location.href = "/";
          }
        }

        const error = new Error(errorMessage) as Error & {
          statusCode?: number;
          data?: any;
          code?: string;
          requestId?: string;
          isInvalidToken?: boolean;
        };

        error.statusCode = 401;
        error.data = errorData;
        error.code = errorData.code || "UNAUTHORIZED";
        error.isInvalidToken =
          errorMessage.includes("Invalid token format") ||
          errorData.code === "INVALID_TOKEN_FORMAT";
        throw error;
      }

      // ✅ گرفتن requestId از header
      const requestId = response.headers.get("X-Request-ID") || errorData.requestId;

      // ✅ اطمینان از اینکه message همیشه array است (مطابق با Backend)
      if (!Array.isArray(errorData.message)) {
        errorData.message = [errorData.message || "خطا در درخواست"];
      }

      // ✅ اضافه کردن requestId به errorData
      if (requestId) {
        errorData.requestId = requestId;
      }

      const error = new Error(
        Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || "خطا در درخواست"
      ) as Error & {
        statusCode?: number;
        data?: any;
        code?: string;
        requestId?: string; // ✅ اضافه کردن requestId به error object
      };

      error.statusCode = response.status;
      error.data = errorData;
      error.code = errorData.code;
      error.requestId = requestId; // ✅ اضافه کردن requestId به error object
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
