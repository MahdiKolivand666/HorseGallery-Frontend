"use client";

import { useState, useEffect } from "react";
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
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const { cartItems, removeFromCart } = useCart();

  useEffect(() => {
    // Client-side only mounting to prevent hydration mismatch
    Promise.resolve().then(() => setMounted(true));
  }, []);

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

  // Timer countdown
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const removeItem = (_id: string) => {
    removeFromCart(_id);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!mounted) return null;

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
            {/* Timer - Small */}
            {cartItems.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-700">مهلت خرید:</span>
                <span className="text-xs font-bold text-white font-mono bg-red-500 px-2 py-0.5 rounded">
                  {formatTime(timeLeft)}
                </span>
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
          {cartItems.length === 0 ? (
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
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex gap-3">
                      {/* Image */}
                      <Link
                        href={`/${item.category}/${item.slug}`}
                        onClick={onClose}
                        className="relative w-24 h-24 flex-shrink-0"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1">
                        {/* Title and Delete Button */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Link
                            href={`/${item.category}/${item.slug}`}
                            onClick={onClose}
                            className="text-sm font-semibold text-gray-900 hover:text-primary line-clamp-1 flex-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
                            aria-label="حذف محصول"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 mb-2">
                          {item.code}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          <span className="text-gray-500">وزن: </span>
                          <span className="font-medium">{item.weight}</span>
                        </p>
                        {item.size && (
                          <p className="text-xs text-gray-600">
                            <span className="text-gray-500">سایز: </span>
                            <span className="font-medium">{item.size}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer - Price */}
                    <div className="flex items-center justify-end pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-gray-500">قیمت:</span>
                        <span className="text-base font-bold text-gray-900">
                          {item.price.toLocaleString("fa-IR")}
                        </span>
                        <span className="text-xs text-gray-500">تومان</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                      {totalPrice.toLocaleString("fa-IR")}
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
                    href="/purchase/basket/53500"
                    onClick={onClose}
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
