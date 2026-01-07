/**
 * 🔒 CSRF Token Utility
 *
 * Helper functions برای دریافت CSRF Token از Cookie
 * Backend CSRF token را در cookie با نام XSRF-TOKEN قرار می‌دهد
 */

/**
 * دریافت CSRF Token از Cookie
 * Backend token را در cookie با نام XSRF-TOKEN قرار می‌دهد
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  // ✅ Backend معمولاً CSRF token را در cookie با نام XSRF-TOKEN قرار می‌دهد
  // ✅ یا ممکن است در header Set-Cookie با نام XSRF-TOKEN ارسال شود
  const nameEQ = "XSRF-TOKEN" + "=";
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const token = c.substring(nameEQ.length, c.length);
      // ✅ Decode URL encoding (اگر backend URL encode کرده باشد)
      return decodeURIComponent(token);
    }
  }

  return null;
}

/**
 * بررسی اینکه آیا CSRF Token موجود است
 */
export function hasCsrfToken(): boolean {
  return getCsrfToken() !== null;
}
