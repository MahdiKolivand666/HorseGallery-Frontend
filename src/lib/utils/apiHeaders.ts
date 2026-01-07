/**
 * 🔒 API Headers Utility
 *
 * Helper function برای ساخت headers با Authorization و CSRF Token
 */

import { tokenStorage } from "./tokenStorage";
import { getCsrfToken } from "./csrf";

export interface ApiHeadersOptions {
  method?: string;
  includeCsrf?: boolean; // ✅ برای POST/PUT/PATCH/DELETE باید true باشد
  customHeaders?: HeadersInit;
}

/**
 * ساخت headers برای API requests
 *
 * @param options - تنظیمات headers
 * @returns HeadersInit object با Authorization و CSRF Token (در صورت نیاز)
 */
export function createApiHeaders(options: ApiHeadersOptions = {}): HeadersInit {
  const { method = "GET", includeCsrf, customHeaders = {} } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // ✅ اضافه کردن custom headers
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, customHeaders);
    }
  }

  // ✅ اضافه کردن Authorization Token
  const token = tokenStorage.getAccessToken();
  if (token) {
    // ✅ بررسی فرمت Token قبل از ارسال
    if (!tokenStorage.isValidTokenFormat(token)) {
      // ✅ Token format نامعتبر - پاک کردن token
      tokenStorage.clearAll();
      if (typeof window !== "undefined") {
        localStorage.removeItem("userInfo");
        window.location.href = "/";
      }
      throw new Error("Token نامعتبر است. لطفاً دوباره وارد شوید");
    }

    headers["Authorization"] = `Bearer ${token}`;
  }

  // ✅ اضافه کردن CSRF Token برای POST/PUT/PATCH/DELETE
  const shouldIncludeCsrf =
    includeCsrf !== undefined
      ? includeCsrf
      : ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());

  if (shouldIncludeCsrf) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  return headers as HeadersInit;
}
