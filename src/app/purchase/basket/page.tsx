"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
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
import { GoldInfo } from "@/lib/api/products";
import { useCart } from "@/contexts/CartContext";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type CreateAddressDto,
} from "@/lib/api/address";
import { createOrder } from "@/lib/api/order";
import { useRouter } from "next/navigation";
import {
  addressFormSchema,
  type AddressFormData,
} from "@/lib/validations/address";
import FieldError from "@/components/forms/FieldError";
import { ZodError } from "zod";

interface CartItem {
  _id: string;
  name: string;
  image: string;
  price: number; // ✅ قیمت کل (با تخفیف) برای quantity فعلی - از backend
  originalPrice: number; // ✅ قیمت کل اصلی (بدون تخفیف) برای quantity فعلی - از backend
  unitPrice?: number; // ✅ قیمت واحد (با تخفیف) - از backend
  unitOriginalPrice?: number; // ✅ قیمت واحد اصلی (بدون تخفیف) - از backend
  quantity: number;
  code: string;
  weight: string;
  size?: string;
  slug: string;
  category: string;
  discount?: number; // ✅ درصد تخفیف - از backend
  // ✨ فیلدهای جدید برای سکه و شمش
  productType?: "jewelry" | "coin" | "melted_gold";
  goldInfo?: GoldInfo;
}

