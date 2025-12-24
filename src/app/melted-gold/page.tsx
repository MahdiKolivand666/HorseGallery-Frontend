"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator, Clock, Home, ChevronLeft, Info } from "lucide-react";
import { getGoldPrice } from "@/lib/api/gold";
import {
  addGoldToPurchase,
  getGoldInvestmentInfo,
  GoldInvestmentInfo,
} from "@/lib/api/gold-investment";
import { isLoggedIn } from "@/lib/api/auth";
import AuthModal from "@/components/auth/AuthModal";
import {
  isIncompleteRegistrationError,
  isOtpVerificationExpiredError,
  isOtpRequiredError,
} from "@/types/errors";

export default function MeltedGoldPage() {
  const router = useRouter();
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [investmentInfo, setInvestmentInfo] =
    useState<GoldInvestmentInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [incompleteRegistrationPhone, setIncompleteRegistrationPhone] =
    useState<string | null>(null);
  const [otpExpiredPhone, setOtpExpiredPhone] = useState<string | null>(null);
  const [otpRequiredPhone, setOtpRequiredPhone] = useState<string | null>(null);

  // دریافت قیمت طلا
  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        const priceData = await getGoldPrice();
        setGoldPrice(priceData.price);
      } catch (error) {
        console.error("Error fetching gold price:", error);
        // ❌ هیچ fallback price استفاده نمی‌شود - فقط قیمت online
        setGoldPrice(null);
      }
    };

    fetchGoldPrice();

    // به‌روزرسانی قیمت هر 60 ثانیه (مطابق با cache Backend)
    const interval = setInterval(fetchGoldPrice, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // دریافت اطلاعات خرید طلا
  useEffect(() => {
    const fetchInvestmentInfo = async () => {
      try {
        setLoadingInfo(true);
        const info = await getGoldInvestmentInfo();
        setInvestmentInfo(info);
      } catch (error) {
        console.error("Error fetching investment info:", error);
        // در صورت خطا، investmentInfo null می‌ماند
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchInvestmentInfo();
  }, []);

  // محاسبه مقدار طلا هنگام تغییر مبلغ
  // ⚠️ فقط اگر قیمت online از API دریافت شده باشد
  useEffect(() => {
    if (amount && goldPrice && goldPrice > 0) {
      const numAmount = parseFloat(amount.replace(/,/g, ""));
      if (!isNaN(numAmount) && numAmount > 0) {
        // محاسبه در frontend فقط برای نمایش
        // محاسبه واقعی در backend انجام می‌شود
        const grams = numAmount / goldPrice;
        setGoldGrams(grams);
      } else {
        setGoldGrams(0);
      }
    } else {
      setGoldGrams(0);
    }
  }, [amount, goldPrice]);

  // تبدیل اعداد فارسی به انگلیسی
  const persianToEnglish = (str: string): string => {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const englishDigits = "0123456789";
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const index = persianDigits.indexOf(char);
      if (index !== -1) {
        result += englishDigits[index];
      } else {
        result += char;
      }
    }
    return result;
  };

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // تبدیل اعداد فارسی به انگلیسی برای پردازش
    const value = persianToEnglish(e.target.value);

    // حذف تمام جداکننده‌ها و کاراکترهای غیرعددی
    const rawValue = value.replace(/,/g, "").replace(/[^\d]/g, "");

    // ذخیره مقدار خام (بدون comma) برای محاسبات (به انگلیسی)
    // نمایش در input به صورت خودکار به فارسی تبدیل می‌شود
    setAmount(rawValue);
  };

  // جلوگیری از ورود کاراکترهای غیرعددی
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // اجازه دادن به کلیدهای کنترل
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Tab" ||
      e.key === "Enter" ||
      (e.ctrlKey &&
        (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
    ) {
      return;
    }

    // بررسی اینکه آیا کاراکتر عدد است (انگلیسی یا فارسی)
    const englishDigits = "0123456789";
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const isNumeric =
      englishDigits.includes(e.key) || persianDigits.includes(e.key);

    // اگر کاراکتر عدد نیست، از ورود آن جلوگیری می‌کنیم
    if (!isNumeric) {
      e.preventDefault();
    }
  };

  // مدیریت paste - فقط اعداد را نگه می‌دارد
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    // تبدیل اعداد فارسی به انگلیسی و حذف کاراکترهای غیرعددی
    const englishText = persianToEnglish(pastedText);
    const numericOnly = englishText.replace(/[^\d]/g, "");

    if (numericOnly) {
      setAmount(numericOnly);
    }
  };

  // فرمت کردن عدد با جداکننده هزارگان فارسی
  const formatNumber = (num: number): string => {
    // برای اعداد اعشاری، از toFixed استفاده می‌کنیم
    const numStr = num.toString();
    const hasDecimal = numStr.includes(".");

    if (hasDecimal) {
      // برای اعداد اعشاری، جداکننده هزارگان و اعشار را حفظ می‌کنیم
      const parts = numStr.split(".");
      const integerPart = parseFloat(parts[0]).toLocaleString("en-US");
      const decimalPart = parts[1];
      const formatted = `${integerPart}.${decimalPart}`;
      return englishToPersian(formatted);
    } else {
      // برای اعداد صحیح، فقط جداکننده هزارگان
      const formatted = num.toLocaleString("en-US");
      return englishToPersian(formatted);
    }
  };

  // تبدیل عدد به کلمات فارسی (ساده شده)
  const numberToWords = (num: number): string => {
    if (num === 0) return "صفر";

    const ones = [
      "",
      "یک",
      "دو",
      "سه",
      "چهار",
      "پنج",
      "شش",
      "هفت",
      "هشت",
      "نه",
      "ده",
      "یازده",
      "دوازده",
      "سیزده",
      "چهارده",
      "پانزده",
      "شانزده",
      "هفده",
      "هجده",
      "نوزده",
    ];
    const tens = [
      "",
      "",
      "بیست",
      "سی",
      "چهل",
      "پنجاه",
      "شصت",
      "هفتاد",
      "هشتاد",
      "نود",
    ];
    const hundreds = [
      "",
      "یکصد",
      "دویست",
      "سیصد",
      "چهارصد",
      "پانصد",
      "ششصد",
      "هفتصد",
      "هشتصد",
      "نهصد",
    ];

    if (num < 20) return ones[num];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const one = num % 10;
      return tens[ten] + (one > 0 ? " و " + ones[one] : "");
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const remainder = num % 100;
      return (
        hundreds[hundred] +
        (remainder > 0 ? " و " + numberToWords(remainder) : "")
      );
    }
    if (num < 1000000) {
      const thousand = Math.floor(num / 1000);
      const remainder = num % 1000;
      return (
        numberToWords(thousand) +
        " هزار" +
        (remainder > 0 ? " و " + numberToWords(remainder) : "")
      );
    }
    if (num < 1000000000) {
      const million = Math.floor(num / 1000000);
      const remainder = num % 1000000;
      return (
        numberToWords(million) +
        " میلیون" +
        (remainder > 0 ? " و " + numberToWords(remainder) : "")
      );
    }
    return formatNumber(num); // برای اعداد خیلی بزرگ، از formatNumber استفاده می‌کنیم
  };

  const handleAddToCart = async () => {
    // ✅ چک کردن اینکه آیا کاربر لاگین است
    if (!isLoggedIn()) {
      setIsAuthModalOpen(true);
      return;
    }

    // ✅ بررسی registrationStatus (این بررسی در backend انجام می‌شود، اما برای UX بهتر اینجا هم چک می‌کنیم)
    // اگر backend خطا بدهد، از پیام backend استفاده می‌کنیم

    if (!goldPrice || goldPrice <= 0) {
      alert(
        "قیمت طلا در دسترس نیست. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید."
      );
      return;
    }

    if (!amount || goldGrams <= 0) {
      alert("لطفاً مبلغ را وارد کنید");
      return;
    }

    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (numAmount <= 0) {
      alert("مبلغ باید بیشتر از صفر باشد");
      return;
    }

    // بررسی حداقل و حداکثر مبلغ از backend
    if (investmentInfo) {
      if (numAmount < investmentInfo.minAmount) {
        alert(`حداقل مبلغ ${formatNumber(investmentInfo.minAmount)} تومان است`);
        return;
      }
      if (numAmount > investmentInfo.maxAmount) {
        alert(
          `حداکثر مبلغ ${formatNumber(investmentInfo.maxAmount)} تومان است`
        );
        return;
      }
    } else {
      // Fallback در صورت عدم دریافت اطلاعات
      if (numAmount < 1000000) {
        alert("حداقل مبلغ ۱,۰۰۰,۰۰۰ تومان است");
        return;
      }
    }

    setAddingToCart(true);

    try {
      // ارسال مبلغ به backend برای افزودن به purchase
      await addGoldToPurchase(numAmount);

      // ✅ Set flag که کاربر طلای آب‌شده دارد (در localStorage تا بعد از reload هم حفظ شود)
      if (typeof window !== "undefined") {
        localStorage.setItem("hasGoldPurchase", "true");
      }

      // هدایت مستقیم به صفحه سبد خرید
      router.push("/purchase/basket");
    } catch (error: unknown) {
      // error ممکن است یک Error instance با properties اضافی باشد
      const errorWithDetails = error as Error & {
        statusCode?: number;
        code?: string;
        requiresRegistration?: boolean;
        isAuthenticated?: boolean;
        requiresOtpVerification?: boolean;
        phoneNumber?: string | null;
      };

      // ✅ مهم: اول چک کن که آیا OTP_REQUIRED است
      if (isOtpRequiredError(errorWithDetails)) {
        // ✅ کاربر لاگین است اما OTP verify نشده - باید modal OTP باز شود
        // ✅ پاک کردن سایر state ها
        setOtpExpiredPhone(null);
        setIncompleteRegistrationPhone(null);
        // ✅ باز کردن modal با step="otp" برای verify OTP
        setOtpRequiredPhone(errorWithDetails.phoneNumber || null);
        setIsAuthModalOpen(true);
        return; // ✅ return کن تا خطا نمایش داده نشود
      }

      // ✅ سپس چک کن که آیا OTP_VERIFICATION_EXPIRED است
      if (isOtpVerificationExpiredError(errorWithDetails)) {
        // ✅ احراز هویت منقضی شده - کاربر باید دوباره OTP بگیرد
        // ✅ پاک کردن token و pendingOtpCode
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("pendingOtpCode");
          localStorage.removeItem("userInfo");
        }
        // ✅ باز کردن modal با step="phone" برای دریافت OTP جدید
        setOtpExpiredPhone(errorWithDetails.phoneNumber || null);
        setIncompleteRegistrationPhone(null); // پاک کردن incomplete registration phone
        setIsAuthModalOpen(true);
        return; // ✅ return کن تا خطا نمایش داده نشود
      }

      // ✅ سپس چک کن که آیا INCOMPLETE_REGISTRATION است
      if (isIncompleteRegistrationError(errorWithDetails)) {
        // ✅ کاربر لاگین است اما اطلاعات کامل ندارد
        // ✅ اول باید OTP را verify کند، سپس به register برود
        // ✅ فقط modal را باز کن - خطا را نمایش نده
        // ⚠️ خطا را در console نمایش نده - این یک flow عادی است
        setIncompleteRegistrationPhone(errorWithDetails.phoneNumber || null);
        setOtpRequiredPhone(null); // پاک کردن otpRequiredPhone
        setOtpExpiredPhone(null); // پاک کردن otpExpiredPhone
        setIsAuthModalOpen(true);
        return; // ✅ return کن تا خطا نمایش داده نشود
      }

      // ✅ فقط برای سایر خطاها، خطا را نمایش بده
      let errorMessage = "خطا در افزودن به purchase";
      if (error instanceof Error) {
        errorMessage = error.message;

        // بهبود پیام خطا برای انواع مختلف
        if (error.message.includes("درخواست‌های زیادی")) {
          errorMessage =
            "⚠️ درخواست‌های زیادی ارسال شده است. لطفاً چند دقیقه صبر کنید و دوباره تلاش کنید.";
        } else if (error.message.includes("قیمت لحظه‌ای")) {
          errorMessage =
            "⚠️ خطا در دریافت قیمت لحظه‌ای طلا. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.";
        } else if (error.message.includes("اتصال به سرور")) {
          errorMessage =
            "⚠️ خطا در اتصال به سرور. لطفاً اتصال اینترنت را بررسی کنید.";
        }
      }

      console.error("Error adding to purchase:", error);
      alert(errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] sm:pt-[105px] lg:pt-[105px]">
      {/* Hero Image */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96">
        <Image
          src="/images/headerwallp/goldBar.jpg"
          alt="شمش طلا"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-end justify-start p-6 sm:p-8 lg:p-12">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#e8f5e9] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-wide">
            خرید طلا به صورت آنلاین
          </h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">خرید طلا</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calculator Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">
              محاسبه مقدار طلا
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image */}
            <div className="relative h-64 lg:h-[600px] rounded-lg overflow-hidden border border-gray-200">
              <Image
                src="/images/products/goldbarphoto.webp"
                alt="طلا"
                fill
                className="object-cover"
              />
            </div>

            {/* Right Side - Form */}
            <div className="space-y-6">
              {/* مبلغ پرداختی */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ پرداختی (تومان) *
                </label>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-300">
                  <input
                    type="text"
                    value={
                      amount
                        ? formatNumber(
                            parseFloat(amount.replace(/,/g, "") || "0")
                          )
                        : ""
                    }
                    onChange={handleAmountChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    inputMode="numeric"
                    placeholder="مثال: ۱۰,۰۰۰,۰۰۰"
                    dir="rtl"
                    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder:text-gray-400 text-[1.4rem] text-end"
                  />
                  <span className="text-base text-gray-400 mr-2">تومان</span>
                </div>
              </div>

              {/* مقدار طلا */}
              <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">مقدار طلا:</span>
                  <span className="font-medium text-gray-900">
                    {goldGrams > 0 ? (
                      <>
                        <span className="text-[1.4rem]">
                          {formatNumber(
                            Math.round(Number(goldGrams.toFixed(4)) * 1000)
                          )}
                        </span>
                        <span className="text-base text-gray-400">
                          {" "}
                          میلی‌گرم
                        </span>
                      </>
                    ) : (
                      "--"
                    )}
                  </span>
                </div>
                {goldGrams > 0 &&
                  amount &&
                  parseFloat(amount.replace(/,/g, "")) > 0 && (
                    <p className="text-xs text-gray-600 text-right flex items-center gap-1 justify-start">
                      <Info className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-bold">
                        {formatNumber(Number(goldGrams.toFixed(3)))} گرم (معادل{" "}
                        {numberToWords(parseFloat(amount.replace(/,/g, "")))}{" "}
                        تومان)
                      </span>
                    </p>
                  )}
              </div>

              {/* قیمت لحظه‌ای طلا */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute w-3 h-3 bg-red-600 rounded-full animate-ping opacity-75"></span>
                    <span className="relative w-3 h-3 bg-red-600 rounded-full block"></span>
                  </div>
                  <span className="text-sm text-gray-600">
                    قیمت لحظه‌ای طلا:
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  {goldPrice
                    ? `${formatNumber(goldPrice)} تومان`
                    : "در حال دریافت..."}
                </span>
              </div>

              {/* حداقل خرید */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">حداقل خرید:</span>
                <span className="font-medium text-gray-900">
                  {loadingInfo || !investmentInfo
                    ? "در حال محاسبه"
                    : `${formatNumber(investmentInfo.minAmount)} تومان`}
                </span>
              </div>

              {/* حداکثر خرید */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">حداکثر خرید:</span>
                <span className="font-medium text-gray-900">
                  {loadingInfo || !investmentInfo
                    ? "در حال محاسبه"
                    : `${formatNumber(investmentInfo.maxAmount)} تومان`}
                </span>
              </div>

              {/* کارمزد خرید */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">کارمزد خرید:</span>
                <span className="font-medium text-gray-900">
                  {loadingInfo || !investmentInfo
                    ? "در حال بروزرسانی"
                    : investmentInfo.commissionAmount
                    ? `${formatNumber(investmentInfo.commissionAmount)} تومان`
                    : investmentInfo.commission
                    ? `%${englishToPersian(
                        investmentInfo.commission.toString()
                      )}`
                    : "نامشخص"}
                </span>
              </div>

              {/* لینک محدودیت‌های خرید و فروش */}
              {investmentInfo?.restrictionsLink && (
                <div className="text-center">
                  <Link
                    href={investmentInfo.restrictionsLink}
                    className="text-sm text-primary hover:text-primary/80 underline"
                  >
                    محدودیت‌های خرید و فروش
                  </Link>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={
                  !goldGrams ||
                  goldGrams <= 0 ||
                  addingToCart ||
                  !goldPrice ||
                  (investmentInfo
                    ? parseFloat(amount.replace(/,/g, "")) <
                        investmentInfo.minAmount ||
                      parseFloat(amount.replace(/,/g, "")) >
                        investmentInfo.maxAmount
                    : parseFloat(amount.replace(/,/g, "")) < 1000000)
                }
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>در حال اضافه کردن...</span>
                  </>
                ) : (
                  <>
                    <span>افزودن به سبد خرید</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setIncompleteRegistrationPhone(null);
          setOtpExpiredPhone(null);
          setOtpRequiredPhone(null);
        }}
        initialPhoneNumber={
          otpRequiredPhone ||
          otpExpiredPhone ||
          incompleteRegistrationPhone ||
          undefined
        }
        initialStep={
          otpRequiredPhone
            ? "otp"
            : otpExpiredPhone
            ? "phone"
            : incompleteRegistrationPhone
            ? "otp" // ✅ تغییر: به جای register، به otp برود
            : undefined
        }
        isFromIncompleteRegistration={!!incompleteRegistrationPhone} // ✅ flag برای نمایش پیام
      />
    </div>
  );
}
