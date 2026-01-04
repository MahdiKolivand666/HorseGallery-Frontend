/**
 * ✅ Error Handler مرکزی
 * 
 * این utility برای handle کردن خطاها به صورت مرکزی استفاده می‌شود
 * و بر اساس error code، action مناسب را برمی‌گرداند
 */

import {
  ErrorCode,
  isIncompleteRegistrationError,
  isOtpRequiredError,
  isOtpVerificationExpiredError,
  isOtpExpiredError,
  isOtpInvalidError,
  ErrorResponse,
} from "@/types/errors";

export type ErrorHandlerResult =
  | {
      type: "otp_required";
      phoneNumber: string | null;
      action: "show_otp_modal";
      requestId?: string;
    }
  | {
      type: "incomplete_registration";
      phoneNumber: string | null;
      action: "show_registration_modal";
      requestId?: string;
    }
  | {
      type: "otp_verification_expired";
      phoneNumber: string | null;
      action: "show_otp_modal";
      requestId?: string;
    }
  | {
      type: "otp_expired";
      message: string;
      action: "request_new_otp";
      requestId?: string;
    }
  | {
      type: "otp_invalid";
      message: string;
      remainingAttempts: number | null | undefined;
      action: "show_error";
      requestId?: string;
    }
  | {
      type: "validation_error";
      errors?: { [field: string]: string[] };
      message: string[]; // ✅ Backend همیشه string[] می‌فرستد
      action: "show_field_errors";
      requestId?: string;
    }
  | {
      type: "rate_limit";
      message: string;
      action: "show_error";
      requestId?: string;
    }
  | {
      type: "unauthorized";
      action: "refresh_token";
      requestId?: string;
    }
  | {
      type: "not_found";
      message: string;
      action: "show_error";
      requestId?: string;
    }
  | {
      type: "duplicate_entry";
      message: string;
      action: "show_error";
      requestId?: string;
    }
  | {
      type: "generic_error";
      message: string;
      action: "show_error";
      requestId?: string;
    };

