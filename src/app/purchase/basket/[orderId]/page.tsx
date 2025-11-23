"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Clock,
  ArrowRight,
  MapPin,
  User,
  Info,
  CreditCard,
  Tag,
  Wallet,
  Truck,
} from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  code: string;
  weight: string;
  size?: string;
  slug: string;
  category: string;
  discount?: number;
}

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState<"cart" | "shipping" | "payment">(
    "cart"
  );
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState("saman");

  // Mock cart data
  const [cartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "گردنبند طلای زنانه",
      image: "/images/products/product1.webp",
      price: 45000000,
      quantity: 1,
      code: "GN-001",
      weight: "۱۲.۵ گرم",
      size: "45 سانتی‌متر",
      slug: "gold-necklace-001",
      category: "women",
      discount: 2000000,
    },
    {
      id: 2,
      name: "دستبند طلای مردانه",
      image: "/images/products/product2.webp",
      price: 28000000,
      quantity: 1,
      code: "GB-002",
      weight: "۸.۳ گرم",
      size: "20 سانتی‌متر",
      slug: "gold-bracelet-002",
      category: "men",
      discount: 1000000,
    },
  ]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscount = cartItems.reduce(
    (sum, item) => sum + (item.discount || 0) * item.quantity,
    0
  );
  const walletAmount: number = 0; // User's wallet balance
  const shippingCost: number = 0; // Free shipping
  const finalTotal = subtotal - totalDiscount - walletAmount + shippingCost;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemoveItem = (id: number) => {
    // Handle remove item logic
    console.log("Remove item:", id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[180px] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-3 group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <span className="text-sm">بازگشت به صفحه اصلی</span>
        </Link>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("cart")}
            className={`pb-4 px-4 font-medium transition-colors relative ${
              activeTab === "cart"
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ۱. سبد خرید
            {activeTab === "cart" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-4 px-4 font-medium transition-colors relative ${
              activeTab === "shipping"
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ۲. آدرس و نحوه ارسال
            {activeTab === "shipping" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`pb-4 px-4 font-medium transition-colors relative ${
              activeTab === "payment"
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ۳. پرداخت
            {activeTab === "payment" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Side */}
            <div className="lg:col-span-2">
              {cartItems.map((item, index) => (
                <div key={item.id}>
                  <div className="p-4 flex gap-4">
                    {/* Product Image */}
                    <Link
                      href={`/${item.category}/${item.slug}`}
                      className="relative w-24 h-24 flex-shrink-0 overflow-hidden"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col">
                      {/* Title and Delete Button */}
                      <div className="flex items-start justify-between mb-1">
                        <Link
                          href={`/${item.category}/${item.slug}`}
                          className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1 flex-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 mr-2"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Product Code */}
                      <p className="text-xs text-gray-500 mb-2">{item.code}</p>

                      {/* Weight */}
                      <p className="text-xs text-gray-600 mb-0.5">
                        وزن: {item.weight}
                      </p>

                      {/* Size and Price */}
                      <div className="flex items-center justify-between mt-0.5">
                        {item.size && (
                          <p className="text-xs text-gray-600">
                            سایز: {item.size}
                          </p>
                        )}
                        <p className="text-xs text-gray-600">
                          قیمت:{" "}
                          <span className="text-base font-bold text-gray-900">
                            {item.price.toLocaleString("fa-IR")}
                          </span>{" "}
                          تومان
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  {index < cartItems.length - 1 && (
                    <div className="px-4 py-4">
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-primary p-5 shadow-lg sticky top-[180px]">
                {/* Timer Warning */}
                <div className="mb-5 py-1.5 px-3 border border-white/30 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-white">
                    <Clock className="w-3.5 h-3.5" />
                    <p className="text-[11px]">
                      برای تکمیل خرید خود{" "}
                      <span className="font-bold font-mono text-xs mx-1 bg-red-500 px-1.5 py-0.5 rounded">
                        {formatTime(timeLeft)}
                      </span>{" "}
                      زمان دارید!
                    </p>
                  </div>
                </div>

                {/* Price Details */}
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white">مجموع مبلغ کالاهای سبد</span>
                      <span className="text-xs text-white/80">
                        ({totalItems.toLocaleString("fa-IR")} کالا)
                      </span>
                    </div>
                    <span className="font-medium text-white">
                      {subtotal.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  {/* Discount */}
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">مجموع تخفیف محصولات</span>
                      <span className="font-medium text-yellow-300">
                        {totalDiscount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}

                  {/* Wallet */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">کیف پول</span>
                    <span className="font-medium text-white">
                      {walletAmount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">هزینه ارسال</span>
                    {shippingCost === 0 ? (
                      <span className="font-medium text-white">رایگان</span>
                    ) : (
                      <span className="font-medium text-white">
                        {shippingCost.toLocaleString("fa-IR")} تومان
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="py-2">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </div>

                  {/* Final Total */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-white">
                      مبلغ نهایی:
                    </span>
                    <span className="text-xl font-bold text-white">
                      {finalTotal.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={() => setActiveTab("shipping")}
                    className="w-full bg-white hover:bg-white/90 text-primary py-2 text-sm font-medium transition-colors mt-3"
                  >
                    ادامه خرید
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Section */}
              <div className="bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-gray-900">
                      آدرس تحویل
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <span>+</span>
                    <span>افزودن آدرس جدید</span>
                  </button>
                </div>
                <p className="text-gray-500 text-center py-8 text-sm">
                  هنوز آدرسی ثبت نشده است
                </p>
              </div>

              {/* Divider */}
              <div className="px-6">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Shipping Method Section */}
              <div className="bg-gray-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-gray-900">
                    نحوه ارسال
                  </h3>
                </div>
                <p className="text-gray-500 text-center py-8 text-sm">
                  انتخاب نحوه ارسال
                </p>
              </div>
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-primary p-4 shadow-lg sticky top-[180px]">
                {/* Timer Warning */}
                <div className="mb-3 py-1.5 px-3 border border-white/30 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-white">
                    <Clock className="w-3.5 h-3.5" />
                    <p className="text-[11px]">
                      برای تکمیل خرید خود{" "}
                      <span className="font-bold font-mono text-xs mx-1 bg-red-500 px-1.5 py-0.5 rounded">
                        {formatTime(timeLeft)}
                      </span>{" "}
                      زمان دارید!
                    </p>
                  </div>
                </div>

                {/* Products Summary */}
                <div className="mb-3 space-y-2">
                  {cartItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="text-white space-y-0.5">
                        <p className="font-medium text-sm line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-white/80">{item.code}</p>
                        <p className="text-xs text-white/80">
                          وزن: {item.weight}
                        </p>
                        {item.size && (
                          <p className="text-xs text-white/80">
                            سایز: {item.size}
                          </p>
                        )}
                      </div>

                      {/* Divider between products */}
                      {index < cartItems.length - 1 && (
                        <div className="py-1.5">
                          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider before price details */}
                <div className="py-1.5 mb-2">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>

                {/* Price Details */}
                <div className="space-y-2">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-white">مجموع مبلغ کالاهای سبد</span>
                      <span className="text-xs text-white/80">
                        ({totalItems.toLocaleString("fa-IR")} کالا)
                      </span>
                    </div>
                    <span className="font-medium text-white">
                      {subtotal.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  {/* Discount */}
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">مجموع تخفیف محصولات</span>
                      <span className="font-medium text-yellow-300">
                        {totalDiscount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}

                  {/* Wallet */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">کیف پول</span>
                    <span className="font-medium text-white">
                      {walletAmount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">هزینه ارسال</span>
                    {shippingCost === 0 ? (
                      <span className="font-medium text-white">رایگان</span>
                    ) : (
                      <span className="font-medium text-white">
                        {shippingCost.toLocaleString("fa-IR")} تومان
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="py-1.5">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </div>

                  {/* Final Total */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-bold text-white">
                      مبلغ نهایی:
                    </span>
                    <span className="text-xl font-bold text-white">
                      {finalTotal.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={() => setActiveTab("payment")}
                    className="w-full bg-white hover:bg-white/90 text-primary py-2 text-sm font-medium transition-colors mt-2"
                  >
                    ادامه خرید
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form - Left Side */}
            <div className="lg:col-span-2 space-y-4">
              {/* Payment Gateway Selection */}
              <div className="bg-gray-50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-gray-900">
                    انتخاب درگاه پرداخت
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedGateway("saman")}
                    className={`flex items-center gap-3 p-4 hover:bg-primary/5 transition-all cursor-pointer border-2 ${
                      selectedGateway === "saman"
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-gateway"
                      value="saman"
                      checked={selectedGateway === "saman"}
                      onChange={() => setSelectedGateway("saman")}
                      className="w-4 h-4 text-primary focus:ring-primary bg-white checked:bg-primary"
                    />
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src="/images/logo/saman.png"
                        alt="بانک سامان"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm text-gray-900">
                      درگاه پرداخت بانک سامان
                    </span>
                  </div>
                  <div
                    onClick={() => setSelectedGateway("mellat")}
                    className={`flex items-center gap-3 p-4 hover:bg-primary/5 transition-all cursor-pointer border-2 ${
                      selectedGateway === "mellat"
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-gateway"
                      value="mellat"
                      checked={selectedGateway === "mellat"}
                      onChange={() => setSelectedGateway("mellat")}
                      className="w-4 h-4 text-primary focus:ring-primary bg-white checked:bg-primary"
                    />
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src="/images/logo/mellatbank.png"
                        alt="بانک ملت"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm text-gray-900">
                      درگاه پرداخت بانک ملت
                    </span>
                  </div>
                  <div
                    onClick={() => setSelectedGateway("zarinpal")}
                    className={`flex items-center gap-3 p-4 hover:bg-primary/5 transition-all cursor-pointer border-2 ${
                      selectedGateway === "zarinpal"
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-gateway"
                      value="zarinpal"
                      checked={selectedGateway === "zarinpal"}
                      onChange={() => setSelectedGateway("zarinpal")}
                      className="w-4 h-4 text-primary focus:ring-primary bg-white checked:bg-primary"
                    />
                    <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
                      <span className="text-yellow-500 font-bold text-lg">
                        Z
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">
                      درگاه پرداخت زرین‌پال
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full px-4">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Discount Code & Wallet - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {/* Discount Code */}
                <div className="bg-gray-50 p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-gray-900">
                      کد تخفیف
                    </h3>
                  </div>
                  <div className="flex gap-3 flex-1 items-start">
                    <input
                      type="text"
                      placeholder="کد تخفیف خود را وارد کنید"
                      className="flex-1 px-4 py-2.5 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                    />
                    <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors whitespace-nowrap">
                      اعمال کد
                    </button>
                  </div>
                </div>

                {/* Wallet */}
                <div className="bg-gray-50 p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-gray-900">
                      کیف پول
                    </h3>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200">
                      <span className="text-sm text-gray-700">
                        موجودی کیف پول:
                      </span>
                      <span className="text-base font-bold text-primary">
                        {(2500000).toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="text-sm text-gray-900">
                        استفاده از موجودی کیف پول
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-primary text-white p-5 shadow-lg">
                {/* Timer */}
                <div className="mb-4 py-1.5 px-3 border border-white/30 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-white">
                    <Clock className="w-3.5 h-3.5" />
                    <p className="text-[11px]">
                      برای تکمیل خرید خود{" "}
                      <span className="font-bold font-mono text-xs mx-1 bg-red-500 px-1.5 py-0.5 rounded">
                        {formatTime(timeLeft)}
                      </span>{" "}
                      زمان دارید!
                    </p>
                  </div>
                </div>

                {/* Product Summary */}
                <div className="space-y-3 mb-4">
                  {cartItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="py-2">
                        <p className="text-sm font-medium mb-1">{item.name}</p>
                        <div className="space-y-0.5 text-xs">
                          <p className="text-white/80">{item.code}</p>
                          <p className="text-white/80">وزن: {item.weight}</p>
                          <p className="text-white/80">سایز: {item.size}</p>
                        </div>
                      </div>
                      {index < cartItems.length - 1 && (
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mb-4" />

                {/* Price Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span>مبلغ کل:</span>
                    <span className="font-medium">
                      {subtotal.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>تخفیف محصولات:</span>
                    <span className="font-medium text-yellow-300">
                      {totalDiscount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>کیف پول:</span>
                    <span className="font-medium">
                      {walletAmount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>هزینه ارسال:</span>
                    <span className="font-medium">
                      {shippingCost.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mb-4" />

                {/* Final Amount */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-base font-bold">مبلغ نهایی:</span>
                  <span className="text-xl font-bold">
                    {finalTotal.toLocaleString("fa-IR")} تومان
                  </span>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 text-primary focus:ring-primary border-gray-300 bg-white"
                  />
                  <span className="text-sm text-white">
                    با قوانین و مقررات سایت موافق هستم
                  </span>
                </label>

                {/* Action Button */}
                <button className="w-full py-2 bg-white text-primary hover:bg-gray-100 text-sm font-medium transition-colors">
                  پرداخت آنلاین
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-100 max-w-5xl w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-end px-3 py-0.5 bg-gray-100">
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-0.5 hover:bg-gray-200 transition-colors"
                aria-label="بستن"
              >
                <span className="text-3xl text-gray-600">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
                {/* Address Section - Left Column */}
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary">
                      آدرس جدید
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        عنوان آدرس
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                        placeholder="مثلاً: منزل، محل کار"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          استان
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 transition-colors">
                          <option value="" className="text-gray-400">
                            انتخاب استان
                          </option>
                          <option value="tehran">تهران</option>
                          <option value="isfahan">اصفهان</option>
                          <option value="shiraz">شیراز</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          شهر
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 transition-colors">
                          <option value="" className="text-gray-400">
                            انتخاب شهر
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        کد پستی
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                        placeholder="کد پستی ۱۰ رقمی"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        آدرس
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                        placeholder="آدرس کامل خود را وارد کنید..."
                      />
                    </div>
                  </div>
                </div>

                {/* Divider for mobile */}
                <div className="lg:hidden py-4">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>

                {/* Divider for desktop */}
                <div className="hidden lg:block self-stretch px-6">
                  <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
                </div>

                {/* Customer Info Section - Right Column */}
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary">
                      مشخصات سفارش دهنده
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          نام
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                          placeholder="نام"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          نام خانوادگی
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                          placeholder="نام خانوادگی"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          کد ملی
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                          placeholder="کد ملی ۱۰ رقمی"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          موبایل
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        ایمیل
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        توضیحات
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 bg-white focus:border-primary focus:outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors"
                        placeholder="توضیحات تکمیلی (اختیاری)"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-100">
              <Link
                href="#"
                className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-sm"
              >
                <Info className="w-4 h-4" />
                <span>راهنمای ارسال</span>
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                >
                  انصراف
                </button>
                <button
                  onClick={() => {
                    // Save address logic
                    setIsAddressModalOpen(false);
                  }}
                  className="px-12 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  ذخیره آدرس
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
