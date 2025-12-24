/**
 * Authentication API Functions
 */

import API_CONFIG from "@/config/api";
import { tokenStorage } from "@/lib/utils/tokenStorage";

// Helper function to get auth token (از tokenStorage)
function getToken(): string | null {
  return tokenStorage.getAccessToken();
}

// Helper function to check if user is logged in
export function isLoggedIn(): boolean {
  return tokenStorage.isLoggedIn();
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  code?: string; // فقط در development mode
}

interface OtpTimerResponse {
  remainingSeconds: number;
  expiresAt: string;
  isExpired: boolean;
}

interface ErrorResponse {
  statusCode?: number;
  message: string;
}

/**
 * ارسال کد OTP به شماره موبایل
 */
export async function sendOtp(phoneNumber: string): Promise<{
  success: boolean;
  message?: string;
  code?: string;
  remainingSeconds?: number;
  expiresAt?: string;
  expiresIn?: number;
}> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        phoneNumber: phoneNumber.replace(/\D/g, ""), // فقط اعداد
      }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json().catch(() => ({
        message: "خطا در ارسال کد تأیید",
      }));
      throw new Error(errorData.message || "خطا در ارسال کد تأیید");
    }

    const result: ApiResponse<{
      expiresIn?: number;
      expiresAt?: string;
      remainingSeconds?: number;
    }> = await response.json();
    return {
      success: result.success,
      message: result.message,
      code: result.code, // کد OTP در development mode
      remainingSeconds: result.data.remainingSeconds,
      expiresAt: result.data.expiresAt,
      expiresIn: result.data.expiresIn,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در ارسال کد تأیید");
  }
}

/**
 * دریافت زمان باقی‌مانده کد OTP
 */
