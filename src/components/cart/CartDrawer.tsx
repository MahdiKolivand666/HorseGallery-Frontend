"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Trash2, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
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
  } = useCart();

  useEffect(() => {
    // Client-side only mounting to prevent hydration mismatch
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // فقط یک بار reload کن وقتی drawer باز می‌شود
      if (!hasReloadedRef.current) {
        reloadCart();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Timer countdown - استفاده از remainingSeconds از backend
  // برای UX بهتر، تایمر client-side داریم اما هر 30 ثانیه با backend sync می‌شود
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  useEffect(() => {
    // Update timer when remainingSeconds changes from backend
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds]);

  // Sync با backend هر 30 ثانیه
  useEffect(() => {
    if (!isOpen) return;

    const syncInterval = setInterval(() => {
      reloadCart(); // Sync با backend
    }, 30000); // هر 30 ثانیه

    return () => clearInterval(syncInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // تایمر client-side برای نمایش (UX بهتر)
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) {
      if (
        timeLeft <= 0 &&
        cart &&
        cart.items &&
        Array.isArray(cart.items) &&
        cart.items.length > 0
      ) {
        // ✅ از setTimeout استفاده می‌کنیم تا بعد از render اجرا شود (جلوگیری از خطای React)
        const timeoutId = setTimeout(() => {
          reloadCart();
        }, 0);
        return () => clearTimeout(timeoutId);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // ✅ از setTimeout استفاده می‌کنیم تا بعد از render اجرا شود (جلوگیری از خطای React)
          setTimeout(() => {
            reloadCart();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, cart, reloadCart]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
          <p className="text-xs text-amber-800">
            در صورت روشن بودن لطفا ابتدا فیلترشکن خود را خاموش و سپس مراحل خرید
            را دنبال کنید
          </p>
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
              سبد خرید ({totalItems.toLocaleString("fa-IR")})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer - از backend */}
            {!isEmpty && timeLeft > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-700">مهلت خرید:</span>
                <span
                  className={`text-xs font-bold text-white font-mono px-2 py-0.5 rounded ${
                    timeLeft < 60 ? "bg-red-600" : "bg-red-500"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
                {timeLeft < 60 && (
                  <span className="text-[10px] text-red-600 font-medium">
                    ⚠️
                  </span>
                )}
              </div>
            )}
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              aria-label="بستن"
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
              <p className="text-sm text-gray-500">در حال بارگذاری...</p>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <ShoppingBag className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                سبد خرید شما خالی است
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                برای مشاهده محصولات و افزودن به سبد خرید، به فروشگاه بروید
              </p>
              <Link
                href="/products/women"
                onClick={onClose}
                className="px-6 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium rounded"
              >
                مشاهده محصولات
              </Link>
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
                              {item.discount}٪
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
                              aria-label="حذف محصول"
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
                                    <span className="text-gray-500">نوع: </span>
                                    <span className="font-medium">
                                      {product.goldInfo.denomination}
                                    </span>
                                  </p>
                                )}
                                {/* وزن */}
                                <p className="text-xs text-gray-600 mb-1">
                                  <span className="text-gray-500">وزن: </span>
                                  <span className="font-medium">
                                    {product.weight ||
                                      (product.goldInfo.weight
                                        ? `${product.goldInfo.weight} گرم`
                                        : "نامشخص")}
                                  </span>
                                </p>
                                {product.goldInfo.mintYear && (
                                  <p className="text-xs text-gray-600">
                                    <span className="text-gray-500">
                                      سال ضرب:{" "}
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
                                  {product.weight ||
                                    (product.goldInfo?.weight
                                      ? `${product.goldInfo.weight} گرم`
                                      : "نامشخص")}
                                </span>
                              </p>
                              {/* سایز */}
                              {item.size && (
                                <p className="text-xs text-gray-600">
                                  <span className="text-gray-500">سایز: </span>
                                  <span className="font-medium">
                                    {item.size}
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
                          <span className="text-xs text-gray-500">قیمت:</span>
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
                                  تومان
                                </span>
                              </div>
                            ) : (
                              <>
                                <span className="text-base font-bold text-gray-900">
                                  {displayPrice.toLocaleString("fa-IR")}
                                </span>
                                <span className="text-xs text-gray-500">
                                  تومان
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
                    جمع سبد با تخفیف کالاها:
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {cart?.prices?.totalWithDiscount
                        ? cart.prices.totalWithDiscount.toLocaleString("fa-IR")
                        : totalPrice.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-xs text-gray-600">تومان</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="w-1/3 bg-white hover:bg-gray-50 text-gray-700 text-center py-2 font-medium transition-colors border border-gray-300 rounded text-sm"
                  >
                    ادامه خرید
                  </button>
                  <Link
                    href="/purchase/basket"
                    onClick={onClose}
                    prefetch={false}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white text-center py-2 font-medium transition-colors rounded text-sm"
                  >
                    تکمیل خرید
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
