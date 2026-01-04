/**
 * Type definitions for API errors
 */

// ✅ Error Codes Enum (مطابق با Backend)
export enum ErrorCode {
  // Validation Errors
  VALIDATION_ERROR = "VALIDATION_ERROR",

  // Authentication Errors
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // Registration Errors
  INCOMPLETE_REGISTRATION = "INCOMPLETE_REGISTRATION",
  OTP_REQUIRED = "OTP_REQUIRED",
  OTP_VERIFICATION_EXPIRED = "OTP_VERIFICATION_EXPIRED",
  OTP_EXPIRED = "OTP_EXPIRED",
  OTP_INVALID = "OTP_INVALID",

  // Resource Errors
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Server Errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

export interface IncompleteRegistrationError {
  statusCode: 403;
  message: string[]; // ✅ Backend همیشه string[] می‌فرستد
  code: ErrorCode.INCOMPLETE_REGISTRATION;
  requiresRegistration: true;
  isAuthenticated: true;
  phoneNumber: string | null;
  timestamp?: string;
  path?: string;
  method?: string;
  requestId?: string; // ✅ Request ID برای tracking
}

export interface OtpRequiredError {
  statusCode: 403;
  message: string[]; // ✅ Backend همیشه string[] می‌فرستد
  code: ErrorCode.OTP_REQUIRED;
  requiresRegistration: true;
  isAuthenticated: true;
  phoneNumber: string | null;
  requiresOtpVerification: true;
  timestamp?: string;
  path?: string;
  method?: string;
  requestId?: string; // ✅ Request ID برای tracking
}

export interface OtpVerificationExpiredError {
  statusCode: 403;
  message: string[]; // ✅ Backend همیشه string[] می‌فرستد
  code: ErrorCode.OTP_VERIFICATION_EXPIRED;
  requiresRegistration: true;
  isAuthenticated: false;
  phoneNumber: string | null;
  timestamp?: string;
  path?: string;
  method?: string;
  requestId?: string; // ✅ Request ID برای tracking
}

// ✅ خطای انقضای OTP
export interface OtpExpiredError {
  statusCode: 400;
  message: string[]; // ✅ Backend همیشه string[] می‌فرستد
  code: ErrorCode.OTP_EXPIRED;
  timestamp?: string;
  path?: string;
  method?: string;
  requestId?: string; // ✅ Request ID برای tracking
}

// ✅ خطای نامعتبر بودن OTP
export interface OtpInvalidError {
  statusCode: 400;
  message: string[]; // ✅ Backend همیشه string[] می‌فرستد
  code: ErrorCode.OTP_INVALID;
  remainingAttempts?: number | null;
  timestamp?: string;
  path?: string;
  method?: string;
  requestId?: string; // ✅ Request ID برای tracking
}

// ✅ Error Response استاندارد از Backend
// مطابق با StandardErrorResponse در Backend
export interface ErrorResponse {
  statusCode: number;
  message: string[]; // ✅ Backend همیشه string[] می‌فرستد (تغییر از string | string[])
  code?: ErrorCode; // ✅ همیشه وجود دارد (از Backend جدید)
  timestamp?: string;
  path?: string;
  method?: string;
  requestId?: string; // ✅ Request ID برای tracking (از header X-Request-ID)

  // فیلدهای خاص برای Registration Errors
  requiresRegistration?: boolean;
  isAuthenticated?: boolean;
  phoneNumber?: string | null;
  requiresOtpVerification?: boolean;

  // فیلدهای خاص برای Validation Errors
  errors?: {
    [field: string]: string[];
  };

  // فیلدهای خاص برای OTP Errors
  remainingAttempts?: number | null;
}

/**
 * Type guard برای تشخیص Incomplete Registration Error
 */
export function isIncompleteRegistrationError(
  error: unknown
): error is IncompleteRegistrationError {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  return (
    err.statusCode === 403 &&
    (err.code === ErrorCode.INCOMPLETE_REGISTRATION ||
      err.code === "INCOMPLETE_REGISTRATION") &&
    err.requiresRegistration === true &&
    err.isAuthenticated === true
  );
}

/**
 * Type guard برای تشخیص OTP Required Error
 */
export function isOtpRequiredError(error: unknown): error is OtpRequiredError {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  return (
    err.statusCode === 403 &&
    (err.code === ErrorCode.OTP_REQUIRED || err.code === "OTP_REQUIRED") &&
    err.requiresRegistration === true &&
    err.isAuthenticated === true &&
    err.requiresOtpVerification === true
  );
}

/**
 * Type guard برای تشخیص OTP Verification Expired Error
 */
export function isOtpVerificationExpiredError(
  error: unknown
): error is OtpVerificationExpiredError {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  return (
    err.statusCode === 403 &&
    (err.code === ErrorCode.OTP_VERIFICATION_EXPIRED ||
      err.code === "OTP_VERIFICATION_EXPIRED") &&
    err.requiresRegistration === true &&
    err.isAuthenticated === false
  );
}

/**
 * ✅ Type guard برای تشخیص OTP Expired Error
 */
export function isOtpExpiredError(error: unknown): error is OtpExpiredError {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  return (
    err.statusCode === 400 &&
    (err.code === ErrorCode.OTP_EXPIRED || err.code === "OTP_EXPIRED")
  );
}

/**
 * ✅ Type guard برای تشخیص OTP Invalid Error
 */
export function isOtpInvalidError(error: unknown): error is OtpInvalidError {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;
  return (
    err.statusCode === 400 &&
    (err.code === ErrorCode.OTP_INVALID || err.code === "OTP_INVALID")
  );
}
