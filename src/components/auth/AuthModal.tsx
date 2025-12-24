"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";
import {
  sendOtp,
  verifyOtp,
  register,
  RegistrationStatus,
  type RegisterData,
  getCurrentUser,
  saveUserInfo,
  getUserInfo,
} from "@/lib/api/auth";
import { tokenStorage } from "@/lib/utils/tokenStorage";
import {
  registerFormSchema,
  type RegisterFormData,
} from "@/lib/validations/auth";
import FieldError from "@/components/forms/FieldError";
import { ZodError } from "zod";
import {
  convertPersianToEnglish,
  convertEnglishToPersian,
  extractNumbers,
  isPersianOnly,
} from "@/lib/utils";
import { ErrorHandler } from "@/lib/utils/errorHandler";
import { isOtpExpiredError, isOtpInvalidError } from "@/types/errors";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhoneNumber?: string; // ✅ برای حالتی که از خطای INCOMPLETE_REGISTRATION باز می‌شود
  initialStep?: "phone" | "otp" | "register"; // ✅ برای شروع از مرحله register
  isFromIncompleteRegistration?: boolean; // ✅ آیا modal از خطای INCOMPLETE_REGISTRATION باز شده است
}

const AuthModal = ({
  isOpen,
  onClose,
  initialPhoneNumber,
  initialStep = "phone",
  isFromIncompleteRegistration: propIsFromIncompleteRegistration = false,
}: AuthModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const [phoneNumberDisplay, setPhoneNumberDisplay] = useState(
    initialPhoneNumber ? convertEnglishToPersian(initialPhoneNumber) : ""
  ); // ✅ برای نمایش فارسی
  const [step, setStep] = useState<"phone" | "otp" | "register">(initialStep);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // ✅ برای value اصلی (انگلیسی)
  const [otpDisplay, setOtpDisplay] = useState(["", "", "", "", "", ""]); // ✅ برای نمایش فارسی
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null); // زمان انقضای کد OTP
  const [isExpired, setIsExpired] = useState(false); // آیا کد OTP منقضی شده است
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null); // کد OTP در development mode
  const [verifiedOtpCode, setVerifiedOtpCode] = useState<string | null>(null); // کد OTP که در verify-otp استفاده شده
  const [isFromIncompleteRegistration, setIsFromIncompleteRegistration] =
    useState(propIsFromIncompleteRegistration); // ✅ آیا modal از خطای INCOMPLETE_REGISTRATION باز شده است

  // فرم ثبت‌نام
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    email: "",
  });
  // ✅ State برای نمایش فارسی (فقط برای فیلدهای عددی)
  const [nationalIdDisplay, setNationalIdDisplay] = useState("");
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  const { cart, mergeCart, reloadCart } = useCart();

  // تبدیل اعداد انگلیسی به فارسی
  const englishToPersian = (str: string): string => {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const englishDigits = "0123456789";
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const index = englishDigits.indexOf(char);
      if (index !== -1) {
        result += persianDigits[index];
      } else {
        result += char;
      }
    }
    return result;
  };

  useEffect(() => {
    // Client-side only mounting to prevent hydration mismatch
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // ✅ اگر initialPhoneNumber و initialStep داده شده باشد، از آن‌ها استفاده کن
      if (initialPhoneNumber) {
        // ✅ تبدیل به انگلیسی برای state اصلی
        const englishPhoneNumber = convertPersianToEnglish(initialPhoneNumber);
        setPhoneNumber(englishPhoneNumber);
        // ✅ تبدیل به فارسی برای نمایش
        const persianPhoneNumber = convertEnglishToPersian(englishPhoneNumber);
        setPhoneNumberDisplay(persianPhoneNumber);
        // ✅ اگر phoneNumber از خطای INCOMPLETE_REGISTRATION آمده باشد
        if (propIsFromIncompleteRegistration) {
          setIsFromIncompleteRegistration(true);
          // ❌ از pendingOtpCode استفاده نکن - backend خودش از otpVerifiedAt استفاده می‌کند
          // فقط یک placeholder بده (یا خالی بگذار)
          setVerifiedOtpCode(""); // خالی بگذار - backend خودش handle می‌کند
        }
        // ✅ اگر initialStep="otp" است (مثلاً از خطای OTP_REQUIRED یا INCOMPLETE_REGISTRATION)، خودکار OTP را ارسال کن
        if (initialStep === "otp") {
          // ارسال خودکار OTP
          const autoSendOtp = async () => {
            try {
              setIsLoading(true);
              setError(null);
              // ✅ تبدیل initialPhoneNumber به انگلیسی قبل از ارسال
              const englishPhoneNumber =
                convertPersianToEnglish(initialPhoneNumber);
              const result = await sendOtp(englishPhoneNumber);
              setStep("otp");
              // ✅ تنظیم timer از response
              if (result.expiresAt) {
                setExpiresAt(new Date(result.expiresAt));
              }
              if (result.remainingSeconds !== undefined) {
                setResendTimer(result.remainingSeconds);
              }
              if (result.code) {
                setDevOtpCode(result.code);
              }
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : "خطا در ارسال کد تأیید";
              setError(errorMessage);
            } finally {
              setIsLoading(false);
            }
          };
          autoSendOtp();
        }
      }
      if (initialStep) {
        setStep(initialStep);
      }
    } else {
      document.body.style.overflow = "unset";
      // Reset form when closing
      setTimeout(() => {
        setStep(initialStep || "phone");
        const resetPhoneNumber = initialPhoneNumber || "";
        setPhoneNumber(resetPhoneNumber);
        // ✅ تبدیل به فارسی برای نمایش
        setPhoneNumberDisplay(
          resetPhoneNumber ? convertEnglishToPersian(resetPhoneNumber) : ""
        );
        setOtp(["", "", "", "", "", ""]);
        setOtpDisplay(["", "", "", "", "", ""]);
        setError(null);
        setResendTimer(0);
        setExpiresAt(null);
        setIsExpired(false);
        setDevOtpCode(null);
        setVerifiedOtpCode(null);
        setIsFromIncompleteRegistration(false);
        // ✅ پاک کردن pendingOtpCode از localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingOtpCode");
        }
        setRegisterForm({
          firstName: "",
          lastName: "",
          nationalId: "",
          email: "",
        });
        setNationalIdDisplay("");
        setFormErrors({});
      }, 300);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    isOpen,
    initialPhoneNumber,
    initialStep,
    propIsFromIncompleteRegistration,
  ]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ تبدیل phoneNumber به انگلیسی قبل از ارسال
    const englishPhoneNumber = convertPersianToEnglish(phoneNumber);
    if (englishPhoneNumber.length !== 11) return;

    setIsLoading(true);
    setError(null);
    setDevOtpCode(null);

    try {
      // ✅ همیشه OTP بفرست - دیگر نیازی به verify بدون OTP نیست
      // ✅ ارسال phoneNumber به انگلیسی
      const result = await sendOtp(englishPhoneNumber);
      setStep("otp");
      setIsExpired(false);

      // ✅ استفاده از expiresAt برای timer (بدون نیاز به request مکرر)
      if (result.expiresAt) {
        // استفاده از expiresAt برای timer دقیق‌تر
        const expires = new Date(result.expiresAt);
        setExpiresAt(expires);
        const now = new Date();
        const remaining = Math.max(
          0,
          Math.floor((expires.getTime() - now.getTime()) / 1000)
        );
        setResendTimer(remaining);
        setIsExpired(remaining === 0);
      } else if (result.remainingSeconds !== undefined) {
        // Fallback: استفاده از remainingSeconds
        // محاسبه expiresAt از remainingSeconds
        const expires = new Date(Date.now() + result.remainingSeconds * 1000);
        setExpiresAt(expires);
        setResendTimer(result.remainingSeconds);
        setIsExpired(result.remainingSeconds === 0);
      } else {
        // Fallback: اگر backend timer برنگرداند، از 120 ثانیه استفاده کن
        const expires = new Date(Date.now() + 120 * 1000);
        setExpiresAt(expires);
        setResendTimer(120);
        setIsExpired(false);
      }

      // اگر در development mode کد OTP برگردانده شده، نمایش بده
      if (result.code) {
        setDevOtpCode(result.code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد تأیید");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ به‌روزرسانی timer از expiresAt (client-side هر ثانیه)
  useEffect(() => {
    if (expiresAt && (step === "otp" || step === "register")) {
      const updateTimer = () => {
        const now = new Date();
        const remaining = Math.max(
          0,
          Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        );
        setResendTimer(remaining);
        setIsExpired(remaining === 0);

        // اگر کد منقضی شده باشد
        if (remaining === 0 && step === "register") {
          setError(
            "کد تأیید منقضی شده است. روی ارسال مجدد کد کلیک کنید و کد جدید را وارد نمایید."
          );
          // ✅ برگرداندن کاربر به مرحله OTP برای دریافت کد جدید
          setStep("otp");
          setOtp(["", "", "", "", "", ""]);
          setOtpDisplay(["", "", "", "", "", ""]);
        }
      };

      // به‌روزرسانی اولیه
      updateTimer();

      // به‌روزرسانی هر ثانیه
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [expiresAt, step]);

  // ✅ Timer فقط از expiresAt محاسبه می‌شود (بدون request مکرر به backend)
  // ⚠️ مهم: از فراخوانی getOtpRemainingTime هر ثانیه یا هر 5 ثانیه خودداری می‌کنیم

  const handleResendOtp = async () => {
    // ✅ اگر در مرحله register هستیم و timer تمام شده، به مرحله OTP برگرد
    if (step === "register" && (isExpired || resendTimer === 0)) {
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setOtpDisplay(["", "", "", "", "", ""]);
      setError(null);
      // ✅ بعد از برگشت به مرحله OTP، کد جدید ارسال کن
      // (این کار در مرحله OTP انجام می‌شود، اما اگر کاربر بخواهد می‌تواند دوباره کلیک کند)
      return;
    }

    // ✅ تبدیل phoneNumber به انگلیسی برای بررسی
    const englishPhoneNumber = convertPersianToEnglish(phoneNumber);
    if (resendTimer > 0 || englishPhoneNumber.length !== 11) return;

    setIsLoading(true);
    setError(null);
    setDevOtpCode(null);

    try {
      // ✅ ارسال phoneNumber به انگلیسی
      const result = await sendOtp(englishPhoneNumber);
      setIsExpired(false);

      // ✅ اگر در مرحله register بودیم، به مرحله OTP برگرد
      if (step === "register") {
        setStep("otp");
        setOtp(["", "", "", "", "", ""]);
        setOtpDisplay(["", "", "", "", "", ""]);
      }

      // ✅ استفاده از expiresAt برای timer (بدون نیاز به request مکرر)
      if (result.expiresAt) {
        // استفاده از expiresAt برای timer دقیق‌تر
        const expires = new Date(result.expiresAt);
        setExpiresAt(expires);
        const now = new Date();
        const remaining = Math.max(
          0,
          Math.floor((expires.getTime() - now.getTime()) / 1000)
        );
        setResendTimer(remaining);
        setIsExpired(remaining === 0);
      } else if (result.remainingSeconds !== undefined) {
        // Fallback: استفاده از remainingSeconds
        // محاسبه expiresAt از remainingSeconds
        const expires = new Date(Date.now() + result.remainingSeconds * 1000);
        setExpiresAt(expires);
        setResendTimer(result.remainingSeconds);
        setIsExpired(result.remainingSeconds === 0);
      } else {
        // Fallback: اگر backend timer برنگرداند، از 120 ثانیه استفاده کن
        const expires = new Date(Date.now() + 120 * 1000);
        setExpiresAt(expires);
        setResendTimer(120);
        setIsExpired(false);
      }

      // اگر در development mode کد OTP برگردانده شده، نمایش بده
      if (result.code) {
        setDevOtpCode(result.code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال مجدد کد");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // ✅ استخراج فقط اعداد (فارسی و انگلیسی)
    const numbersOnly = extractNumbers(value);
    if (numbersOnly.length <= 1) {
      // ✅ تبدیل به انگلیسی برای state اصلی
      const englishValue = convertPersianToEnglish(numbersOnly);
      const newOtp = [...otp];
      newOtp[index] = englishValue;
      setOtp(newOtp);

      // ✅ تبدیل به فارسی برای نمایش
      const persianValue = convertEnglishToPersian(englishValue);
      const newOtpDisplay = [...otpDisplay];
      newOtpDisplay[index] = persianValue;
      setOtpDisplay(newOtpDisplay);

      // Auto focus next input
      if (englishValue && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    // ✅ بررسی انقضای کد OTP
    if (isExpired || resendTimer === 0) {
      setError(
        "کد تأیید منقضی شده است. روی ارسال مجدد کد کلیک کنید و کد جدید را وارد نمایید."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ✅ تبدیل phoneNumber و otpCode به انگلیسی قبل از ارسال
      const englishPhoneNumber = convertPersianToEnglish(phoneNumber);
      const englishOtpCode = convertPersianToEnglish(otpCode);

      // ✅ تأیید کد OTP
      const result = await verifyOtp(englishPhoneNumber, englishOtpCode);

      // ✅ بررسی registrationStatus و isRegistered
      const registrationStatus =
        result.user?.registrationStatus || RegistrationStatus.Pending;
      const isRegistered = result.isRegistered ?? false; // ✅ fallback به false اگر undefined باشد

      // ✅ مهم: چک کردن هم isRegistered و هم registrationStatus
      // ✅ اگر کاربر complete است، مستقیماً login شود
      if (isRegistered && registrationStatus === RegistrationStatus.Complete) {
        // کاربر قبلاً ثبت‌نام کرده و اطلاعات کامل دارد → مستقیماً login شود
        // اگر سبد مهمان وجود داشت، merge کن
        if (cart?.cart?.sessionId) {
          try {
            await mergeCart();
          } catch (mergeError) {
            console.error("Error merging cart:", mergeError);
            await reloadCart();
          }
        } else {
          await reloadCart();
        }

        // بستن modal و reload صفحه
        window.location.reload();
        onClose();
      } else {
        // کاربر جدید یا اطلاعات کامل ندارد → به مرحله ثبت‌نام برو
        // ✅ ذخیره کد OTP برای استفاده در register (در state و localStorage)
        setVerifiedOtpCode(otpCode);
        if (typeof window !== "undefined") {
          localStorage.setItem("pendingOtpCode", otpCode);
        }

        // ✅ استفاده از expiresAt و remainingSeconds از response backend
        // Backend خودش timer را مدیریت می‌کند و اطلاعات دقیق را برمی‌گرداند
        if (result.expiresAt && result.remainingSeconds !== undefined) {
          setExpiresAt(new Date(result.expiresAt));
          setResendTimer(result.remainingSeconds);
          setIsExpired(false);
        } else {
          // Fallback: اگر backend اطلاعات timer را برنگرداند (backward compatibility)
          const newExpires = new Date(Date.now() + 120 * 1000); // 2 دقیقه از الان
          setExpiresAt(newExpires);
          setResendTimer(120);
          setIsExpired(false);
        }

        // ✅ اگر از INCOMPLETE_REGISTRATION آمده‌ایم، به register برو
        if (isFromIncompleteRegistration) {
          setStep("register");
        } else {
          setStep("register");
        }
      }
    } catch (err) {
      // ✅ استفاده از ErrorHandler
      const handledError = ErrorHandler.handle(
        err as Error & { data?: any; statusCode?: number; code?: string }
      );

      // ✅ Handle کردن بر اساس type
      switch (handledError.type) {
        case "otp_expired":
          // ✅ نمایش پیام و فعال کردن دکمه ارسال مجدد
          setError(handledError.message);
          setShowResendButton(true);
          setIsExpired(true);
          setResendTimer(0);
          break;

        case "otp_invalid":
          // ✅ نمایش پیام با تعداد تلاش باقی‌مانده
          setError(handledError.message);
          if (handledError.remainingAttempts !== null && handledError.remainingAttempts !== undefined) {
            // می‌توانید state برای نمایش تعداد تلاش باقی‌مانده اضافه کنید
            // setRemainingAttempts(handledError.remainingAttempts);
          }
          // پاک کردن OTP inputs
          setOtp(["", "", "", "", "", ""]);
          break;

        default:
          // ✅ نمایش error برای سایر موارد
          const errorMessage =
            err instanceof Error ? err.message : "خطا در تأیید کد";
          setError(handledError.message || errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ بررسی اینکه آیا timer تمام شده است یا نه
    if (isExpired || resendTimer === 0) {
      setError(
        "کد تأیید منقضی شده است. روی ارسال مجدد کد کلیک کنید و کد جدید را وارد نمایید."
      );
      // ✅ برگرداندن کاربر به مرحله OTP
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      return;
    }
    setFormErrors({});
    setError(null);

    // ✅ اگر از خطای INCOMPLETE_REGISTRATION آمده باشد، از OTP code استفاده نکن
    // Backend خودش از otpVerifiedAt استفاده می‌کند
    if (isFromIncompleteRegistration) {
      // فقط یک placeholder بده - backend خودش handle می‌کند
      const otpCode = "000000"; // placeholder - backend این را ignore می‌کند

      // ✅ Validation نهایی قبل از ارسال
      // ✅ بررسی اینکه نام و نام خانوادگی فقط فارسی باشند
      if (!isPersianOnly(registerForm.firstName)) {
        setFormErrors({
          ...formErrors,
          firstName: "لطفاً نام را به فارسی وارد کنید",
        });
        return;
      }

      if (!isPersianOnly(registerForm.lastName)) {
        setFormErrors({
          ...formErrors,
          lastName: "لطفاً نام خانوادگی را به فارسی وارد کنید",
        });
        return;
      }

      // ✅ تبدیل phoneNumber و nationalId به انگلیسی قبل از validation
      const englishPhoneNumber = convertPersianToEnglish(phoneNumber);
      const englishNationalId = convertPersianToEnglish(
        registerForm.nationalId
      );

      // Validation با Zod (بدون نیاز به OTP code واقعی)
      try {
        const validatedData = registerFormSchema.parse({
          phoneNumber: englishPhoneNumber,
          otpCode, // placeholder
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          nationalId: englishNationalId,
          email: registerForm.email || undefined,
        });

        setIsLoading(true);

        try {
          const registerData: RegisterData = {
            phoneNumber: validatedData.phoneNumber,
            otpCode: otpCode, // placeholder - backend از otpVerifiedAt استفاده می‌کند
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            nationalId: validatedData.nationalId,
            email: validatedData.email || null,
          };

          try {
            console.log("🔵 [AuthModal] Calling register API...", {
              phoneNumber: registerData.phoneNumber,
              hasFirstName: !!registerData.firstName,
              hasLastName: !!registerData.lastName,
            });

            const registerResponse = await register(registerData);

            console.log("🟢 [AuthModal] Register response received:", {
              hasToken: !!registerResponse.token,
              hasRefreshToken: !!registerResponse.refreshToken,
              hasUser: !!registerResponse.user,
              userId: registerResponse.user?.id,
              userPhoneNumber: registerResponse.user?.phoneNumber,
            });

            // ✅ بررسی که token ها ذخیره شده‌اند
            const accessToken = tokenStorage.getAccessToken();
            const refreshToken = tokenStorage.getRefreshToken();

            console.log("🟢 [AuthModal] Tokens after register:", {
              accessToken: accessToken ? "✅ Stored" : "❌ Missing",
              refreshToken: refreshToken ? "✅ Stored" : "❌ Missing",
            });

            if (!accessToken) {
              console.error(
                "🔴 [AuthModal] Access token missing after register!"
              );
              throw new Error("خطا در ذخیره token");
            }

            // ✅ به‌روزرسانی user info از localStorage
            const userInfo = getUserInfo();
            console.log("🟢 [AuthModal] User info after register:", userInfo);

            if (!userInfo) {
              console.error("🔴 [AuthModal] User info missing after register!");
              // سعی کن از API بگیر
              try {
                const fetchedUserInfo = await getCurrentUser();
                if (fetchedUserInfo) {
                  console.log(
                    "🟢 [AuthModal] User info fetched from API:",
                    fetchedUserInfo
                  );
                }
              } catch (fetchError) {
                console.error(
                  "🔴 [AuthModal] Failed to fetch user info:",
                  fetchError
                );
              }
            }
          } catch (registerError: unknown) {
            const errorMessage =
              registerError instanceof Error
                ? registerError.message
                : "خطا در ثبت‌نام";

            // ✅ اگر خطای مربوط به کد OTP منقضی شده باشد
            const errorWithOtpFlag = registerError as Error & {
              statusCode?: number;
              isOtpError?: boolean;
              isOtpExpired?: boolean;
            };

            if (
              errorWithOtpFlag?.isOtpExpired ||
              errorMessage.includes("کد تأیید منقضی شده") ||
              errorMessage.includes("منقضی شده")
            ) {
              // ✅ پاک کردن pendingOtpCode از localStorage
              if (typeof window !== "undefined") {
                localStorage.removeItem("pendingOtpCode");
              }
              setVerifiedOtpCode(null);
              setIsFromIncompleteRegistration(false);

              setError(
                "کد تأیید منقضی شده است. روی ارسال مجدد کد کلیک کنید و کد جدید را وارد نمایید."
              );
              // ✅ اگر از خطای INCOMPLETE_REGISTRATION آمده بود، به مرحله phone برگرد
              // چون کاربر باید دوباره کد OTP دریافت کند
              setStep("phone");
              setOtp(["", "", "", "", "", ""]);
              setOtpDisplay(["", "", "", "", "", ""]);
              setIsExpired(true);
              setResendTimer(0);
              setIsLoading(false);
              return;
            }

            // Handle سایر خطاها
            setError(errorMessage);
            setIsLoading(false);
            return;
          }

          // ✅ پاک کردن pendingOtpCode از localStorage بعد از ثبت‌نام موفق
          if (typeof window !== "undefined") {
            localStorage.removeItem("pendingOtpCode");
          }

          // ✅ بررسی نهایی قبل از reload
          const finalAccessToken = tokenStorage.getAccessToken();
          const finalRefreshToken = tokenStorage.getRefreshToken();
          const finalUserInfo = getUserInfo();

          console.log("🟢 [AuthModal] Final state before reload:", {
            accessToken: finalAccessToken ? "✅ Stored" : "❌ Missing",
            refreshToken: finalRefreshToken ? "✅ Stored" : "❌ Missing",
            userInfo: finalUserInfo ? "✅ Stored" : "❌ Missing",
            userData: finalUserInfo,
          });

          if (!finalAccessToken) {
            console.error("🔴 [AuthModal] Access token missing before reload!");
            setError("خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.");
            setIsLoading(false);
            return;
          }

          // اگر ثبت‌نام موفق بود
          if (cart?.cart?.sessionId) {
            try {
              await mergeCart();
            } catch (mergeError) {
              console.error("Error merging cart:", mergeError);
              await reloadCart();
            }
          } else {
            await reloadCart();
          }

          console.log("🟢 [AuthModal] Reloading page...");
          onClose();
          // ✅ کمی delay برای اطمینان از ذخیره شدن همه چیز
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } catch (err) {
          setIsLoading(false);
          throw err;
        }
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          const errors: Partial<Record<keyof RegisterFormData, string>> = {};
          validationError.issues.forEach((issue) => {
            if (issue.path[0]) {
              errors[issue.path[0] as keyof RegisterFormData] = issue.message;
            }
          });
          setFormErrors(errors);
        }
        setIsLoading(false);
        return;
      }
      return; // ✅ خروج از function
    }

    // ✅ برای حالت عادی: استفاده از کد OTP که در verify-otp استفاده شده (از state یا localStorage)
    // ⚠️ اگر از خطای INCOMPLETE_REGISTRATION آمده باشد، از pendingOtpCode استفاده نکن
    let otpCode: string;
    if (isFromIncompleteRegistration) {
      // ✅ از pendingOtpCode استفاده نکن - backend خودش از otpVerifiedAt استفاده می‌کند
      otpCode = "000000"; // placeholder برای validation - backend این را ignore می‌کند
    } else {
      const otpCodeFromState = verifiedOtpCode || otp.join("");
      const otpCodeFromStorage =
        typeof window !== "undefined"
          ? localStorage.getItem("pendingOtpCode")
          : null;
      otpCode = otpCodeFromState || otpCodeFromStorage || "";

      // ✅ اگر کد OTP موجود نیست، خطا بده
      if (!otpCode) {
        setError(
          "کد تأیید یافت نشد. لطفاً به مرحله قبل برگردید و کد جدید دریافت کنید."
        );
        setStep("otp");
        return;
      }
    }

    // ✅ Validation نهایی قبل از ارسال
    // ✅ بررسی اینکه نام و نام خانوادگی فقط فارسی باشند
    if (!isPersianOnly(registerForm.firstName)) {
      setFormErrors({
        ...formErrors,
        firstName: "لطفاً نام را به فارسی وارد کنید",
      });
      return;
    }

    if (!isPersianOnly(registerForm.lastName)) {
      setFormErrors({
        ...formErrors,
        lastName: "لطفاً نام خانوادگی را به فارسی وارد کنید",
      });
      return;
    }

    // ✅ تبدیل phoneNumber، otpCode و nationalId به انگلیسی قبل از validation
    const englishPhoneNumber = convertPersianToEnglish(phoneNumber);
    const englishOtpCode = convertPersianToEnglish(otpCode);
    const englishNationalId = convertPersianToEnglish(registerForm.nationalId);

    // Validation با Zod
    try {
      const validatedData = registerFormSchema.parse({
        phoneNumber: englishPhoneNumber,
        otpCode: englishOtpCode,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        nationalId: englishNationalId,
        email: registerForm.email || undefined,
      });

      setIsLoading(true);

      try {
        // ثبت‌نام و دریافت token
        // ✅ استفاده از کد OTP که در verify-otp استفاده شده (از state یا localStorage)
        // ⚠️ اگر از خطای INCOMPLETE_REGISTRATION آمده باشد، از pendingOtpCode استفاده نکن
        const otpCodeToUse = isFromIncompleteRegistration
          ? "000000" // placeholder - backend از otpVerifiedAt استفاده می‌کند
          : verifiedOtpCode ||
            (typeof window !== "undefined"
              ? localStorage.getItem("pendingOtpCode")
              : null) ||
            validatedData.otpCode;

        // ✅ تبدیل otpCodeToUse به انگلیسی (اگر از state یا localStorage آمده باشد)
        const englishOtpCodeToUse = convertPersianToEnglish(otpCodeToUse);

        const registerData: RegisterData = {
          phoneNumber: validatedData.phoneNumber, // ✅ قبلاً به انگلیسی تبدیل شده
          otpCode: englishOtpCodeToUse, // ✅ به انگلیسی تبدیل شده
          firstName: validatedData.firstName, // ✅ فارسی
          lastName: validatedData.lastName, // ✅ فارسی
          nationalId: validatedData.nationalId, // ✅ قبلاً به انگلیسی تبدیل شده
          email: validatedData.email || null,
        };

        try {
          console.log("🔵 [AuthModal] Calling register API (normal flow)...", {
            phoneNumber: registerData.phoneNumber,
            hasFirstName: !!registerData.firstName,
            hasLastName: !!registerData.lastName,
          });

          const registerResponse = await register(registerData);

          console.log(
            "🟢 [AuthModal] Register response received (normal flow):",
            {
              hasToken: !!registerResponse.token,
              hasRefreshToken: !!registerResponse.refreshToken,
              hasUser: !!registerResponse.user,
              userId: registerResponse.user?.id,
              userPhoneNumber: registerResponse.user?.phoneNumber,
            }
          );

          // ✅ بررسی که token ها ذخیره شده‌اند
          const accessToken = tokenStorage.getAccessToken();
          const refreshToken = tokenStorage.getRefreshToken();

          console.log("🟢 [AuthModal] Tokens after register (normal flow):", {
            accessToken: accessToken ? "✅ Stored" : "❌ Missing",
            refreshToken: refreshToken ? "✅ Stored" : "❌ Missing",
          });

          if (!accessToken) {
            console.error(
              "🔴 [AuthModal] Access token missing after register!"
            );
            throw new Error("خطا در ذخیره token");
          }

          // ✅ به‌روزرسانی user info از localStorage
          const userInfo = getUserInfo();
          console.log(
            "🟢 [AuthModal] User info after register (normal flow):",
            userInfo
          );

          if (!userInfo) {
            console.error("🔴 [AuthModal] User info missing after register!");
            // سعی کن از API بگیر
            try {
              const fetchedUserInfo = await getCurrentUser();
              if (fetchedUserInfo) {
                console.log(
                  "🟢 [AuthModal] User info fetched from API:",
                  fetchedUserInfo
                );
              }
            } catch (fetchError) {
              console.error(
                "🔴 [AuthModal] Failed to fetch user info:",
                fetchError
              );
            }
          }
        } catch (registerError: unknown) {
          const errorMessage =
            registerError instanceof Error
              ? registerError.message
              : "خطا در ثبت‌نام";

          // ✅ اگر خطای مربوط به کد OTP منقضی شده یا یافت نشد باشد
          const errorWithOtpFlag = registerError as Error & {
            statusCode?: number;
            isOtpError?: boolean;
          };

          if (
            (registerError instanceof Error &&
              (errorMessage.includes("کد تأیید یافت نشد") ||
                errorMessage.includes("کد تأیید منقضی شده") ||
                errorMessage.includes("کد تأیید نامعتبر"))) ||
            errorWithOtpFlag?.isOtpError ||
            (errorWithOtpFlag?.statusCode === 400 &&
              errorMessage.includes("کد"))
          ) {
            // ✅ پاک کردن pendingOtpCode از localStorage
            if (typeof window !== "undefined") {
              localStorage.removeItem("pendingOtpCode");
            }

            setError(
              "کد تأیید منقضی شده است. روی ارسال مجدد کد کلیک کنید و کد جدید را وارد نمایید."
            );
            // بازگشت به مرحله OTP
            setStep("otp");
            setOtp(["", "", "", "", "", ""]);
            setOtpDisplay(["", "", "", "", "", ""]);
            setIsExpired(true);
            setResendTimer(0);
            setVerifiedOtpCode(null);
            return;
          }

          // ✅ اگر خطای 409 باشد (کاربر موجود است)، از verify-otp استفاده کن
          const errorWithStatusCode = registerError as Error & {
            statusCode?: number;
          };
          const isConflictError =
            errorWithStatusCode?.statusCode === 409 ||
            (registerError instanceof Error &&
              (errorMessage.includes("قبلاً ثبت‌نام شده") ||
                errorMessage.includes("409")));

          if (isConflictError) {
            // ✅ استفاده از verify-otp برای ورود کاربر موجود
            try {
              const verifyResult = await verifyOtp(phoneNumber, otpCode);

              // ✅ بررسی registrationStatus و isRegistered
              const verifyRegistrationStatus =
                verifyResult.user?.registrationStatus ||
                RegistrationStatus.Pending;
              const verifyIsRegistered = verifyResult.isRegistered ?? false;

              // ✅ اگر کاربر complete است، مستقیماً login شود
              if (
                verifyIsRegistered &&
                verifyRegistrationStatus === RegistrationStatus.Complete
              ) {
                // اگر سبد مهمان وجود داشت، merge کن
                if (cart?.cart?.sessionId) {
                  try {
                    await mergeCart();
                  } catch (mergeError) {
                    console.error("Error merging cart:", mergeError);
                    await reloadCart();
                  }
                } else {
                  await reloadCart();
                }

                // بستن modal و reload صفحه
                window.location.reload();
                onClose();
                return;
              } else {
                // اگر کاربر pending باشد یا اطلاعات کامل نداشته باشد، خطا نمایش بده
                setError(
                  "این شماره موبایل قبلاً ثبت‌نام شده است. لطفاً وارد حساب کاربری خود شوید"
                );
                return;
              }
            } catch (verifyError) {
              // اگر verify-otp هم خطا داد، خطا را نمایش بده
              const verifyErrorMessage =
                verifyError instanceof Error
                  ? verifyError.message
                  : "خطا در ورود";
              setError(
                verifyErrorMessage ||
                  "این شماره موبایل قبلاً ثبت‌نام شده است. لطفاً وارد حساب کاربری خود شوید"
              );
              return;
            }
          }

          // اگر خطای دیگری بود، آن را نمایش بده
          setError(errorMessage);
        }

        // ✅ پاک کردن pendingOtpCode از localStorage بعد از ثبت‌نام موفق
        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingOtpCode");
        }

        // ✅ مهم: به‌روزرسانی user info از backend
        // ✅ این اطمینان می‌دهد که registrationStatus به 'complete' تغییر کرده است
        try {
          const updatedUser = await getCurrentUser();
          if (updatedUser) {
            // ✅ اطمینان از اینکه registrationStatus به 'complete' تغییر کرده است
            saveUserInfo({
              ...updatedUser,
              registrationStatus: RegistrationStatus.Complete,
            });
          }
        } catch (userError) {
          // اگر خطا در دریافت user info بود، فقط log کن
          // token و user info قبلاً در register function ذخیره شده است
          console.warn("Error fetching updated user info:", userError);
        }

        // اگر ثبت‌نام موفق بود
        // اگر سبد مهمان وجود داشت، merge کن
        if (cart?.cart?.sessionId) {
          try {
            await mergeCart();
          } catch (mergeError) {
            console.error("Error merging cart:", mergeError);
            // اگر merge خطا داد، فقط سبد را reload کن
            await reloadCart();
          }
        } else {
          // اگر سبد مهمان وجود نداشت، فقط reload کن
          await reloadCart();
        }

        // ✅ بررسی نهایی قبل از reload
        const finalAccessToken2 = tokenStorage.getAccessToken();
        const finalRefreshToken2 = tokenStorage.getRefreshToken();
        const finalUserInfo2 = getUserInfo();

        console.log(
          "🟢 [AuthModal] Final state before reload (normal flow - second):",
          {
            accessToken: finalAccessToken2 ? "✅ Stored" : "❌ Missing",
            refreshToken: finalRefreshToken2 ? "✅ Stored" : "❌ Missing",
            userInfo: finalUserInfo2 ? "✅ Stored" : "❌ Missing",
            userData: finalUserInfo2,
          }
        );

        if (!finalAccessToken2) {
          console.error("🔴 [AuthModal] Access token missing before reload!");
          setError("خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.");
          setIsLoading(false);
          return;
        }

        // بستن modal و reset کردن فرم
        // Reload page to update navbar
        console.log("🟢 [AuthModal] Reloading page (normal flow - second)...");
        onClose();
        // ✅ کمی delay برای اطمینان از ذخیره شدن همه چیز
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (err) {
        // نمایش خطا - اگر خطا مربوط به validation backend باشد، در formErrors نمایش داده می‌شود
        const errorMessage =
          err instanceof Error ? err.message : "خطا در ثبت‌نام";

        // اگر خطا مربوط به کد OTP است، آن را در formErrors نمایش بده
        if (errorMessage.includes("کد تأیید")) {
          setFormErrors({ ...formErrors, otpCode: errorMessage });
        } else if (
          errorMessage.includes("شماره موبایل") ||
          errorMessage.includes("409")
        ) {
          // اگر کاربر موجود است، خطا را نمایش بده
          setError(errorMessage);
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert Zod errors to form errors object
        const errors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const field = issue.path[0] as keyof RegisterFormData;
            errors[field] = issue.message;
          }
        });
        setFormErrors(errors);
      } else {
        console.error("Validation error:", error);
        setError("خطا در اعتبارسنجی فرم. لطفاً فیلدها را بررسی کنید.");
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-white shadow-2xl max-h-[90vh] overflow-y-auto rounded-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {step === "phone"
                    ? "ورود / ثبت‌نام"
                    : step === "register"
                    ? "تکمیل اطلاعات"
                    : "تأیید شماره موبایل"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === "phone" ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2 text-right"
                      >
                        شماره موبایل
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumberDisplay}
                        onChange={(e) => {
                          // ✅ استخراج فقط اعداد (فارسی و انگلیسی)
                          const numbersOnly = extractNumbers(e.target.value);
                          if (numbersOnly.length <= 11) {
                            // ✅ تبدیل به انگلیسی برای state اصلی
                            const englishValue =
                              convertPersianToEnglish(numbersOnly);
                            setPhoneNumber(englishValue);
                            // ✅ تبدیل به فارسی برای نمایش
                            const persianValue =
                              convertEnglishToPersian(englishValue);
                            setPhoneNumberDisplay(persianValue);
                          }
                        }}
                        placeholder="شماره موبایل خود را وارد کنید"
                        className="w-full px-4 py-3 border border-gray-300 bg-white focus:border-primary focus:outline-none text-center text-lg tracking-wider text-gray-900"
                        dir="ltr"
                        inputMode="numeric"
                        lang="fa"
                        maxLength={11}
                        autoFocus
                      />
                      <p className="mt-2 text-xs text-gray-500 text-right">
                        کد تأیید به این شماره ارسال می‌شود
                      </p>
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 text-right mb-2">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        convertPersianToEnglish(phoneNumber).length !== 11 ||
                        isLoading
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "در حال ارسال..." : "دریافت کد تأیید"}
                    </button>
                  </form>
                ) : step === "register" ? (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-600 font-bold text-center">
                          لطفاً اطلاعات خود را تکمیل کنید
                        </p>
                      </div>
                      {/* ✅ اگر از خطای INCOMPLETE_REGISTRATION آمده باشد، پیام مناسب نمایش بده */}
                      {isFromIncompleteRegistration && (
                        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-center">
                          <p className="text-xs text-blue-700">
                            ✅ شماره موبایل شما تأیید شده است. لطفاً اطلاعات خود
                            را تکمیل کنید.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* نام */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                        نام{" "}
                        <span className="text-red-500 text-[10px]">
                          (الزامی)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) => {
                          const value = e.target.value;

                          // ✅ بررسی اینکه آیا فقط فارسی است
                          if (value && !isPersianOnly(value)) {
                            // ✅ اگر حروف انگلیسی یا کاراکترهای غیرفارسی دارد، error نشان بده
                            setFormErrors({
                              ...formErrors,
                              firstName: "لطفاً نام را به فارسی وارد کنید",
                            });
                            return;
                          }

                          // ✅ اگر فقط فارسی است، error را پاک کن و value را set کن
                          setRegisterForm({
                            ...registerForm,
                            firstName: value,
                          });
                          if (formErrors.firstName) {
                            setFormErrors({
                              ...formErrors,
                              firstName: undefined,
                            });
                          }
                        }}
                        className={`w-full px-4 py-3 border bg-white focus:border-primary focus:outline-none text-right text-gray-900 ${
                          formErrors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="نام"
                        inputMode="text"
                        lang="fa"
                        dir="rtl"
                      />
                      <FieldError error={formErrors.firstName} />
                    </div>

                    {/* نام خانوادگی */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                        نام خانوادگی{" "}
                        <span className="text-red-500 text-[10px]">
                          (الزامی)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={registerForm.lastName}
                        onChange={(e) => {
                          const value = e.target.value;

                          // ✅ بررسی اینکه آیا فقط فارسی است
                          if (value && !isPersianOnly(value)) {
                            // ✅ اگر حروف انگلیسی یا کاراکترهای غیرفارسی دارد، error نشان بده
                            setFormErrors({
                              ...formErrors,
                              lastName:
                                "لطفاً نام خانوادگی را به فارسی وارد کنید",
                            });
                            return;
                          }

                          // ✅ اگر فقط فارسی است، error را پاک کن و value را set کن
                          setRegisterForm({
                            ...registerForm,
                            lastName: value,
                          });
                          if (formErrors.lastName) {
                            setFormErrors({
                              ...formErrors,
                              lastName: undefined,
                            });
                          }
                        }}
                        className={`w-full px-4 py-3 border bg-white focus:border-primary focus:outline-none text-right text-gray-900 ${
                          formErrors.lastName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="نام خانوادگی"
                        inputMode="text"
                        lang="fa"
                        dir="rtl"
                      />
                      <FieldError error={formErrors.lastName} />
                    </div>

                    {/* کد ملی */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                        کد ملی{" "}
                        <span className="text-red-500 text-[10px]">
                          (الزامی)
                        </span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={nationalIdDisplay}
                        onChange={(e) => {
                          // ✅ استخراج فقط اعداد (فارسی و انگلیسی)
                          const numbersOnly = extractNumbers(e.target.value);
                          if (numbersOnly.length <= 10) {
                            // ✅ تبدیل به انگلیسی برای state اصلی
                            const englishValue =
                              convertPersianToEnglish(numbersOnly);
                            setRegisterForm({
                              ...registerForm,
                              nationalId: englishValue,
                            });
                            // ✅ تبدیل به فارسی برای نمایش
                            const persianValue =
                              convertEnglishToPersian(englishValue);
                            setNationalIdDisplay(persianValue);

                            if (formErrors.nationalId) {
                              setFormErrors({
                                ...formErrors,
                                nationalId: undefined,
                              });
                            }
                          }
                        }}
                        className={`w-full px-4 py-3 border bg-white focus:border-primary focus:outline-none text-center text-gray-900 ${
                          formErrors.nationalId
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="کد ملی ۱۰ رقمی"
                        inputMode="numeric"
                        lang="fa"
                        dir="ltr"
                      />
                      <FieldError error={formErrors.nationalId} />
                    </div>

                    {/* ایمیل */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                        ایمیل{" "}
                        <span className="text-gray-500 text-[10px]">
                          (اختیاری)
                        </span>
                      </label>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => {
                          setRegisterForm({
                            ...registerForm,
                            email: e.target.value,
                          });
                          if (formErrors.email) {
                            setFormErrors({ ...formErrors, email: undefined });
                          }
                        }}
                        onKeyPress={(e) => {
                          // ✅ فقط کاراکترهای مجاز را قبول کنید: a-z, A-Z, 0-9, @, ., _, -
                          const char = e.key;
                          const allowedChars = /[a-zA-Z0-9@._-]/;
                          // ✅ اگر کاراکتر مجاز نیست و کلیدهای کنترل نیستند، جلوگیری کن
                          if (
                            !allowedChars.test(char) &&
                            char !== "Backspace" &&
                            char !== "Delete" &&
                            char !== "ArrowLeft" &&
                            char !== "ArrowRight" &&
                            char !== "Tab" &&
                            char !== "Enter" &&
                            char.length === 1 // فقط برای کاراکترهای واقعی
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className={`w-full px-4 py-3 border bg-white focus:border-primary focus:outline-none text-gray-900 text-left font-sans ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="example@email.com"
                        lang="en"
                        dir="ltr"
                        inputMode="email"
                        autoComplete="email"
                      />
                      <FieldError error={formErrors.email} />
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 text-right mb-2">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || isExpired || resendTimer === 0}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "در حال ثبت‌نام..." : "ثبت‌نام و ورود"}
                    </button>

                    {/* دکمه ارسال مجدد کد */}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="w-full text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? (
                        <>
                          <span className="text-red-600">ارسال مجدد کد</span> (
                          <span className="text-red-600 font-semibold">
                            {englishToPersian(
                              Math.floor(resendTimer / 60)
                                .toString()
                                .padStart(2, "0")
                            )}
                            :
                            {englishToPersian(
                              (resendTimer % 60).toString().padStart(2, "0")
                            )}
                          </span>
                          )
                        </>
                      ) : (
                        <span className="text-red-600">ارسال مجدد کد</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div>
                      {/* ✅ پیام برای INCOMPLETE_REGISTRATION */}
                      {isFromIncompleteRegistration && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-center">
                          <p className="text-sm text-red-600 font-medium">
                            اطلاعات شما ناقص است. لطفاً بعد از وارد کردن کد
                            تأیید، اطلاعات خود را تکمیل نمایید
                          </p>
                        </div>
                      )}

                      <p className="text-sm text-gray-600 text-center mb-4">
                        کد ارسال شده به شماره{" "}
                        <span className="font-semibold text-gray-900" dir="ltr">
                          {englishToPersian(phoneNumber)}
                        </span>{" "}
                        را وارد کنید
                      </p>

                      {/* نمایش کد OTP در development mode */}
                      {devOtpCode && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                          <p className="text-xs text-yellow-800 mb-1">
                            Development Mode - کد تأیید:
                          </p>
                          <p
                            className="text-lg font-bold text-yellow-900"
                            dir="ltr"
                          >
                            {devOtpCode}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 justify-center mb-4" dir="ltr">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            value={otpDisplay[index]} // ✅ نمایش فارسی
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 bg-white focus:border-primary focus:outline-none text-gray-900"
                            lang="fa"
                            maxLength={1}
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setStep("phone");
                          setOtp(["", "", "", "", "", ""]);
                          setOtpDisplay(["", "", "", "", "", ""]); // ✅ پاک کردن فیلد OTP هنگام بازگشت به مرحله phone
                          setError(null); // ✅ پاک کردن خطاها
                          setResendTimer(0); // ✅ reset کردن timer
                          setIsExpired(false); // ✅ reset کردن expired flag
                        }}
                        className="text-sm text-primary hover:text-primary/80 transition-colors block mx-auto"
                      >
                        ویرایش شماره موبایل
                      </button>
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 text-right mb-2">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        otp.join("").length !== 6 ||
                        isLoading ||
                        isExpired ||
                        resendTimer === 0
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "در حال تأیید..." : "ادامه"}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="w-full text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? (
                        <>
                          <span className="text-red-600">ارسال مجدد کد</span> (
                          <span className="text-red-600 font-semibold">
                            {englishToPersian(
                              Math.floor(resendTimer / 60)
                                .toString()
                                .padStart(2, "0")
                            )}
                            :
                            {englishToPersian(
                              (resendTimer % 60).toString().padStart(2, "0")
                            )}
                          </span>
                          )
                        </>
                      ) : (
                        <span className="text-red-600">ارسال مجدد کد</span>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  با ورود و ثبت‌نام در سایت، شما{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    قوانین و مقررات
                  </Link>{" "}
                  استفاده از خدمات را می‌پذیرید.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
