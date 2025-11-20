"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Info } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"phone" | "register">("phone");

  // Form fields for registration
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // انتقال به مرحله ثبت‌نام
    setStep("register");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // اینجا لاجیک ثبت‌نام نهایی قرار می‌گیره
    console.log("Registration data:", {
      phoneNumber,
      firstName,
      lastName,
      nationalCode,
      email,
      verificationCode,
    });
  };

  const handleResendCode = () => {
    // اینجا لاجیک ارسال مجدد کد
    console.log("Resending code...");
  };

  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />

      {/* Modal Content */}
      <div
        className={`relative w-full mx-4 bg-white shadow-2xl transition-all ${
          step === "phone" ? "max-w-lg" : "max-w-lg"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-base font-normal text-gray-900">
            {step === "phone" ? "ورود / ثبت‌نام" : "عضویت در هورس گالری"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-8">
          {step === "phone" ? (
            // Phone Step
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="phone"
                  className="w-28 text-xs text-gray-900 font-medium text-right"
                >
                  شماره تلفن همراه
                </label>
                <div className="flex-1">
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="لطفاً تلفن همراه خود را وارد کنید"
                    className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-gray-900 placeholder:text-gray-400 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 transition-colors text-sm"
              >
                ورود / ثبت‌نام
              </button>
            </form>
          ) : (
            // Registration Step
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* First Name */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="firstName"
                  className="w-28 text-xs text-gray-900 font-medium text-right"
                >
                  نام
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="نام خود را وارد کنید"
                    className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-gray-900 placeholder:text-gray-400 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="lastName"
                  className="w-28 text-xs text-gray-900 font-medium text-right"
                >
                  نام خانوادگی
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="نام خانوادگی خود را وارد کنید"
                    className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-gray-900 placeholder:text-gray-400 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* National Code */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="nationalCode"
                  className="w-28 text-xs text-gray-900 font-medium text-right"
                >
                  کد ملی
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    id="nationalCode"
                    value={nationalCode}
                    onChange={(e) => setNationalCode(e.target.value)}
                    placeholder="ثبت کد ملی برای احراز هویت و امنیت خرید"
                    className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-gray-900 placeholder:text-gray-400 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="email"
                  className="w-28 text-xs text-gray-900 font-medium text-right"
                >
                  آدرس ایمیل
                </label>
                <div className="flex-1">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ثبت ایمیل معتبر جهت دریافت ۱۰,۰۰۰ تومان اعتبار"
                    className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-gray-900 placeholder:text-gray-400 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Verification Code */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="verificationCode"
                  className="w-28 text-xs text-gray-900 font-medium text-right"
                >
                  کد تایید
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="کد تایید را وارد کنید"
                    className="w-full px-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-gray-900 placeholder:text-gray-400 text-sm"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 transition-colors text-sm"
                >
                  ارسال مجدد کد
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 transition-colors text-sm"
                >
                  ثبت‌نام
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer - Only show in phone step */}
        {step === "phone" && (
          <div className="px-6 py-4 flex items-center justify-start gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            <Link
              href="/auth/guide"
              onClick={onClose}
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              راهنمای ثبت‌نام و خرید
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