export async function getOtpRemainingTime(
  phoneNumber: string
): Promise<OtpTimerResponse> {
  try {
    const response = await fetch(
      `${
        API_CONFIG.BASE_URL
      }/auth/otp/remaining-time?phoneNumber=${phoneNumber.replace(/\D/g, "")}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // کد OTP یافت نشد
        return {
          remainingSeconds: 0,
          expiresAt: new Date().toISOString(),
          isExpired: true,
        };
      }
      const errorData: ErrorResponse = await response.json().catch(() => ({
        message: "خطا در دریافت زمان باقی‌مانده",
      }));
      throw new Error(errorData.message || "خطا در دریافت زمان باقی‌مانده");
    }

    const result: ApiResponse<OtpTimerResponse> = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error getting OTP remaining time:", error);
    if (error instanceof Error) {
      throw error;
    }
    // در صورت خطا، فرض می‌کنیم که کد منقضی شده است
    return {
      remainingSeconds: 0,
      expiresAt: new Date().toISOString(),
      isExpired: true,
    };
  }
}

/**
 * تأیید کد OTP و ورود کاربر
 */
export async function verifyOtp(
  phoneNumber: string,
  otpCode: string // ✅ همیشه الزامی است
): Promise<{
  token: string; // ✅ Access Token
  refreshToken?: string; // ✅ Refresh Token (جدید)
  user?: {
    id: string;
    phoneNumber: string;
    firstName?: string | null;
    lastName?: string | null;
    nationalId?: string | null;
    email?: string | null;
    registrationStatus?: RegistrationStatus; // ✅ جدید
  };
  isRegistered?: boolean;
  expiresAt?: string; // ✅ جدید - ISO 8601 format
  remainingSeconds?: number; // ✅ جدید - زمان باقی‌مانده به ثانیه
}> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        phoneNumber: phoneNumber.replace(/\D/g, ""), // فقط اعداد
        otpCode: otpCode, // ✅ همیشه الزامی است
      }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse | { message: string | string[] } =
        await response.json().catch(() => ({
          message: "خطا در تأیید کد",
        }));

      // اگر message یک array است (validation errors)، آن را join کن
      let errorMessage = "خطا در تأیید کد";
      if (typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }

      throw new Error(errorMessage);
    }

    const result: ApiResponse<{
      token: string; // ✅ Access Token
      refreshToken?: string; // ✅ Refresh Token (جدید)
      user?: {
        id: string;
        phoneNumber: string;
        firstName?: string | null;
        lastName?: string | null;
        nationalId?: string | null;
        email?: string | null;
        registrationStatus?: RegistrationStatus; // ✅ جدید
      };
      isRegistered?: boolean;
      expiresAt?: string; // ✅ جدید - ISO 8601 format
      remainingSeconds?: number; // ✅ جدید - زمان باقی‌مانده به ثانیه
    }> = await response.json();

    if (!result.success || !result.data.token) {
      throw new Error("خطا در تأیید کد");
    }

    // ✅ ذخیره Access Token در memory و localStorage
    tokenStorage.setAccessToken(result.data.token);

    // ✅ ذخیره Refresh Token (اگر موجود باشد)
    if (result.data.refreshToken) {
      tokenStorage.setRefreshToken(result.data.refreshToken);
    }

    // ذخیره اطلاعات کاربر اگر موجود باشد
    if (typeof window !== "undefined") {
      if (result.data.user) {
        saveUserInfo({
          id: result.data.user.id,
          phoneNumber: result.data.user.phoneNumber,
          firstName: result.data.user.firstName || null,
          lastName: result.data.user.lastName || null,
          nationalId: result.data.user.nationalId || null,
          email: result.data.user.email || null,
          registrationStatus:
            result.data.user.registrationStatus || RegistrationStatus.Pending,
        });
      } else {
        // اگر اطلاعات کاربر کامل نبود، از API دریافت کن
        setTimeout(async () => {
          try {
            const userInfo = await getCurrentUser();
            if (userInfo) {
              saveUserInfo(userInfo);
            }
          } catch (err) {
            console.error("Error fetching user info:", err);
          }
        }, 100);
      }
    }

    return {
      token: result.data.token,
      refreshToken: result.data.refreshToken, // ✅ جدید
      user: result.data.user
        ? {
            ...result.data.user,
            registrationStatus:
              result.data.user.registrationStatus || RegistrationStatus.Pending,
          }
        : undefined,
      isRegistered: result.data.isRegistered,
      expiresAt: result.data.expiresAt, // ✅ جدید
      remainingSeconds: result.data.remainingSeconds, // ✅ جدید
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در تأیید کد");
  }
}

/**
 * تأیید کد OTP و ثبت‌نام/ورود کاربر
 */
export interface RegisterData {
  phoneNumber: string;
  otpCode: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  email?: string | null;
}

export async function register(data: RegisterData): Promise<{
  token: string; // ✅ Access Token
  refreshToken?: string; // ✅ Refresh Token (جدید)
  user?: { id: string; phoneNumber: string };
}> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        phoneNumber: data.phoneNumber.replace(/\D/g, ""), // فقط اعداد
        otpCode: data.otpCode,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        nationalId: data.nationalId.replace(/\D/g, ""), // فقط اعداد
        email: data.email && data.email.trim() ? data.email.trim() : null,
      }),
    });

    if (!response.ok) {
      let errorData: ErrorResponse | { message: string | string[] };

      try {
        errorData = await response.json();
      } catch {
        // اگر response قابل parse نبود
        errorData = {
          message: "خطا در ثبت‌نام",
        };
      }

      // اگر خطای 409 (Conflict) باشد، یعنی کاربر موجود است
      if (response.status === 409) {
        const errorMessage =
          typeof errorData.message === "string"
            ? errorData.message
            : Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : "این شماره موبایل قبلاً ثبت‌نام شده است. لطفاً وارد حساب کاربری خود شوید";

        // ایجاد یک خطای خاص برای تشخیص اینکه کاربر موجود است
        const error = new Error(errorMessage) as Error & {
          statusCode?: number;
        };
        error.statusCode = 409;
        throw error;
      }

      // اگر خطای 400 باشد (مثلاً کد OTP منقضی شده یا یافت نشد)
      if (response.status === 400) {
        const errorMessage =
          typeof errorData.message === "string"
            ? errorData.message
            : Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : "خطا در ثبت‌نام. لطفاً کد تأیید را بررسی کنید";

        // ✅ بررسی اینکه آیا خطا مربوط به کد OTP منقضی شده است
        const isOtpExpired =
          errorMessage.includes("کد تأیید منقضی شده") ||
          errorMessage.includes("منقضی شده");

        // ایجاد یک خطای خاص برای تشخیص اینکه کد OTP مشکل دارد
        const error = new Error(errorMessage) as Error & {
          statusCode?: number;
          isOtpError?: boolean;
          isOtpExpired?: boolean;
        };
        error.statusCode = 400;
        error.isOtpError =
          errorMessage.includes("کد تأیید") ||
          errorMessage.includes("کد OTP") ||
          errorMessage.includes("یافت نشد") ||
          isOtpExpired;
        error.isOtpExpired = isOtpExpired;
        throw error;
      }

      // برای سایر خطاها
      let errorMessage = "خطا در ثبت‌نام";
      if (typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }

      throw new Error(errorMessage);
    }

    const result: ApiResponse<{
      token: string; // ✅ Access Token
      refreshToken?: string; // ✅ Refresh Token (جدید)
      user?: {
        id: string;
        phoneNumber: string;
        firstName?: string;
        lastName?: string;
        nationalId?: string;
        email?: string | null;
        registrationStatus?: RegistrationStatus; // ✅ جدید
      };
    }> = await response.json();

    if (!result.success || !result.data.token) {
      throw new Error("خطا در ثبت‌نام");
    }

    // ✅ بررسی structure
    if (!result.data) {
      console.error("🔴 [register] Invalid response structure: missing data");
      throw new Error("خطا در دریافت پاسخ از سرور");
    }

    if (!result.data.token) {
      console.error("🔴 [register] Invalid response structure: missing token");
      throw new Error("خطا در دریافت token از سرور");
    }

    if (!result.data.user) {
      console.error("🔴 [register] Invalid response structure: missing user");
      throw new Error("خطا در دریافت اطلاعات کاربر از سرور");
    }

    console.log("🟢 [register] Response structure valid:", {
      hasToken: !!result.data.token,
      hasRefreshToken: !!result.data.refreshToken,
      hasUser: !!result.data.user,
      registrationStatus: result.data.user.registrationStatus,
    });

    // ✅ ذخیره Access Token در memory و localStorage
    tokenStorage.setAccessToken(result.data.token);
    console.log("🟢 [register] Access token stored in memory and localStorage");

    // ✅ ذخیره Refresh Token (اگر موجود باشد)
    if (result.data.refreshToken) {
      tokenStorage.setRefreshToken(result.data.refreshToken);
      console.log("🟢 [register] Refresh token stored");
    } else {
      console.warn("⚠️ [register] No refresh token in response!");
    }

    // ✅ بررسی که token ها ذخیره شده‌اند
    const storedAccessToken = tokenStorage.getAccessToken();
    const storedRefreshToken = tokenStorage.getRefreshToken();

    console.log("🟢 [register] Tokens verification:", {
      accessToken: storedAccessToken ? "✅ Stored" : "❌ Missing",
      refreshToken: storedRefreshToken ? "✅ Stored" : "❌ Missing",
    });

    if (!storedAccessToken) {
      console.error("🔴 [register] Access token not stored properly!");
      throw new Error("خطا در ذخیره token");
    }

    // ذخیره اطلاعات کاربر
    if (typeof window !== "undefined") {
      // ذخیره اطلاعات کاربر اگر موجود باشد
      if (result.data.user) {
        const userInfo = {
          id: result.data.user.id,
          phoneNumber: result.data.user.phoneNumber,
          firstName: result.data.user.firstName,
          lastName: result.data.user.lastName,
          nationalId: result.data.user.nationalId,
          email: result.data.user.email,
          registrationStatus:
            result.data.user.registrationStatus || RegistrationStatus.Complete,
        };

        saveUserInfo(userInfo);
        console.log("🟢 [register] User info stored:", {
          id: userInfo.id,
          phoneNumber: userInfo.phoneNumber,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          registrationStatus: userInfo.registrationStatus,
        });

        // ✅ بررسی که userInfo ذخیره شده است
        const storedUserInfo = getUserInfo();
        if (storedUserInfo) {
          console.log("🟢 [register] User info verification: ✅ Stored");
        } else {
          console.error("🔴 [register] User info not stored properly!");
        }
      }
    }

    console.log("🟢 [register] Registration successful:", {
      userId: result.data.user.id,
      registrationStatus: result.data.user.registrationStatus,
      tokensStored: !!storedAccessToken && !!storedRefreshToken,
    });

    return {
      token: result.data.token,
      refreshToken: result.data.refreshToken,
      user: result.data.user,
    };
  } catch (error) {
    console.error("Error registering:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("خطا در ثبت‌نام");
  }
}

/**
 * دریافت اطلاعات کاربر فعلی
 */
export enum RegistrationStatus {
  Pending = "pending",
  Complete = "complete",
}

export interface UserInfo {
  id: string;
  phoneNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  nationalId?: string | null;
  email?: string | null;
  registrationStatus?: RegistrationStatus; // ✅ جدید
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token نامعتبر - پاک کردن token
        await logout();
        return null;
      }
      throw new Error("خطا در دریافت اطلاعات کاربر");
    }

    const result: ApiResponse<{
      user: UserInfo;
    }> = await response.json();

    if (!result.success || !result.data.user) {
      return null;
    }

    // ذخیره اطلاعات کاربر در localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("userInfo", JSON.stringify(result.data.user));
    }

    return result.data.user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * دریافت اطلاعات کاربر از localStorage
 */
export function getUserInfo(): UserInfo | null {
  if (typeof window === "undefined") return null;

  try {
    const userInfoStr = localStorage.getItem("userInfo");
    if (!userInfoStr) return null;

    return JSON.parse(userInfoStr) as UserInfo;
  } catch (error) {
    console.error("Error parsing user info:", error);
    return null;
  }
}

/**
 * ذخیره اطلاعات کاربر در localStorage
 */
export function saveUserInfo(userInfo: UserInfo): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }
}

/**
 * ✅ دریافت اطلاعات dashboard کاربر
 * شامل: wallet balance, orders count, addresses count
 */
export interface UserDashboardInfo {
  walletBalance: number; // مبلغ کیف پول به تومان
  ordersCount: number; // تعداد سفارش‌ها
  addressesCount: number; // تعداد آدرس‌ها
  phoneNumber: string; // شماره موبایل کاربر
}

export async function getUserDashboardInfo(): Promise<UserDashboardInfo | null> {
  try {
    const token = getToken();
    if (!token) {
      return null;
    }

    // ✅ گرفتن اطلاعات از API dashboard (endpoint اصلی)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      // ✅ Handle success
      if (response.ok) {
        const result: ApiResponse<UserDashboardInfo> = await response.json();
        if (result.success && result.data) {
          // ✅ بررسی اینکه تمام فیلدهای مورد نیاز موجود هستند
          if (
            typeof result.data.walletBalance === "number" &&
            typeof result.data.ordersCount === "number" &&
            typeof result.data.addressesCount === "number" &&
            typeof result.data.phoneNumber === "string"
          ) {
            // ✅ Log برای debugging
            console.log("Dashboard data from /auth/dashboard:", {
              ordersCount: result.data.ordersCount,
              walletBalance: result.data.walletBalance,
              addressesCount: result.data.addressesCount,
            });
            return result.data;
          } else {
            console.error("Invalid dashboard data format:", result.data);
            // Fallback to individual APIs
          }
        }
      }

      // ✅ Handle 401 - Unauthorized
      if (response.status === 401) {
        // Token نامعتبر - پاک کردن token
        const errorData = await response.json().catch(() => ({
          message: ["Unauthorized"],
        }));
        console.error("Dashboard API 401 error:", errorData);
        await logout();
        return null;
      }

      // ✅ Handle 404 - کاربر یافت نشد
      if (response.status === 404) {
        const errorData = await response.json().catch(() => ({
          message: ["کاربر یافت نشد"],
        }));
        console.error("Dashboard API 404 error:", errorData);
        return null;
      }

      // ✅ Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: ["خطا در دریافت اطلاعات dashboard"],
        }));
        console.error("Dashboard API error:", errorData);
        // Fallback to individual APIs
      }
    } catch {
      // اگر endpoint وجود نداشت یا خطا رخ داد، از API های موجود استفاده می‌کنیم
      console.log("Dashboard endpoint not available, using individual APIs");
    }

    // ✅ Fallback: استفاده از API های موجود
    const [userInfo, addresses] = await Promise.all([
      getCurrentUser(),
      import("@/lib/api/address").then((m) => m.getAddresses()).catch(() => []),
    ]);

    // ✅ گرفتن تعداد سفارش‌ها (اگر endpoint وجود داشته باشد)
    let ordersCount = 0;
    try {
      const ordersResponse = await fetch(
        `${API_CONFIG.BASE_URL}/site/orders/count`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (ordersResponse.ok) {
        const ordersResult = await ordersResponse.json();
        if (ordersResult.success && ordersResult.data?.count !== undefined) {
          ordersCount = ordersResult.data.count;
          // ✅ Log برای debugging
          console.log("Orders count from /site/orders/count:", ordersCount);
        }
      }
    } catch {
      console.log("Orders count endpoint not available");
    }

    // ✅ گرفتن wallet balance (اگر endpoint وجود داشته باشد)
    let walletBalance = 0;
    try {
      const walletResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/wallet`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (walletResponse.ok) {
        const walletResult = await walletResponse.json();
        if (walletResult.success && walletResult.data?.balance !== undefined) {
          walletBalance = walletResult.data.balance;
        }
      }
    } catch {
      console.log("Wallet balance endpoint not available");
    }

    if (!userInfo) {
      return null;
    }

    return {
      walletBalance,
      ordersCount,
      addressesCount: addresses.length,
      phoneNumber: userInfo.phoneNumber,
    };
  } catch (error) {
    console.error("Error getting user dashboard info:", error);
    return null;
  }
}

/**
 * ✅ خروج از سیستم
 * درخواست logout به backend می‌فرستد (برای blacklist کردن token)
 */
export async function logout(): Promise<void> {
  try {
    const token = tokenStorage.getAccessToken();

    // ✅ درخواست logout به backend (برای blacklist کردن token)
    if (token) {
      try {
        await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
      } catch (error) {
        // حتی اگر logout failed، tokens را پاک کن
        console.error("Logout API error:", error);
      }
    }
  } catch (error) {
    // حتی اگر logout failed، tokens را پاک کن
    console.error("Logout error:", error);
  } finally {
    // ✅ پاک کردن tokens
    tokenStorage.clearAll();

    // ✅ پاک کردن userInfo
    if (typeof window !== "undefined") {
      localStorage.removeItem("userInfo");
    }
  }
}
