"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { Loading } from "@/components/ui/Loading";

interface OrderDetails {
  orderId: string; // ✅ Order ID قابل خواندن (فرمت: ORD-YYYYMMDD-HHMMSS-RANDOM)
  orderNumber?: string; // برای سازگاری با backend (اختیاری)
  finalPrice?: number;
  createdAt?: string;
}

/**
 * صفحه موفقیت پرداخت
 *
 * این صفحه بعد از پرداخت موفق نمایش داده می‌شود.
 * Query Parameter: id (orderId) - Order ID قابل خواندن (فرمت: ORD-YYYYMMDD-HHMMSS-RANDOM)
 */
export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("id");

  // ✅ Initialize order from orderId using useMemo
  const order: OrderDetails | null = useMemo(
    () => (orderId ? { orderId: orderId } : null),
    [orderId]
  );

  useEffect(() => {
    if (!orderId) {
      // ✅ اگر orderId نبود، به صفحه اصلی برو
      router.push("/");
    }
  }, [orderId, router]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="در حال بارگذاری..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            پرداخت با موفقیت انجام شد
          </h1>
          <p className="text-gray-600 mb-6">
            سفارش شما با موفقیت ثبت و پرداخت شد. از خرید شما متشکریم.
          </p>

          {/* Order Details */}
          {order && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">شماره سفارش:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    {order.orderNumber || order.orderId}
                  </span>
                </div>
                {order.finalPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">مبلغ پرداختی:</span>
                    <span className="font-bold text-primary">
                      {order.finalPrice.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg font-medium"
            >
              <Home className="w-5 h-5" />
              بازگشت به صفحه اصلی
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg font-medium"
            >
              <ShoppingBag className="w-5 h-5" />
              ادامه خرید
            </Link>
          </div>

          {/* Info Message */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>نکته:</strong> رسید پرداخت به شماره موبایل شما ارسال خواهد
              شد. در صورت نیاز می‌توانید با پشتیبانی تماس بگیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