export class ErrorHandler {
  /**
   * ✅ Log error با requestId (اگر موجود باشد)
   */
  private static logError(
    error: ErrorResponse,
    errorType: string,
    requestId?: string
  ): void {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      const logMessage = requestId
        ? `[${requestId}] ${errorType}:`
        : `${errorType}:`;
      console.error(logMessage, {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        path: error.path,
        method: error.method,
        requestId: requestId || error.requestId,
      });
    }
  }

  /**
   * Handle error بر اساس code
   */
  static handle(
    error: Error & {
      data?: ErrorResponse;
      statusCode?: number;
      code?: string;
      requestId?: string; // ✅ اضافه کردن requestId به error type
    }
  ): ErrorHandlerResult {
    // ✅ اگر error.data وجود دارد، از آن استفاده کن
    const errorData = error.data || error;

    // ✅ گرفتن requestId (از error object یا errorData)
    const requestId =
      error.requestId ||
      errorData.requestId ||
      (errorData as any)?.requestId;

    // ✅ اگر error code در error.data یا error root وجود دارد
    const code =
      errorData.code ||
      error.code ||
      (errorData as any)?.code ||
      (error as any)?.code;

    // ✅ اگر statusCode در error.data یا error root وجود دارد
    const statusCode =
      errorData.statusCode || error.statusCode || (errorData as any)?.statusCode;

    // ✅ استفاده از type guards برای تشخیص خطاهای خاص
    if (isOtpRequiredError(errorData)) {
      return this.handleOtpRequired(errorData, requestId);
    }

    if (isIncompleteRegistrationError(errorData)) {
      return this.handleIncompleteRegistration(errorData, requestId);
    }

    if (isOtpVerificationExpiredError(errorData)) {
      return this.handleOtpVerificationExpired(errorData, requestId);
    }

    if (isOtpExpiredError(errorData)) {
      return this.handleOtpExpired(errorData, requestId);
    }

    if (isOtpInvalidError(errorData)) {
      return this.handleOtpInvalid(errorData, requestId);
    }

    // ✅ استفاده از error code برای تشخیص سایر خطاها
    if (code) {
      switch (code) {
        case ErrorCode.VALIDATION_ERROR:
        case "VALIDATION_ERROR":
          return this.handleValidationError(errorData, requestId);

        case ErrorCode.RATE_LIMIT_EXCEEDED:
        case "RATE_LIMIT_EXCEEDED":
          return this.handleRateLimit(errorData, requestId);

        case ErrorCode.UNAUTHORIZED:
        case "UNAUTHORIZED":
          return this.handleUnauthorized(errorData, requestId);

        case ErrorCode.TOKEN_EXPIRED:
        case "TOKEN_EXPIRED":
          return this.handleUnauthorized(errorData, requestId);

        case ErrorCode.NOT_FOUND:
        case "NOT_FOUND":
          return this.handleNotFound(errorData, requestId);

        case ErrorCode.DUPLICATE_ENTRY:
        case "DUPLICATE_ENTRY":
          return this.handleDuplicateEntry(errorData, requestId);
      }
    }

    // ✅ Fallback به generic error
    return this.handleGenericError(error, requestId);
  }

  private static handleOtpRequired(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // باز کردن modal OTP
    // این یک flow عادی است - خطا را نمایش نده
    // ✅ Log نمی‌کنیم چون این یک flow عادی است
    return {
      type: "otp_required",
      phoneNumber: error.phoneNumber || null,
      action: "show_otp_modal",
      requestId: requestId || error.requestId,
    };
  }

  private static handleIncompleteRegistration(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // باز کردن modal تکمیل اطلاعات
    // این یک flow عادی است - خطا را نمایش نده
    // ✅ Log نمی‌کنیم چون این یک flow عادی است
    return {
      type: "incomplete_registration",
      phoneNumber: error.phoneNumber || null,
      action: "show_registration_modal",
      requestId: requestId || error.requestId,
    };
  }

  private static handleOtpVerificationExpired(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // پاک کردن tokens و باز کردن modal OTP
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("pendingOtpCode");
      localStorage.removeItem("userInfo");
    }
    // ✅ Log نمی‌کنیم چون این یک flow عادی است
    return {
      type: "otp_verification_expired",
      phoneNumber: error.phoneNumber || null,
      action: "show_otp_modal",
      requestId: requestId || error.requestId,
    };
  }

  private static handleOtpExpired(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // ✅ Backend همیشه string[] می‌فرستد
    const message = error.message[0] || "کد تأیید منقضی شده است";
    this.logError(error, "OTP_EXPIRED", requestId || error.requestId);
    return {
      type: "otp_expired",
      message: message,
      action: "request_new_otp",
      requestId: requestId || error.requestId,
    };
  }

  private static handleOtpInvalid(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // ✅ Backend همیشه string[] می‌فرستد
    const message = error.message[0] || "کد تأیید نامعتبر است";
    this.logError(error, "OTP_INVALID", requestId || error.requestId);
    return {
      type: "otp_invalid",
      message: message,
      remainingAttempts: error.remainingAttempts,
      action: "show_error",
      requestId: requestId || error.requestId,
    };
  }

  private static handleValidationError(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // نمایش خطاهای validation
    this.logError(error, "VALIDATION_ERROR", requestId || error.requestId);
    return {
      type: "validation_error",
      errors: error.errors,
      message: error.message,
      action: "show_field_errors",
      requestId: requestId || error.requestId,
    };
  }

  private static handleRateLimit(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // ✅ Backend همیشه string[] می‌فرستد
    const message = error.message[0] || "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید";
    this.logError(error, "RATE_LIMIT", requestId || error.requestId);
    return {
      type: "rate_limit",
      message: message,
      action: "show_error",
      requestId: requestId || error.requestId,
    };
  }

  private static handleUnauthorized(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // تلاش برای refresh token
    this.logError(error, "UNAUTHORIZED", requestId || error.requestId);
    return {
      type: "unauthorized",
      action: "refresh_token",
      requestId: requestId || error.requestId,
    };
  }

  private static handleNotFound(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // ✅ Backend همیشه string[] می‌فرستد
    const message = error.message[0] || "منبع مورد نظر یافت نشد";
    this.logError(error, "NOT_FOUND", requestId || error.requestId);
    return {
      type: "not_found",
      message: message,
      action: "show_error",
      requestId: requestId || error.requestId,
    };
  }

  private static handleDuplicateEntry(
    error: ErrorResponse,
    requestId?: string
  ): ErrorHandlerResult {
    // ✅ Backend همیشه string[] می‌فرستد
    const message = error.message[0] || "این آیتم قبلاً ثبت شده است";
    this.logError(error, "DUPLICATE_ENTRY", requestId || error.requestId);
    return {
      type: "duplicate_entry",
      message: message,
      action: "show_error",
      requestId: requestId || error.requestId,
    };
  }

  private static handleGenericError(
    error: Error | (Error & { data?: ErrorResponse }),
    requestId?: string
  ): ErrorHandlerResult {
    // ✅ Backend همیشه string[] می‌فرستد
    let message: string = "خطای ناشناخته";
    let errorData: ErrorResponse | null = null;

    if (error instanceof Error) {
      message = error.message;
    } else if (error.data) {
      errorData = error.data;
      // ✅ Backend همیشه string[] می‌فرستد
      message = error.data.message[0] || "خطای ناشناخته";
    }

    if (errorData) {
      this.logError(errorData, "GENERIC_ERROR", requestId || errorData.requestId);
    } else {
      console.error("Generic error:", error);
    }

    return {
      type: "generic_error",
      message: message,
      action: "show_error",
      requestId: requestId || errorData?.requestId,
    };
  }
}

