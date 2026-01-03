"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  AlertCircle,
  Info,
  AlarmClockMinus,
  TriangleAlert,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";
import { englishToPersian } from "@/lib/utils/persianNumber";
import { useTranslations } from "next-intl";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const router = useRouter();
  const t = useTranslations("cart.drawer");
  const [mounted, setMounted] = useState(false);
  const hasReloadedRef = useRef(false);
  const {
    cart,
    loading,
    totalItems,
    totalPrice,
    remainingSeconds,
    removeFromCart,
    reloadCart,
    clearCart,
  } = useCart();

  // ✅ تعریف reloadCartRef در ابتدا (قبل از استفاده)
  const reloadCartRef = useRef(reloadCart);
  useEffect(() => {
    reloadCartRef.current = reloadCart;
  }, [reloadCart]);

  useEffect(() => {
    // Client-side only mounting to prevent hydration mismatch
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // ✅ استفاده از ref به جای direct call
      if (!hasReloadedRef.current) {
        reloadCartRef.current();
        hasReloadedRef.current = true;
      }
    } else {
      document.body.style.overflow = "unset";
      // Reset flag وقتی drawer بسته می‌شود
      hasReloadedRef.current = false;
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Timer countdown - استفاده از remainingSeconds از backend
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  useEffect(() => {
    // ✅ اگر cart expired است، timeLeft را به‌روز نکن (0 نگه دار)
    const isExpired = cart?.expired === true || remainingSeconds <= 0;
    if (isExpired) {
      setTimeout(() => setTimeLeft(0), 0);
      return;
    }
    // Update timer when remainingSeconds changes from backend
    setTimeout(() => setTimeLeft(remainingSeconds), 0);
  }, [remainingSeconds, cart]);

  // ✅ Polling کاملاً حذف شد - فقط یکبار وقتی drawer باز می‌شود reload می‌شود
  // ✅ تایمر client-side - فقط یک بار اجرا می‌شود و timeLeft را از state می‌خواند
  useEffect(() => {
    if (!isOpen) return;

    // ✅ اگر cart خالی است، timer را اجرا نکن
    const cartItems = (cart?.items || []).filter(
      (item) => item.product.productType !== "melted_gold"
    );
    if (cartItems.length === 0) return;

    // ✅ اگر cart expired است یا remainingSeconds <= 0 است، timer را اجرا نکن
    const isExpired = cart?.expired === true || remainingSeconds <= 0;
    if (isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // ✅ چک کردن که cart هنوز خالی نشده باشد و expired نشده باشد
          const currentCartItems = (cart?.items || []).filter(
            (item) => item.product.productType !== "melted_gold"
          );
          const currentIsExpired =
            cart?.expired === true || remainingSeconds <= 0;
          if (currentCartItems.length > 0 && !currentIsExpired) {
            setTimeout(() => {
              reloadCartRef.current();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, cart, remainingSeconds]); // ✅ اضافه کردن remainingSeconds به dependency

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
      .replace(/0/g, "۰")
      .replace(/1/g, "۱")
      .replace(/2/g, "۲")
      .replace(/3/g, "۳")
      .replace(/4/g, "۴")
      .replace(/5/g, "۵")
      .replace(/6/g, "۶")
      .replace(/7/g, "۷")
      .replace(/8/g, "۸")
      .replace(/9/g, "۹");
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (!mounted) return null;

  // ✅ فیلتر کردن طلای آب شده از cart (باید فقط در purchase باشد)
  const cartItems = (cart?.items || []).filter(
    (item) => item.product.productType !== "melted_gold"
  );
  const isEmpty = !loading && cartItems.length === 0;
  const isExpired = cart?.expired === true; // ✅ بررسی expired flag

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-[9998] ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl transition-transform duration-300 ease-in-out z-[9999] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Warning Bar */}
        <div className="bg-white px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">{t("warning")}</p>
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t("title")} ({totalItems.toLocaleString("fa-IR")})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer - از backend */}
            {!isEmpty && !isExpired && timeLeft > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-700">
                  {t("purchaseDeadline")}
                </span>
                <span
                  className={`text-xs font-bold text-white px-2 py-0.5 rounded inline-block text-center tabular-nums min-w-[2.5rem] ${
                    timeLeft < 60 ? "bg-red-600" : "bg-red-500"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
                {timeLeft < 60 && (
                  <TriangleAlert className="w-3 h-3 text-yellow-500" />
                )}
              </div>
            )}
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-50 transition-colors"
              aria-label={t("close")}
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-gray-500">{t("loading")}</p>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-600 flex-shrink-0" />
                {t("empty.title")}
              </h3>
              <Link
                href="/products/women"
                onClick={onClose}
                className="px-6 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium rounded"
              >
                {t("empty.viewProducts")}
              </Link>
            </div>
          ) : isExpired ? (
            // ✅ نمایش پیام expired
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="bg-red-100 rounded-full p-6 mb-4">
                <AlarmClockMinus className="w-16 h-16 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <AlarmClockMinus className="w-5 h-5 text-red-600 flex-shrink-0" />
                {t("expired.title")}
              </h3>
              <p className="text-sm text-gray-600 mb-6 flex items-center gap-2 justify-center">
                <Info className="w-4 h-4 text-gray-600 flex-shrink-0" />
                {t("expired.message")}
              </p>
              <button
                onClick={() => {
                  clearCart();
                  onClose();
                  router.push("/");
                }}
                className="px-6 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium rounded"
              >
                {t("expired.backToProducts")}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item.product;
                  const productImage =
                    product.productType === "coin"
                      ? "/images/products/coinphoto.webp"
                      : product.productType === "melted_gold"
                      ? "/images/products/goldbarphoto.webp"
                      : product.images[0] || "/images/products/product1.webp";

                  // Get category slug from product slug or use default
                  const categorySlug = product.slug.split("/")[0] || "products";

                  return (
                    <div
                      key={item._id}
                      className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex gap-3">
                        {/* Image */}
                        <Link
                          href={`/${categorySlug}/${product.slug}`}
                          onClick={onClose}
                          className="relative w-24 h-24 flex-shrink-0 border border-gray-300 rounded overflow-hidden"
                        >
                          <Image
                            src={productImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          {/* Discount Badge - از backend */}
                          {item.discount && item.discount > 0 && (
                            <div className="absolute top-1 right-1 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {item.discount.toLocaleString("fa-IR")}٪
                            </div>
                          )}
                        </Link>

                        {/* Details */}
                        <div className="flex-1">
                          {/* Title and Delete Button */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Link
                              href={`/${categorySlug}/${product.slug}`}
                              onClick={onClose}
                              className="text-sm font-semibold text-gray-900 hover:text-primary line-clamp-1 flex-1"
                            >
                              {product.name}
                            </Link>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              className="text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
                              aria-label={t("product.remove")}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <p className="text-xs text-gray-500 mb-2">
                            {product.code}
                          </p>

                          {/* ✨ برای سکه: نوع، وزن و سال ضرب */}
                          {product.productType === "coin" &&
                            product.goldInfo && (
                              <>
                                {product.goldInfo.denomination && (
                                  <p className="text-xs text-gray-600 mb-1">
                                    <span className="text-gray-500">
                                      {t("product.type")}:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {product.goldInfo.denomination}
                                    </span>
                                  </p>
                                )}
                                {/* وزن */}
                                <p className="text-xs text-gray-600 mb-1">
                                  <span className="text-gray-500">
                                    {t("product.weight")}:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {product.weight
                                      ? englishToPersian(product.weight)
                                      : product.goldInfo.weight
                                      ? `${englishToPersian(
                                          String(product.goldInfo.weight)
                                        )} {t("product.gram")}`
                                      : t("product.unknown")}
                                  </span>
                                </p>
                                {product.goldInfo.mintYear && (
                                  <p className="text-xs text-gray-600">
                                    <span className="text-gray-500">
                                      {t("product.mintYear")}:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {product.goldInfo.mintYear}
                                    </span>
                                  </p>
                                )}
                              </>
                            )}

                          {/* برای جواهرات: وزن و سایز */}
                          {product.productType !== "coin" && (
                            <>
                              {/* وزن - همیشه نمایش داده می‌شود */}
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="text-gray-500">وزن: </span>
                                <span className="font-medium">
                                  {product.weight
                                    ? englishToPersian(product.weight)
                                    : product.goldInfo?.weight
                                    ? `${englishToPersian(
                                        String(product.goldInfo.weight)
                                      )} گرم`
                                    : "نامشخص"}
                                </span>
                              </p>
                              {/* سایز */}
                              {item.size && (
                                <p className="text-xs text-gray-600">
                                  <span className="text-gray-500">
                                    {t("product.size")}:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {englishToPersian(item.size)}
                                  </span>
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer - Price - از backend (بدون محاسبه) */}
                      <div className="flex items-center justify-end pt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-gray-500">
                            {t("product.price")}:
                          </span>
                          {(() => {
                            // برای طلای آب‌شده از unitPrice استفاده می‌کنیم
                            const displayPrice =
                              product.productType === "melted_gold" &&
                              item.unitPrice
                                ? item.unitPrice
                                : item.price;
                            const displayOriginalPrice =
                              product.productType === "melted_gold" &&
                              item.unitOriginalPrice
                                ? item.unitOriginalPrice
                                : item.originalPrice;

                            return displayOriginalPrice > displayPrice ? (
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-bold text-red-600">
                                  {displayPrice.toLocaleString("fa-IR")}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  {displayOriginalPrice.toLocaleString("fa-IR")}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {t("summary.currency")}
                                </span>
                              </div>
                            ) : (
                              <>
                                <span className="text-base font-bold text-gray-900">
                                  {displayPrice.toLocaleString("fa-IR")}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {t("summary.currency")}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="py-4 -mx-4 px-4">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Summary and Buttons - Below Cards */}
              <div className="bg-white -mx-4 px-4 pb-4">
                {/* Subtotal */}
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="text-gray-700 font-medium text-sm">
                    {t("summary.subtotal")}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {cart?.prices?.totalWithDiscount
                        ? cart.prices.totalWithDiscount.toLocaleString("fa-IR")
                        : totalPrice.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-xs text-gray-600">
                      {t("summary.currency")}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="w-1/3 bg-white hover:bg-gray-50 text-gray-700 text-center py-2 font-medium transition-colors border border-gray-300 rounded text-sm"
                  >
                    {t("summary.continueShopping")}
                  </button>
                  <Link
                    href="/purchase/basket"
                    onClick={onClose}
                    prefetch={false}
                    className={`flex-1 text-center py-2 font-medium transition-colors rounded text-sm ${
                      isExpired
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed pointer-events-none"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    {t("summary.completePurchase")}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default CartDrawer;
