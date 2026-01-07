"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loading } from "@/components/ui/Loading";

/**
 * صفحه Callback پرداخت زرین‌پال
 *
 * این صفحه بعد از بازگشت از درگاه پرداخت نمایش داده می‌شود.
 * Backend خودش verify می‌کند و به /order/success یا /order/failed redirect می‌کند.
 *
 * Query Parameters:
 * - Authority: کد authority از زرین‌پال
 * - Status: OK (موفق) یا NOK (ناموفق/لغو شده)
 */
export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");

    // ✅ بررسی Status
    if (status === "OK" && authority) {
      // ✅ پرداخت موفق - Backend خودش verify می‌کند
      // فقط منتظر redirect از Backend بمانید
      // Backend به /order/success یا /order/failed redirect می‌کند
      setLoading(true);

      // ✅ اگر بعد از 5 ثانیه redirect نشد، به صفحه failed برو
      const timeout = setTimeout(() => {
        router.push("/order/failed");
      }, 5000);

      return () => clearTimeout(timeout);
    } else {
      // ✅ پرداخت ناموفق یا لغو شده
      router.push("/order/failed");
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading size="lg" text="در حال بررسی پرداخت..." />
        </div>
      </div>
    );
  }

  return null;
}
