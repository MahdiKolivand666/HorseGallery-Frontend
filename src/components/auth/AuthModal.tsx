"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [mounted, setMounted] = useState(false);
  const { cart, mergeCart, reloadCart } = useCart();

  useEffect(() => {
    // Client-side only mounting to prevent hydration mismatch
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset form when closing
      setTimeout(() => {
        setStep("phone");
        setPhoneNumber("");
        setOtp(["", "", "", "", "", ""]);
      }, 300);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length === 11) {
      setStep("otp");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 5) {
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
    if (otpCode.length === 6) {
      try {
        // Handle OTP verification
        // TODO: Connect to backend API
        // بعد از لاگین موفق:
        // 1. Token را در localStorage ذخیره کنید
        // 2. اگر سبد مهمان وجود داشت، merge کنید
        // 3. سبد را reload کنید

        // مثال:
        // const response = await loginAPI(phoneNumber, otpCode);
        // localStorage.setItem("token", response.token);

        // اگر سبد مهمان وجود داشت، merge کن
        if (cart?.cart?.sessionId) {
          try {
            await mergeCart();
          } catch (mergeError) {
            console.error("Error merging cart:", mergeError);
            // اگر merge خطا داد، فقط سبد را reload کن
            await reloadCart();
          }
        }

        onClose();
      } catch (error) {
        console.error("Login error:", error);
        // Handle login error
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white shadow-2xl z-[9999] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {step === "phone" ? "ورود / ثبت‌نام" : "تأیید شماره موبایل"}
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
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 11) {
                          setPhoneNumber(value);
                        }
                      }}
                      placeholder="09123456789"
                      className="w-full px-4 py-3 border border-gray-300 focus:border-primary focus:outline-none text-center text-lg tracking-wider"
                      dir="ltr"
                      maxLength={11}
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-gray-500 text-right">
                      کد تأیید به این شماره ارسال می‌شود
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={phoneNumber.length !== 11}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    دریافت کد تأیید
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      کد ارسال شده به شماره{" "}
                      <span className="font-semibold text-gray-900" dir="ltr">
                        {phoneNumber}
                      </span>{" "}
                      را وارد کنید
                    </p>

                    <div className="flex gap-2 justify-center mb-4" dir="ltr">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 focus:border-primary focus:outline-none"
                          maxLength={1}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="text-sm text-primary hover:text-primary/80 transition-colors block mx-auto"
                    >
                      ویرایش شماره موبایل
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={otp.join("").length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    تأیید و ورود
                  </button>

                  <button
                    type="button"
                    className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ارسال مجدد کد (۰۲:۰۰)
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
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
