/**
 * Session Management Utility
 * برای مدیریت sessionId در Cookie (برای کاربران مهمان)
 * ⚠️ مهم: Backend خودش sessionId ایجاد می‌کند. Frontend فقط باید آن را از response بگیرد و ذخیره کند.
 */

const SESSION_ID_KEY = "sessionId";
const SESSION_ID_EXPIRY_DAYS = 30; // 30 روز

/**
 * دریافت sessionId از Cookie
 * ⚠️ مهم: اگر sessionId وجود نداشت، null برگردان
 * Backend خودش sessionId ایجاد می‌کند و در response برمی‌گرداند
 */
export function getSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return getCookie(SESSION_ID_KEY);
}

/**
 * ذخیره sessionId در Cookie
 * این متد باید بعد از دریافت response از Backend صدا زده شود
 */
export function setSessionId(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  setCookie(SESSION_ID_KEY, sessionId, SESSION_ID_EXPIRY_DAYS);
}

/**
 * حذف sessionId (بعد از merge)
 */
export function removeSessionId(): void {
  if (typeof window === "undefined") {
    return;
  }
  deleteCookie(SESSION_ID_KEY);
}

/**
 * Helper: دریافت Cookie
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * Helper: تنظیم Cookie
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  const isProduction = process.env.NODE_ENV === "production";

  // تنظیم Cookie با تنظیمات صحیح
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${
    isProduction ? ";Secure" : ""
  }`;

  document.cookie = cookieString;

  // بررسی اینکه Cookie به درستی set شده است (فقط در development)
  if (process.env.NODE_ENV !== "production") {
    const savedValue = getCookie(name);
    if (savedValue !== value) {
      console.warn(
        `Cookie ${name} ممکن است به درستی set نشده باشد. Expected: ${value}, Got: ${savedValue}`
      );
    }
  }
}

/**
 * Helper: حذف Cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}
