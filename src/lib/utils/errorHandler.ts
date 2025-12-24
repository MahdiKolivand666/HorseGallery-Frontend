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
    }
  | {
      type: "incomplete_registration";
      phoneNumber: string | null;
      action: "show_registration_modal";
    }
  | {
      type: "otp_verification_expired";
      phoneNumber: string | null;
      action: "show_otp_modal";
    }
  | {
      type: "otp_expired";
      message: string;
      action: "request_new_otp";
    }
  | {
      type: "otp_invalid";
      message: string;
      remainingAttempts: number | null | undefined;
      action: "show_error";
    }
  | {
      type: "validation_error";
      errors?: { [field: string]: string[] };
      message: string | string[];
      action: "show_field_errors";
    }
  | {
      type: "rate_limit";
      message: string;
      action: "show_error";
    }
  | {
      type: "unauthorized";
      action: "refresh_token";
    }
  | {
      type: "generic_error";
      message: string;
      action: "show_error";
    };

export class ErrorHandler {
  /**
   * Handle error بر اساس code
   */
  static handle(
    error: Error & { data?: ErrorResponse; statusCode?: number; code?: string }
  ): ErrorHandlerResult {
    // ✅ اگر error.data وجود دارد، از آن استفاده کن
    const errorData = error.data || error;

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
      return this.handleOtpRequired(errorData);
    }

    if (isIncompleteRegistrationError(errorData)) {
      return this.handleIncompleteRegistration(errorData);
    }

    if (isOtpVerificationExpiredError(errorData)) {
      return this.handleOtpVerificationExpired(errorData);
    }

    if (isOtpExpiredError(errorData)) {
      return this.handleOtpExpired(errorData);
    }

    if (isOtpInvalidError(errorData)) {
      return this.handleOtpInvalid(errorData);
    }

    // ✅ استفاده از error code برای تشخیص سایر خطاها
    if (code) {
      switch (code) {
        case ErrorCode.VALIDATION_ERROR:
        case "VALIDATION_ERROR":
          return this.handleValidationError(errorData);

        case ErrorCode.RATE_LIMIT_EXCEEDED:
        case "RATE_LIMIT_EXCEEDED":
          return this.handleRateLimit(errorData);

        case ErrorCode.UNAUTHORIZED:
        case "UNAUTHORIZED":
          return this.handleUnauthorized(errorData);

        case ErrorCode.TOKEN_EXPIRED:
        case "TOKEN_EXPIRED":
          return this.handleUnauthorized(errorData);
      }
    }

    // ✅ Fallback به generic error
    return this.handleGenericError(error);
  }

  private static handleOtpRequired(
    error: ErrorResponse
  ): ErrorHandlerResult {
    // باز کردن modal OTP
    // این یک flow عادی است - خطا را نمایش نده
    return {
      type: "otp_required",
      phoneNumber: error.phoneNumber || null,
      action: "show_otp_modal",
    };
  }

  private static handleIncompleteRegistration(
    error: ErrorResponse
  ): ErrorHandlerResult {
    // باز کردن modal تکمیل اطلاعات
    // این یک flow عادی است - خطا را نمایش نده
    return {
      type: "incomplete_registration",
      phoneNumber: error.phoneNumber || null,
      action: "show_registration_modal",
    };
  }

  private static handleOtpVerificationExpired(
    error: ErrorResponse
  ): ErrorHandlerResult {
    // پاک کردن tokens و باز کردن modal OTP
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("pendingOtpCode");
      localStorage.removeItem("userInfo");
    }
    return {
      type: "otp_verification_expired",
      phoneNumber: error.phoneNumber || null,
      action: "show_otp_modal",
    };
  }

  private static handleOtpExpired(error: ErrorResponse): ErrorHandlerResult {
    // نمایش پیام و درخواست کد جدید
    const message = Array.isArray(error.message)
      ? error.message[0]
      : error.message;
    return {
      type: "otp_expired",
      message: message || "کد تأیید منقضی شده است",
      action: "request_new_otp",
    };
  }

  private static handleOtpInvalid(error: ErrorResponse): ErrorHandlerResult {
    // نمایش پیام با تعداد تلاش باقی‌مانده
    const message = Array.isArray(error.message)
      ? error.message[0]
      : error.message;
    return {
      type: "otp_invalid",
      message: message || "کد تأیید نامعتبر است",
      remainingAttempts: error.remainingAttempts,
      action: "show_error",
    };
  }

  private static handleValidationError(
    error: ErrorResponse
  ): ErrorHandlerResult {
    // نمایش خطاهای validation
    return {
      type: "validation_error",
      errors: error.errors,
      message: error.message,
      action: "show_field_errors",
    };
  }

  private static handleRateLimit(error: ErrorResponse): ErrorHandlerResult {
    const message = Array.isArray(error.message)
      ? error.message[0]
      : error.message;
    return {
      type: "rate_limit",
      message:
        message ||
        "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند دقیقه صبر کنید",
      action: "show_error",
    };
  }

  private static handleUnauthorized(error: ErrorResponse): ErrorHandlerResult {
    // تلاش برای refresh token
    return {
      type: "unauthorized",
      action: "refresh_token",
    };
  }

  private static handleGenericError(
    error: Error | (Error & { data?: ErrorResponse })
  ): ErrorHandlerResult {
    const message =
      error instanceof Error
        ? error.message
        : error.data?.message
          ? Array.isArray(error.data.message)
            ? error.data.message[0]
            : error.data.message
          : "خطای ناشناخته";

    return {
      type: "generic_error",
      message: typeof message === "string" ? message : "خطای ناشناخته",
      action: "show_error",
    };
  }
}