// ✅ این صفحه فقط زمانی mount می‌شود که کاربر به /purchase/basket برود
// ⚠️ مهم: استفاده از dynamic import برای جلوگیری از pre-fetch
function CheckoutPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, removeFromCart, remainingSeconds, reloadCart, clearCart } =
    useCart();
  const [activeTab, setActiveTab] = useState<"cart" | "shipping" | "payment">(
    "cart"
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null); // ✅ برای edit mode
  const [selectedGateway, setSelectedGateway] = useState("saman");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Address form state
  const [addressForm, setAddressForm] = useState<CreateAddressDto>({
    title: "",
    province: "",
    city: "",
    postalCode: "",
    address: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    mobile: "",
    email: "",
    notes: "",
    isDefault: false,
  });

  // Validation errors state
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AddressFormData, string>>
  >({});

  // Load addresses when shipping tab is opened
  useEffect(() => {
    if (activeTab === "shipping") {
      loadAddresses();
    }
  }, [activeTab]);

  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const data = await getAddresses();
      setAddresses(data);
      // Set default address if exists
      const defaultAddress = data.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0]._id);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleSaveAddress = async () => {
    // Reset errors
    setFormErrors({});

    // Validate with Zod
    try {
      const validatedData = addressFormSchema.parse(addressForm);

      setIsSavingAddress(true);
      try {
        // ✅ اگر در حال edit هستیم، updateAddress صدا بزنیم
        if (editingAddressId) {
          await updateAddress(editingAddressId, validatedData);
        } else {
          // ✅ اگر آدرس جدید است، createAddress صدا بزنیم
          await createAddress(validatedData);
        }

        // Reset form and close modal
        setAddressForm({
          title: "",
          province: "",
          city: "",
          postalCode: "",
          address: "",
          firstName: "",
          lastName: "",
          nationalId: "",
          mobile: "",
          email: "",
          notes: "",
          isDefault: false,
        });
        setFormErrors({});
        setEditingAddressId(null); // ✅ Reset edit mode
        setIsAddressModalOpen(false);
        // Reload addresses
        await loadAddresses();
      } catch (error) {
        console.error("Error saving address:", error);
        alert(error instanceof Error ? error.message : "خطا در ذخیره آدرس");
      } finally {
        setIsSavingAddress(false);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert Zod errors to form errors object
        const errors: Partial<Record<keyof AddressFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const field = issue.path[0] as keyof AddressFormData;
            errors[field] = issue.message;
          }
        });
        setFormErrors(errors);
      } else {
        console.error("Validation error:", error);
        alert("خطا در اعتبارسنجی فرم. لطفاً فیلدها را بررسی کنید.");
      }
    }
  };

  // ✅ تابع برای باز کردن modal در حالت edit
  const handleEditAddress = (address: Address) => {
    setAddressForm({
      title: address.title,
      province: address.province,
      city: address.city,
      postalCode: address.postalCode,
      address: address.address,
      firstName: address.firstName,
      lastName: address.lastName,
      nationalId: address.nationalId,
      mobile: address.mobile,
      email: address.email || "",
      notes: address.notes || "",
      isDefault: address.isDefault,
    });
    setFormErrors({});
    setEditingAddressId(address._id);
    setIsAddressModalOpen(true);
  };

  // ✅ تابع برای باز کردن modal در حالت جدید
  const handleAddNewAddress = () => {
    setAddressForm({
      title: "",
      province: "",
      city: "",
      postalCode: "",
      address: "",
      firstName: "",
      lastName: "",
      nationalId: "",
      mobile: "",
      email: "",
      notes: "",
      isDefault: false,
    });
    setFormErrors({});
    setEditingAddressId(null);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این آدرس را حذف کنید؟")) {
      return;
    }

    try {
      await deleteAddress(id);
      await loadAddresses();
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert(error instanceof Error ? error.message : "خطا در حذف آدرس");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultAddress(id);
      await loadAddresses();
      setSelectedAddressId(id);
    } catch (error) {
      console.error("Error setting default address:", error);
      alert(
        error instanceof Error ? error.message : "خطا در تنظیم آدرس پیش‌فرض"
      );
    }
  };

  // ✅ Handler برای پرداخت - با error handling برای cart expired
  const handlePayment = async () => {
    if (!cart?.cart?._id || !selectedAddressId) {
      alert("لطفاً آدرس و روش ارسال را انتخاب کنید");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // TODO: shippingId باید از state گرفته شود (فعلاً placeholder)
      const shippingId = "default"; // باید از state گرفته شود

      const order = await createOrder({
        cartId: cart.cart._id,
        addressId: selectedAddressId,
        shippingId: shippingId,
      });

      // Success - redirect to payment
      if (order.data.paymentUrl) {
        window.location.href = order.data.paymentUrl;
      } else {
        alert("سفارش با موفقیت ایجاد شد");
        // TODO: redirect to order details page
      }
    } catch (error: unknown) {
      // ✅ بررسی cart expired error
      const errorWithDetails = error as Error & {
        statusCode?: number;
        code?: string;
        isCartExpired?: boolean;
        message?: string;
      };
      if (
        errorWithDetails.statusCode === 400 &&
        (errorWithDetails.code === "CART_EXPIRED" ||
          errorWithDetails.isCartExpired ||
          errorWithDetails.message?.includes("زمان شما تمام شده است"))
      ) {
        // ✅ Cart از database حذف شده است
        clearCart();
        alert(
          "زمان شما تمام شده است. لطفاً مجدداً محصول را به سبد خرید اضافه کنید"
        );
        router.push("/products");
        return;
      }

      // Handle سایر errors
      alert(
        errorWithDetails.message ||
          (error instanceof Error ? error.message : "خطا در ایجاد سفارش")
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Timer countdown - استفاده از remainingSeconds از backend
  // برای UX بهتر، تایمر client-side داریم اما هر 30 ثانیه با backend sync می‌شود
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);
  const isExpired = cart?.expired === true; // ✅ بررسی expired flag

  useEffect(() => {
    // Update timer when remainingSeconds changes from backend
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds]);

  // ✅ Sync با backend هر 30 ثانیه - فقط در این صفحه
  useEffect(() => {
    // ⚠️ فقط اگر pathname صحیح است، interval را فعال کن
    if (pathname !== "/purchase/basket") {
      return;
    }

    const syncInterval = setInterval(() => {
      reloadCart(); // Sync با backend
    }, 30000); // هر 30 ثانیه

    return () => clearInterval(syncInterval);
  }, [pathname, reloadCart]);

  // تایمر client-side برای نمایش (UX بهتر)
  useEffect(() => {
    if (timeLeft <= 0) {
      if (
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
  }, [timeLeft, cart, reloadCart]);

  // تبدیل cart?.items به فرمت مورد نیاز صفحه پرداخت
  // ✅ فیلتر کردن طلای آب شده از cart (باید فقط در purchase باشد)
  const cartItems: CartItem[] = (cart?.items || [])
    .filter((item) => item.product.productType !== "melted_gold")
    .map((item) => {
      const product = item.product;

      // تعیین تصویر بر اساس نوع محصول
      const productImage =
        product.productType === "coin"
          ? "/images/products/coinphoto.webp"
          : product.productType === "melted_gold"
          ? "/images/products/goldbarphoto.webp"
          : product.images?.[0] || "/images/products/default.webp";

      // استخراج category از slug
      const categorySlug = product.slug.split("/")[0] || "products";

      return {
        _id: item._id,
        name: product.name,
        image: productImage,
        // برای طلای آب‌شده از unitPrice استفاده می‌کنیم (چون quantity نباید در قیمت دخالت داشته باشد)
        price:
          product.productType === "melted_gold" && item.unitPrice
            ? item.unitPrice
            : item.price, // ✅ قیمت کل (با تخفیف) برای quantity فعلی - از backend
        originalPrice:
          product.productType === "melted_gold" && item.unitOriginalPrice
            ? item.unitOriginalPrice
            : item.originalPrice, // ✅ قیمت کل اصلی (بدون تخفیف) برای quantity فعلی - از backend
        unitPrice: item.unitPrice,
        unitOriginalPrice: item.unitOriginalPrice,
        quantity: item.quantity,
        code: product.code,
        weight: product.weight || "نامشخص",
        size: item.size,
        slug: product.slug,
        category: categorySlug,
        discount: item.discount, // ✅ درصد تخفیف - از backend
        productType: product.productType,
        goldInfo: product.goldInfo,
      };
    });

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

  // استفاده از مقادیر محاسبه شده از Backend
  const cartSubtotal = cart?.prices?.totalWithoutDiscount || 0;
  const cartTotalDiscount = cart?.prices?.totalSavings || 0;
  const cartTotal = cart?.prices?.totalWithDiscount || 0;

  const subtotal = cartSubtotal;
  const totalDiscount = cartTotalDiscount;
  const walletAmount: number = 0; // User's wallet balance
  const shippingCost: number = 0; // Free shipping
  const finalTotal = cartTotal - walletAmount + shippingCost;
  // تعداد کالاها
  const totalItems = cartItems.length;

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
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
        <div className="flex justify-center gap-2 sm:gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("cart")}
            className={`pb-3 sm:pb-4 px-2 sm:px-4 text-xs sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
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
            className={`pb-3 sm:pb-4 px-2 sm:px-4 text-xs sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
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
            className={`pb-3 sm:pb-4 px-2 sm:px-4 text-xs sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
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
            {/* Expired Message */}
            {isExpired && (
              <div className="lg:col-span-3 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      ⏰ مدت زمان خرید شما به پایان رسیده است
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      لطفاً مجدداً محصول مورد نظر را به سبد اضافه کنید
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items - Left Side */}
            <div className="lg:col-span-2">
              {cartItems.map((item, index) => (
                <div key={item._id}>
                  <div className="p-4 flex gap-4">
                    {/* Product Image */}
                    <Link
                      href={`/${item.category}/${item.slug}`}
                      className="relative w-24 h-24 flex-shrink-0 overflow-hidden border border-gray-300 rounded"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
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
                          onClick={() => handleRemoveItem(item._id)}
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
                        وزن:{" "}
                        {item.weight ||
                          (item.goldInfo?.weight
                            ? `${item.goldInfo.weight} گرم`
                            : "نامشخص")}
                      </p>

                      {/* Size/MintYear and Price */}
                      <div className="flex items-center justify-between mt-0.5">
                        {/* برای سکه: سال ضرب، برای بقیه: سایز */}
                        {item.productType === "coin" &&
                        item.goldInfo?.mintYear ? (
                          <p className="text-xs text-gray-600">
                            سال ضرب: {item.goldInfo.mintYear}
                          </p>
                        ) : item.size ? (
                          <p className="text-xs text-gray-600">
                            سایز: {item.size}
                          </p>
                        ) : null}
                        {/* Price - از backend */}
                        <div className="flex flex-col items-end gap-0.5">
                          {item.originalPrice > item.price ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-bold text-red-600">
                                {item.price.toLocaleString("fa-IR")}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                {item.originalPrice.toLocaleString("fa-IR")}
                              </span>
                              <span className="text-xs text-gray-500">
                                تومان
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-bold text-gray-900">
                                {item.price.toLocaleString("fa-IR")}
                              </span>
                              <span className="text-xs text-gray-500">
                                تومان
                              </span>
                            </div>
                          )}
                        </div>
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
              <div className="bg-primary p-5 border border-gray-300 rounded sticky top-[180px]">
                {/* Timer Warning */}
                <div className="mb-5 py-1.5 px-3 border border-white/30 rounded text-center">
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
                      <span className="font-medium text-red-400">
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
                    disabled={isExpired}
                    className={`w-full py-2 text-sm font-medium transition-colors mt-3 rounded ${
                      isExpired
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-white hover:bg-white/90 text-primary"
                    }`}
                  >
                    {isExpired ? "زمان تمام شده" : "ادامه خرید"}
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
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-gray-900">
                      آدرس تحویل
                    </h3>
                  </div>
                  <button
                    onClick={handleAddNewAddress}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-medium transition-colors rounded"
                  >
                    <span>+</span>
                    <span>افزودن آدرس جدید</span>
                  </button>
                </div>

                {isLoadingAddresses ? (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    در حال بارگذاری...
                  </p>
                ) : addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    هنوز آدرسی ثبت نشده است
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`border rounded p-4 cursor-pointer transition-colors ${
                          selectedAddressId === addr._id
                            ? "border-primary bg-primary/5"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => setSelectedAddressId(addr._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-900">
                                {addr.title}
                              </h4>
                              {addr.isDefault && (
                                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded">
                                  پیش‌فرض
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              {addr.province}، {addr.city}
                            </p>
                            <p className="text-sm text-gray-700 mb-1">
                              {addr.address}
                            </p>
                            <p className="text-xs text-gray-500 mb-1">
                              کد پستی: {addr.postalCode}
                            </p>
                            <p className="text-sm text-gray-700">
                              {addr.firstName} {addr.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              موبایل: {addr.mobile}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {!addr.isDefault && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefaultAddress(addr._id);
                                }}
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                              >
                                پیش‌فرض
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr);
                              }}
                              className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              ویرایش
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr._id);
                              }}
                              className="text-xs text-red-600 hover:text-red-700 transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="px-6">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Shipping Method Section */}
              <div className="p-6">
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
              <div className="bg-primary p-5 border border-gray-300 rounded sticky top-[180px]">
                {/* Timer Warning */}
                <div className="mb-5 py-1.5 px-3 border border-white/30 rounded text-center">
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
                <div className="mb-5 space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={item._id}>
                      <div className="text-white space-y-0.5">
                        <p className="font-medium text-sm line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-white/80">{item.code}</p>
                        <p className="text-xs text-white/80">
                          وزن: {item.weight}
                        </p>
                        {/* برای سکه: سال ضرب، برای بقیه: سایز */}
                        {item.productType === "coin" &&
                        item.goldInfo?.mintYear ? (
                          <p className="text-xs text-white/80">
                            سال ضرب: {item.goldInfo.mintYear}
                          </p>
                        ) : item.size ? (
                          <p className="text-xs text-white/80">
                            سایز: {item.size}
                          </p>
                        ) : null}
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
                <div className="py-2 mb-3">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>

                {/* Price Details */}
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-white">مجموع مبلغ کالاهای سبد</span>
                      <span className="text-xs text-white/80">
                        ({totalItems.toLocaleString("fa-IR")} کالا)
                      </span>
                    </div>
                    <span className="font-medium text-white">
                      {cartSubtotal.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  {/* Discount */}
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">مجموع تخفیف محصولات</span>
                      <span className="font-medium text-red-300">
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
                    onClick={() => setActiveTab("payment")}
                    disabled={isExpired}
                    className={`w-full py-2 text-sm font-medium transition-colors mt-3 rounded ${
                      isExpired
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-white hover:bg-white/90 text-primary"
                    }`}
                  >
                    {isExpired ? "زمان تمام شده" : "ادامه خرید"}
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
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-gray-900">
                    انتخاب درگاه پرداخت
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedGateway("saman")}
                    className={`flex items-center gap-3 p-4 hover:bg-primary/5 transition-all cursor-pointer border-2 rounded ${
                      selectedGateway === "saman"
                        ? "border-primary"
                        : "border-gray-300"
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
                    className={`flex items-center gap-3 p-4 hover:bg-primary/5 transition-all cursor-pointer border-2 rounded ${
                      selectedGateway === "mellat"
                        ? "border-primary"
                        : "border-gray-300"
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
                    className={`flex items-center gap-3 p-4 hover:bg-primary/5 transition-all cursor-pointer border-2 rounded ${
                      selectedGateway === "zarinpal"
                        ? "border-primary"
                        : "border-gray-300"
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
                <div className="p-6 h-full flex flex-col">
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
                      className="flex-1 px-4 py-2.5 border border-gray-300 bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded"
                    />
                    <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors whitespace-nowrap rounded">
                      اعمال کد
                    </button>
                  </div>
                </div>

                {/* Wallet */}
                <div className="p-6 h-full flex flex-col">
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
              <div className="bg-primary text-white p-5 border border-gray-300 rounded">
                {/* Timer */}
                <div className="mb-5 py-1.5 px-3 border border-white/30 rounded text-center">
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
                <div className="space-y-3 mb-5">
                  {cartItems.map((item, index) => (
                    <div key={item._id}>
                      <div className="py-2">
                        <p className="text-sm font-medium mb-1">{item.name}</p>
                        <div className="space-y-0.5 text-xs">
                          <p className="text-white/80">{item.code}</p>
                          <p className="text-white/80">وزن: {item.weight}</p>
                          {/* برای سکه: سال ضرب، برای بقیه: سایز */}
                          {item.productType === "coin" &&
                          item.goldInfo?.mintYear ? (
                            <p className="text-white/80">
                              سال ضرب: {item.goldInfo.mintYear}
                            </p>
                          ) : item.size ? (
                            <p className="text-white/80">سایز: {item.size}</p>
                          ) : null}
                        </div>
                      </div>
                      {index < cartItems.length - 1 && (
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="py-2">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>

                {/* Price Summary */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span>مبلغ کل کالاها:</span>
                    <span className="font-medium">
                      {cartSubtotal.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span>مجموع تخفیف محصولات:</span>
                      <span className="font-medium text-red-300">
                        {totalDiscount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}
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
                <div className="py-2">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>

                {/* Final Amount */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-bold">مبلغ نهایی:</span>
                  <span className="text-xl font-bold">
                    {finalTotal.toLocaleString("fa-IR")} تومان
                  </span>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 mt-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 text-primary focus:ring-primary border-gray-300 bg-white"
                  />
                  <span className="text-sm text-white">
                    با قوانین و مقررات سایت موافق هستم
                  </span>
                </label>

                {/* Action Button */}
                <button
                  disabled={
                    isExpired || isProcessingPayment || !selectedAddressId
                  }
                  onClick={handlePayment}
                  className={`w-full py-2 text-sm font-medium transition-colors rounded ${
                    isExpired || !selectedAddressId
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-white text-primary hover:bg-gray-100"
                  }`}
                >
                  {isExpired
                    ? "زمان تمام شده"
                    : isProcessingPayment
                    ? "در حال پردازش..."
                    : !selectedAddressId
                    ? "لطفاً آدرس را انتخاب کنید"
                    : "پرداخت آنلاین"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-end px-3 py-0.5 bg-white flex-shrink-0">
              <button
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setEditingAddressId(null);
                  setFormErrors({});
                  // Reset form when closing
                  setAddressForm({
                    title: "",
                    province: "",
                    city: "",
                    postalCode: "",
                    address: "",
                    firstName: "",
                    lastName: "",
                    nationalId: "",
                    mobile: "",
                    email: "",
                    notes: "",
                    isDefault: false,
                  });
                }}
                className="p-0.5 rounded hover:bg-gray-50 transition-colors"
                aria-label="بستن"
              >
                <span className="text-3xl text-gray-600">×</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto pt-4 sm:pt-5 lg:pt-6 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
              <form
                className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveAddress();
                }}
              >
                {/* Address Section - Left Column */}
                <div className="px-2 sm:px-3 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary">
                      {editingAddressId ? "ویرایش آدرس" : "آدرس جدید"}
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        عنوان آدرس *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.title}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            title: e.target.value,
                          });
                          // Clear error when user types
                          if (formErrors.title) {
                            setFormErrors({ ...formErrors, title: undefined });
                          }
                        }}
                        className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                          formErrors.title
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="مثلاً: منزل، محل کار"
                      />
                      <FieldError error={formErrors.title} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          استان *
                        </label>
                        <select
                          required
                          value={addressForm.province}
                          onChange={(e) => {
                            setAddressForm({
                              ...addressForm,
                              province: e.target.value,
                            });
                            if (formErrors.province) {
                              setFormErrors({
                                ...formErrors,
                                province: undefined,
                              });
                            }
                          }}
                          className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 transition-colors rounded ${
                            formErrors.province
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="" className="text-gray-400">
                            انتخاب استان
                          </option>
                          <option value="tehran">تهران</option>
                          <option value="isfahan">اصفهان</option>
                          <option value="shiraz">شیراز</option>
                        </select>
                        <FieldError error={formErrors.province} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          شهر *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => {
                            setAddressForm({
                              ...addressForm,
                              city: e.target.value,
                            });
                            if (formErrors.city) {
                              setFormErrors({ ...formErrors, city: undefined });
                            }
                          }}
                          className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                            formErrors.city
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="شهر"
                        />
                        <FieldError error={formErrors.city} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        کد پستی *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={addressForm.postalCode}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            postalCode: e.target.value.replace(/\D/g, ""),
                          });
                          if (formErrors.postalCode) {
                            setFormErrors({
                              ...formErrors,
                              postalCode: undefined,
                            });
                          }
                        }}
                        className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                          formErrors.postalCode
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="کد پستی ۱۰ رقمی"
                      />
                      <FieldError error={formErrors.postalCode} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        آدرس *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={addressForm.address}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            address: e.target.value,
                          });
                          if (formErrors.address) {
                            setFormErrors({
                              ...formErrors,
                              address: undefined,
                            });
                          }
                        }}
                        className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                          formErrors.address
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="آدرس کامل خود را وارد کنید..."
                      />
                      <FieldError error={formErrors.address} />
                    </div>
                  </div>
                </div>

                {/* Divider for mobile */}
                <div className="lg:hidden py-3 sm:py-4">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>

                {/* Divider for desktop */}
                <div className="hidden lg:block self-stretch px-4 lg:px-6">
                  <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
                </div>

                {/* Customer Info Section - Right Column */}
                <div className="px-2 sm:px-3 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary">
                      مشخصات سفارش دهنده
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          نام *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.firstName}
                          onChange={(e) => {
                            setAddressForm({
                              ...addressForm,
                              firstName: e.target.value,
                            });
                            if (formErrors.firstName) {
                              setFormErrors({
                                ...formErrors,
                                firstName: undefined,
                              });
                            }
                          }}
                          className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                            formErrors.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="نام"
                        />
                        <FieldError error={formErrors.firstName} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          نام خانوادگی *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.lastName}
                          onChange={(e) => {
                            setAddressForm({
                              ...addressForm,
                              lastName: e.target.value,
                            });
                            if (formErrors.lastName) {
                              setFormErrors({
                                ...formErrors,
                                lastName: undefined,
                              });
                            }
                          }}
                          className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                            formErrors.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="نام خانوادگی"
                        />
                        <FieldError error={formErrors.lastName} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          کد ملی *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={addressForm.nationalId}
                          onChange={(e) => {
                            setAddressForm({
                              ...addressForm,
                              nationalId: e.target.value.replace(/\D/g, ""),
                            });
                            if (formErrors.nationalId) {
                              setFormErrors({
                                ...formErrors,
                                nationalId: undefined,
                              });
                            }
                          }}
                          className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                            formErrors.nationalId
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="کد ملی ۱۰ رقمی"
                        />
                        <FieldError error={formErrors.nationalId} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          موبایل *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          value={addressForm.mobile}
                          onChange={(e) => {
                            setAddressForm({
                              ...addressForm,
                              mobile: e.target.value.replace(/\D/g, ""),
                            });
                            if (formErrors.mobile) {
                              setFormErrors({
                                ...formErrors,
                                mobile: undefined,
                              });
                            }
                          }}
                          className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                            formErrors.mobile
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        />
                        <FieldError error={formErrors.mobile} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        ایمیل (اختیاری)
                      </label>
                      <input
                        type="email"
                        value={addressForm.email || ""}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            email: e.target.value,
                          });
                          if (formErrors.email) {
                            setFormErrors({ ...formErrors, email: undefined });
                          }
                        }}
                        onKeyPress={(e) => {
                          // ✅ فقط کاراکترهای مجاز را قبول کنید: a-z, A-Z, 0-9, @, ., _, -
                          const char = e.key;
                          const allowedChars = /[a-zA-Z0-9@._-]/;
                          // ✅ اگر کاراکتر مجاز نیست و کلیدهای کنترل نیستند، جلوگیری کن
                          if (
                            !allowedChars.test(char) &&
                            char !== "Backspace" &&
                            char !== "Delete" &&
                            char !== "ArrowLeft" &&
                            char !== "ArrowRight" &&
                            char !== "Tab" &&
                            char !== "Enter" &&
                            char.length === 1 // فقط برای کاراکترهای واقعی
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded text-left font-sans ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="example@email.com"
                        lang="en"
                        dir="ltr"
                        inputMode="email"
                        autoComplete="email"
                      />
                      <FieldError error={formErrors.email} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        توضیحات (اختیاری)
                      </label>
                      <textarea
                        rows={3}
                        value={addressForm.notes || ""}
                        onChange={(e) => {
                          setAddressForm({
                            ...addressForm,
                            notes: e.target.value,
                          });
                          if (formErrors.notes) {
                            setFormErrors({ ...formErrors, notes: undefined });
                          }
                        }}
                        className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors rounded ${
                          formErrors.notes
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="توضیحات تکمیلی (اختیاری)"
                      />
                      <FieldError error={formErrors.notes} />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              isDefault: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-700">
                          تنظیم به عنوان آدرس پیش‌فرض
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 flex-shrink-0">
              <Link
                href="#"
                className="flex items-center justify-center sm:justify-start gap-1.5 text-primary hover:text-primary/80 transition-colors text-xs sm:text-sm"
              >
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>راهنمای ارسال</span>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-medium transition-colors rounded"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveAddress}
                  disabled={isSavingAddress}
                  className="flex-1 sm:flex-none px-6 sm:px-12 py-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-medium transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingAddress
                    ? "در حال ذخیره..."
                    : editingAddressId
                    ? "به‌روزرسانی آدرس"
                    : "ذخیره آدرس"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ استفاده از dynamic import برای جلوگیری از pre-fetch
// ⚠️ مهم: این باعث می‌شود که صفحه فقط زمانی load شود که کاربر واقعاً به آن برود
// ⚠️ مهم: ssr: false باعث می‌شود که صفحه فقط در client-side render شود
export default dynamic(() => Promise.resolve(CheckoutPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});
