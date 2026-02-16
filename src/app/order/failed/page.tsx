"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, Home, RefreshCw, ArrowRight } from "lucide-react";

/**
 * صفحه خطای پرداخت
 * 
 * این صفحه بعد از پرداخت ناموفق یا لغو شده نمایش داده می‌شود.
 * Query Parameter: id (orderId) - Order ID قابل خواندن (فرمت: ORD-YYYYMMDD-HHMMSS-RANDOM) - اختیاری
 */
export default function OrderFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("id");

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            پرداخت ناموفق بود
          </h1>
          <p className="text-gray-600 mb-2">
            متأسفانه پرداخت شما انجام نشد.
          </p>
          <p className="text-gray-600 mb-6">
            لطفاً دوباره تلاش کنید یا در صورت بروز مشکل با پشتیبانی تماس بگیرید.
          </p>

          {/* Possible Reasons */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-right">
            <h3 className="font-semibold text-yellow-900 mb-2">
              دلایل احتمالی:
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>عدم موجودی کافی در حساب بانکی</li>
              <li>لغو پرداخت توسط شما</li>
              <li>مشکل در ارتباط با درگاه پرداخت</li>
              <li>انقضای زمان پرداخت</li>
            </ul>
          </div>

          {/* Order ID (if available) */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">شماره سفارش:</span>
                <span className="font-bold text-gray-900 font-mono">{orderId}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderId ? (
              <button
                onClick={() => router.push(`/purchase/basket`)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                تلاش مجدد
              </button>
            ) : (
              <Link
                href="/purchase/basket"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                بازگشت به سبد خرید
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg font-medium"
            >
              <Home className="w-5 h-5" />
              بازگشت به صفحه اصلی
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>نیاز به کمک دارید؟</strong> در صورت بروز مشکل، با پشتیبانی
              تماس بگیرید. ما آماده کمک به شما هستیم.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
