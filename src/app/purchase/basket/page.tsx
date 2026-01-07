"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  AlarmClockMinus,
  ShoppingCart,
  ArrowRight,
  MapPin,
  User,
  Info,
  CreditCard,
  Tag,
  Wallet,
  Truck,
  Pencil,
} from "lucide-react";
import { GoldInfo } from "@/lib/api/products";
import { useCart } from "@/contexts/CartContext";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
  type CreateAddressDto,
} from "@/lib/api/address";
import { createOrder } from "@/lib/api/order";
import { getShippingMethods, type ShippingMethod } from "@/lib/api/shipping";
import { useRouter } from "next/navigation";
import {
  addressFormSchema,
  type AddressFormData,
} from "@/lib/validations/address";
import FieldError from "@/components/forms/FieldError";
import { ZodError } from "zod";
import toast from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  persianToEnglish,
  englishToPersian,
  isPersianOnly,
} from "@/lib/utils/persianNumber";
import { ErrorHandler } from "@/lib/utils/errorHandler";
import { type ErrorResponse } from "@/types/errors";
import {
  getProvinces,
  getCities,
  type Province,
  type City,
} from "@/lib/api/location";
import { useTranslations } from "next-intl";
import { Loading } from "@/components/ui/Loading";

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
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const {
    cart,
    loading,
    removeFromCart,
    remainingSeconds,
    reloadCart,
    clearCart,
  } = useCart();
  const [activeTab, setActiveTab] = useState<"cart" | "shipping" | "payment">(
    "cart"
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null); // ✅ برای edit mode
  const [selectedGateway, setSelectedGateway] = useState("saman");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  // ✅ State برای نگه‌داری expiredFirstTime تا دفعه بعدی که صفحه باز می‌شود
  const [expiredFirstTimeState, setExpiredFirstTimeState] = useState(false);
  // ✅ Ref برای نگه‌داری flag که نشان می‌دهد timer به 0 رسیده و state باید نگه داشته شود
  const timerExpiredRef = useRef(false);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // ✅ Shipping method state
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    null
  );
  const [isLoadingShippingMethods, setIsLoadingShippingMethods] =
    useState(false);
  const [shippingCost, setShippingCost] = useState<number>(0);

  // ✅ State برای confirmation modal حذف آدرس
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    addressId: string | null;
  }>({ isOpen: false, addressId: null });

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

  // ✅ State برای نمایش فارسی (فقط برای فیلدهای عددی)
  const [postalCodeDisplay, setPostalCodeDisplay] = useState("");
  const [nationalIdDisplay, setNationalIdDisplay] = useState("");
  const [mobileDisplay, setMobileDisplay] = useState("");

  // ✅ State برای استان‌ها و شهرها
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvinceExternalId, setSelectedProvinceExternalId] = useState<
    number | null
  >(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

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

  // استفاده از مقادیر محاسبه شده از Backend
  const cartSubtotal = cart?.prices?.totalWithoutDiscount || 0;
  const cartTotalDiscount = cart?.prices?.totalSavings || 0;
  const cartTotal = cart?.prices?.totalWithDiscount || 0;

  // ✅ Helper function برای محاسبه هزینه ارسال (با در نظر گیری ارسال رایگان)
  const calculateShippingPrice = useCallback(
    (method: ShippingMethod, total: number): number => {
      // ✅ اگر freeShippingThreshold وجود دارد و مبلغ سبد بیشتر است
      if (
        method.freeShippingThreshold !== null &&
        total >= method.freeShippingThreshold
      ) {
        return 0; // ارسال رایگان
      }
      // در غیر این صورت هزینه عادی
      return method.price;
    },
    []
  );

  // ✅ دریافت Shipping Methods از API
  useEffect(() => {
    const loadShippingMethods = async () => {
      setIsLoadingShippingMethods(true);
      try {
        const methods = await getShippingMethods();
        setShippingMethods(methods);

        // ✅ انتخاب shipping method پیش‌فرض
        if (methods.length > 0 && !selectedShippingId) {
          const defaultMethod = methods.find((m) => m.isDefault) || methods[0];
          if (defaultMethod) {
            setSelectedShippingId(defaultMethod._id);
            // ✅ محاسبه هزینه ارسال
            const price = calculateShippingPrice(defaultMethod, cartTotal);
            setShippingCost(price);
          }
        }
      } catch (error) {
        console.error("Error loading shipping methods:", error);
        // ✅ در صورت خطا، یک fallback نشان می‌دهیم
        toast.error(
          t("error.loadShippingMethods") ||
            "خطا در دریافت روش‌های ارسال. لطفاً صفحه را refresh کنید."
        );
      } finally {
        setIsLoadingShippingMethods(false);
      }
    };

    // ✅ فقط یک بار در mount لود شود
    if (shippingMethods.length === 0) {
      loadShippingMethods();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateShippingPrice, cartTotal]); // ✅ فقط یک بار اجرا شود

  // ✅ به‌روزرسانی هزینه ارسال هنگام تغییر مبلغ سبد یا روش ارسال
  useEffect(() => {
    if (selectedShippingId && shippingMethods.length > 0) {
      const selectedMethod = shippingMethods.find(
        (m) => m._id === selectedShippingId
      );
      if (selectedMethod) {
        const price = calculateShippingPrice(selectedMethod, cartTotal);
        setShippingCost(price);
      }
    }
  }, [selectedShippingId, cartTotal, shippingMethods, calculateShippingPrice]);

  // ✅ دریافت لیست استان‌ها هنگام باز شدن modal
  useEffect(() => {
    if (isAddressModalOpen && provinces.length === 0) {
      const fetchProvinces = async () => {
        setIsLoadingProvinces(true);
        try {
          const data = await getProvinces();
          setProvinces(data);
        } catch (error) {
          console.error("Error fetching provinces:", error);
          toast.error(t("error.fetchProvinces"));
        } finally {
          setIsLoadingProvinces(false);
        }
      };
      fetchProvinces();
    }
  }, [isAddressModalOpen, provinces.length, t]);

  // ✅ دریافت لیست شهرها هنگام تغییر استان
  useEffect(() => {
    if (selectedProvinceExternalId !== null) {
      const fetchCities = async () => {
        setIsLoadingCities(true);
        setCities([]); // Reset cities
        setAddressForm((prev) => ({ ...prev, city: "" })); // Reset city selection
        try {
          const data = await getCities({
            provinceExternalId: selectedProvinceExternalId,
          });

          if (data.length === 0) {
            toast.error(t("error.noCities"));
          } else {
            setCities(data);
          }
        } catch (error) {
          console.error("Error fetching cities:", error);
          toast.error(t("error.fetchCities"));
          setCities([]);
        } finally {
          setIsLoadingCities(false);
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setAddressForm((prev) => ({ ...prev, city: "" }));
    }
  }, [selectedProvinceExternalId, provinces, t]);

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

    // ✅ تبدیل اعداد فارسی به انگلیسی قبل از validation
    const formDataForValidation = {
      ...addressForm,
      postalCode: persianToEnglish(addressForm.postalCode),
      nationalId: persianToEnglish(addressForm.nationalId),
      mobile: persianToEnglish(addressForm.mobile),
    };

    // Validate with Zod
    try {
      const validatedData = addressFormSchema.parse(formDataForValidation);

      setIsSavingAddress(true);
      try {
        // ✅ اگر در حال edit هستیم، updateAddress صدا بزنیم
        if (editingAddressId) {
          await updateAddress(editingAddressId, validatedData);
          toast.success(t("success.addressUpdated"));
        } else {
          // ✅ اگر آدرس جدید است، createAddress صدا بزنیم
          await createAddress(validatedData);
          toast.success(t("success.addressAdded"));
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
        // ✅ Reset display states
        setPostalCodeDisplay("");
        setNationalIdDisplay("");
        setMobileDisplay("");
        setIsAddressModalOpen(false);
        // Reload addresses
        await loadAddresses();
      } catch (error) {
        // ✅ استفاده از ErrorHandler
        const handledError = ErrorHandler.handle(
          error as Error & {
            data?: ErrorResponse;
            statusCode?: number;
            code?: string;
          }
        );

        // ✅ Handle کردن بر اساس type
        switch (handledError.type) {
          case "duplicate_entry":
            // ✅ Handle MAX_ADDRESSES_EXCEEDED یا duplicate entry
            toast.error(handledError.message || t("error.maxAddresses"));
            setIsAddressModalOpen(false);
            await loadAddresses();
            return;

          case "validation_error":
            // ✅ نمایش خطاهای validation در فیلدها
            if (handledError.errors) {
              const fieldErrors: Partial<
                Record<keyof AddressFormData, string>
              > = {};
              Object.entries(handledError.errors).forEach(
                ([field, messages]) => {
                  fieldErrors[field as keyof AddressFormData] = messages[0];
                }
              );
              setFormErrors(fieldErrors);
            }
            toast.error(
              Array.isArray(handledError.message)
                ? handledError.message[0]
                : handledError.message || t("error.validation")
            );
            return;

          case "rate_limit":
          case "generic_error":
          case "not_found":
          default:
            // ✅ Type guard برای message
            if ("message" in handledError) {
              toast.error(handledError.message || t("error.saveAddress"));
            } else {
              toast.error(t("error.saveAddress"));
            }
        }
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
        toast.error(t("error.validation"));
      }
    }
  };

  // ✅ تابع برای باز کردن modal در حالت edit
  const handleEditAddress = async (address: Address) => {
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
    // ✅ تبدیل اعداد انگلیسی به فارسی برای نمایش
    setPostalCodeDisplay(englishToPersian(address.postalCode));
    setNationalIdDisplay(englishToPersian(address.nationalId));
    setMobileDisplay(englishToPersian(address.mobile));

    // ✅ پیدا کردن externalId استان از نام
    if (address.province) {
      // اگر استان‌ها هنوز لود نشده‌اند، ابتدا لود کن
      let provincesData = provinces;
      if (provincesData.length === 0) {
        try {
          provincesData = await getProvinces();
          setProvinces(provincesData);
        } catch (error) {
          console.error("Error loading provinces for edit:", error);
        }
      }

      const province = provincesData.find((p) => p.name === address.province);
      if (province) {
        setSelectedProvinceExternalId(province.externalId);
        // شهرها به صورت خودکار از useEffect لود می‌شوند
      } else {
        setSelectedProvinceExternalId(null);
      }
    } else {
      setSelectedProvinceExternalId(null);
    }

    setIsAddressModalOpen(true);
  };

  // ✅ تابع برای باز کردن modal در حالت جدید
  const handleAddNewAddress = () => {
    // ✅ محدودیت 2 آدرس
    if (addresses.length >= 2) {
      toast.error(t("error.maxAddresses"));
      return;
    }

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
    // ✅ Reset display states
    setPostalCodeDisplay("");
    setNationalIdDisplay("");
    setMobileDisplay("");
    // ✅ Reset province and city selection
    setSelectedProvinceExternalId(null);
    setCities([]);
    setIsAddressModalOpen(true);
  };

  // ✅ باز کردن confirmation modal
  const handleDeleteAddress = (id: string) => {
    setDeleteConfirm({ isOpen: true, addressId: id });
  };

  // ✅ تایید و حذف آدرس
  const confirmDeleteAddress = async () => {
    if (!deleteConfirm.addressId) return;

    try {
      await deleteAddress(deleteConfirm.addressId);
      await loadAddresses();
      if (selectedAddressId === deleteConfirm.addressId) {
        setSelectedAddressId(null);
      }
      toast.success(t("success.addressDeleted"));
      setDeleteConfirm({ isOpen: false, addressId: null });
    } catch (error) {
      console.error("Error deleting address:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("error.deleteAddress");
      toast.error(errorMessage);
    }
  };

  // ✅ Handler برای پرداخت - با error handling برای cart expired
  const handlePayment = async () => {
    if (!cart?.cart?._id || !selectedAddressId) {
      alert(t("error.selectAddress"));
      return;
    }

    // ✅ بررسی اینکه shipping method انتخاب شده باشد
    if (!selectedShippingId) {
      toast.error(
        t("error.selectShipping") || "لطفاً روش ارسال را انتخاب کنید"
      );
      setActiveTab("shipping"); // Redirect به تب shipping
      return;
    }

    // ✅ Validation: بررسی اینکه shippingId معتبر است
    if (!/^[0-9a-fA-F]{24}$/.test(selectedShippingId)) {
      toast.error("روش ارسال انتخاب شده معتبر نیست");
      setActiveTab("shipping");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const order = await createOrder({
        cartId: cart.cart._id,
        addressId: selectedAddressId,
        shippingId: selectedShippingId,
      });

      // ✅ Success - redirect to payment
      if (order.paymentUrl) {
        // ✅ Redirect به درگاه پرداخت زرین‌پال
        window.location.href = order.paymentUrl;
      } else {
        // ✅ Mock Payment - در development
        toast.success(t("success.orderCreated") || "سفارش با موفقیت ثبت شد");
        // Redirect به صفحه success
        router.push(`/order/success?id=${order.orderId}`);
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
        alert(t("error.cartExpired"));
        router.push("/products");
        return;
      }

      // Handle سایر errors
      alert(
        errorWithDetails.message ||
          (error instanceof Error ? error.message : t("error.createOrder"))
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Timer countdown - استفاده از remainingSeconds از backend
  // برای UX بهتر، تایمر client-side داریم اما هر 30 ثانیه با backend sync می‌شود
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  // ✅ تبدیل cart?.items به فرمت مورد نیاز صفحه پرداخت
  // ✅ فیلتر کردن طلای آب شده از cart (باید فقط در purchase باشد)
  const cartItemsFiltered = (cart?.items || []).filter(
    (item) => item.product.productType !== "melted_gold"
  );

  // ✅ بررسی isEmpty و isExpired برای UI logic (طبق مستندات جدید backend)
  // ✅ اگر timer به 0 رسیده یا backend expired کرده، expired است
  const isExpired = cart?.expired === true || remainingSeconds <= 0;
  // ✅ استفاده از state برای نگه‌داری تا دفعه بعدی
  // ⚠️ مهم: expiredFirstTimeState از timer یا backend می‌آید
  const expiredFirstTime =
    expiredFirstTimeState || cart?.expiredFirstTime === true;
  // ✅ منطق جدید: اولویت با isExpired و expiredFirstTime
  // اگر isExpired و expiredFirstTime باشد، حتی اگر items موجود باشد، پیام expired نمایش داده می‌شود
  // اگر isExpired و !expiredFirstTime باشد، یعنی دفعات بعدی است و items پاک شده، پس isEmpty = true
  // ⚠️ مهم: اگر expiredFirstTime true است، isEmpty را false کن (حتی اگر items خالی باشد)
  const isEmpty =
    !loading &&
    cartItemsFiltered.length === 0 &&
    (!isExpired || !expiredFirstTime) &&
    !expiredFirstTime; // ✅ اگر expiredFirstTime true است، isEmpty را false کن

  // ✅ Redirect به صفحه اصلی اگر سبد خرید خالی است (اما نه اگر expiredFirstTime باشد)
  useEffect(() => {
    if (!loading && isEmpty && !expiredFirstTime) {
      router.push("/");
    }
  }, [isEmpty, loading, router, expiredFirstTime]);

  useEffect(() => {
    // ✅ اگر cart expired است، timeLeft را به‌روز نکن (0 نگه دار)
    const isExpired = cart?.expired === true || remainingSeconds <= 0;
    if (isExpired) {
      setTimeLeft(0);
      return;
    }
    // Update timer when remainingSeconds changes from backend
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds, cart]);

  // ✅ تعریف reloadCartRef در ابتدا
  const reloadCartRef = useRef(reloadCart);
  useEffect(() => {
    reloadCartRef.current = reloadCart;
  }, [reloadCart]);

  // ✅ Sync با backend هر 30 ثانیه (2 درخواست در دقیقه)
  useEffect(() => {
    // ⚠️ فقط اگر pathname صحیح است، interval را فعال کن
    if (pathname !== "/purchase/basket") {
      return;
    }

    // ✅ اگر cart expired است یا remainingSeconds <= 0 است، sync interval را اجرا نکن
    const isExpired = cart?.expired === true || remainingSeconds <= 0;
    if (isExpired) return;

    const syncInterval = setInterval(() => {
      // ✅ دوباره چک کردن که expired نشده باشد
      const currentIsExpired = cart?.expired === true || remainingSeconds <= 0;
      if (!currentIsExpired) {
        reloadCartRef.current();
      }
    }, 30000); // هر 30 ثانیه (2 درخواست در دقیقه)

    return () => clearInterval(syncInterval);
  }, [pathname, cart, remainingSeconds]); // ✅ اضافه کردن cart و remainingSeconds به dependency

  // ✅ Reset state وقتی کاربر از صفحه خارج می‌شود
  useEffect(() => {
    return () => {
      // ✅ وقتی component unmount می‌شود (یعنی کاربر از صفحه خارج می‌شود)، state را reset کن
      timerExpiredRef.current = false;
      setExpiredFirstTimeState(false);
    };
  }, []);

  // ✅ نگه‌داری expiredFirstTime در state وقتی از backend می‌آید
  useEffect(() => {
    // ✅ اگر expiredFirstTime از backend true است، state را true کن و flag را reset کن
    if (cart?.expiredFirstTime === true) {
      timerExpiredRef.current = false; // ✅ Reset flag چون backend خودش expiredFirstTime را true کرده
      setTimeout(() => setExpiredFirstTimeState(true), 0);
      return; // ✅ اگر expiredFirstTime true است، دیگر چک نکن
    }
    // ✅ اگر cart expired نیست (یعنی فعال است و محصول جدید اضافه شده)، state را reset کن
    // این یعنی کاربر محصول جدید اضافه کرده و cart دوباره فعال شده
    if (cart?.expired === false) {
      timerExpiredRef.current = false; // ✅ Reset flag چون cart فعال شده
      setTimeout(() => setExpiredFirstTimeState(false), 0);
      return; // ✅ اگر cart فعال است، state را reset کن و دیگر چک نکن
    }
    // ✅ اگر cart expired است و timerExpiredRef.current === true است، state را نگه دار (تغییر نده)
    // این یعنی timer به 0 رسیده و state قبلاً set شده است
    // ما state را فقط وقتی reset می‌کنیم که cart فعال شود (expired === false)
    // ⚠️ مهم: اگر timerExpiredRef.current === true است، state را تغییر نده (حتی اگر cart تغییر کند)
    if (timerExpiredRef.current === true) {
      // ✅ State را نگه دار (تغییر نده) - این مهم است که این چک قبل از سایر چک‌ها باشد
      return;
    }
    // ✅ در سایر حالات، state را تغییر نده
  }, [cart]);

  // ✅ تایمر client-side - فقط یک بار اجرا می‌شود
  useEffect(() => {
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
          // ✅ وقتی counter به 0 می‌رسد، flag را set کن و expiredFirstTimeState را true کن (قبل از reload)
          // این باعث می‌شود که حتی بعد از reload که backend expiredFirstTime را false می‌کند، state نگه داشته شود
          // ⚠️ مهم: اول flag را set کن، سپس state را set کن، و در آخر reload را اجرا کن
          timerExpiredRef.current = true;
          setExpiredFirstTimeState(true);
          // ✅ سپس cart را refresh کن (با کمی delay تا state به‌روز شود)
          // Backend خودش items را پاک می‌کند و expiredFirstTime را false می‌کند
          setTimeout(() => {
            reloadCartRef.current();
          }, 100); // ✅ کمی delay برای اطمینان از اینکه state به‌روز شده است
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cart, remainingSeconds]); // ✅ اضافه کردن remainingSeconds به dependency

  // تبدیل cartItemsFiltered به فرمت مورد نیاز صفحه پرداخت
  const cartItems: CartItem[] = cartItemsFiltered.map((item) => {
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
      weight: product.weight || t("cart.product.unknown"),
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

  const subtotal = cartSubtotal;
  const totalDiscount = cartTotalDiscount;
  const walletAmount: number = 0; // User's wallet balance
  // ✅ shippingCost از state گرفته می‌شود (از shipping method انتخاب شده)
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
          <span className="text-sm">{t("cart.backToHome")}</span>
        </Link>

        {/* Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() =>
              !isEmpty &&
              !isExpired &&
              !expiredFirstTime &&
              setActiveTab("cart")
            }
            disabled={isEmpty || isExpired || expiredFirstTime}
            className={`pb-3 sm:pb-4 px-2 sm:px-4 text-xs sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
              isEmpty || isExpired || expiredFirstTime
                ? "text-gray-400 cursor-not-allowed opacity-60"
                : activeTab === "cart"
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("tabs.cart")}
            {activeTab === "cart" &&
              !isEmpty &&
              !isExpired &&
              !expiredFirstTime && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
          </button>
          <button
            onClick={() =>
              !isEmpty &&
              !isExpired &&
              !expiredFirstTime &&
              setActiveTab("shipping")
            }
            disabled={isEmpty || isExpired || expiredFirstTime}
            className={`pb-3 sm:pb-4 px-2 sm:px-4 text-xs sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
              isEmpty || isExpired || expiredFirstTime
                ? "text-gray-400 cursor-not-allowed opacity-60"
                : activeTab === "shipping"
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("tabs.shipping")}
            {activeTab === "shipping" &&
              !isEmpty &&
              !isExpired &&
              !expiredFirstTime && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
          </button>
          <button
            onClick={() =>
              !isEmpty &&
              !isExpired &&
              !expiredFirstTime &&
              setActiveTab("payment")
            }
            disabled={isEmpty || isExpired || expiredFirstTime}
            className={`pb-3 sm:pb-4 px-2 sm:px-4 text-xs sm:text-base font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
              isEmpty || isExpired || expiredFirstTime
                ? "text-gray-400 cursor-not-allowed opacity-60"
                : activeTab === "payment"
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("tabs.payment")}
            {activeTab === "payment" &&
              !isEmpty &&
              !isExpired &&
              !expiredFirstTime && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
          </button>
        </div>

        {/* Content */}
        {activeTab === "cart" && (
          <>
            {/* Expired Message - اولویت اول: وقتی counter به 0 می‌رسد */}
            {isExpired && expiredFirstTime ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] py-8 sm:py-12 px-4">
                <div className="bg-red-100 rounded-full p-4 sm:p-6 mb-4 sm:mb-6">
                  <AlarmClockMinus className="w-12 h-12 sm:w-16 sm:h-16 text-red-600" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center justify-center gap-2 whitespace-nowrap">
                  <AlarmClockMinus className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {t("cart.expired.title")}
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 flex items-center gap-2 justify-center text-center max-w-md">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {t("cart.expired.message")}
                  </span>
                </p>
                <Link
                  href="/"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-white hover:bg-primary/90 transition-colors text-sm sm:text-base font-medium rounded-lg whitespace-nowrap"
                >
                  بازگشت به محصولات
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Empty Cart Message - اولویت اول */}
                {isEmpty ? (
                  <div className="lg:col-span-3 mb-4 flex justify-center px-4">
                    <div
                      className={`inline-block px-4 sm:px-6 py-3 sm:py-4 border rounded-lg text-center w-full sm:w-auto ${
                        isExpired && expiredFirstTime
                          ? "bg-red-100 border-red-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-sm sm:text-base font-bold flex flex-col sm:flex-row items-center justify-center gap-2 ${
                          isExpired && expiredFirstTime
                            ? "text-red-800"
                            : "text-gray-800"
                        }`}
                      >
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          {isExpired && expiredFirstTime ? (
                            <AlarmClockMinus className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                          ) : (
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                          )}
                          <span className="whitespace-nowrap">
                            {isExpired && expiredFirstTime
                              ? t("cart.expired.title")
                              : t("cart.empty")}
                          </span>
                        </span>
                      </p>
                      {isExpired && expiredFirstTime ? (
                        <p className="text-xs sm:text-sm text-red-700 mt-2 flex items-center justify-center gap-2">
                          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {t("cart.expired.message")}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 flex items-center justify-center gap-2">
                          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {t("cart.drawer.empty.message")}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

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
                              {item.discount.toLocaleString("fa-IR")}٪
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
                              aria-label={t("address.delete")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Product Code */}
                          <p className="text-xs text-gray-500 mb-2">
                            {item.code}
                          </p>

                          {/* Weight */}
                          <p className="text-xs text-gray-600 mb-0.5">
                            وزن:{" "}
                            {item.weight
                              ? englishToPersian(item.weight)
                              : item.goldInfo?.weight
                              ? `${englishToPersian(
                                  String(item.goldInfo.weight)
                                )} گرم`
                              : t("cart.product.unknown")}
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
                                سایز: {englishToPersian(item.size)}
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
                        <AlarmClockMinus className="w-3.5 h-3.5" />
                        <p className="text-[11px]">
                          برای تکمیل خرید خود{" "}
                          <span className="font-bold text-xs mx-1 bg-red-500 px-1.5 py-0.5 rounded inline-block text-center tabular-nums min-w-[3rem]">
                            {formatTime(timeLeft)}
                          </span>{" "}
                          {t("cart.timeLeft")}
                        </p>
                      </div>
                    </div>

                    {/* Price Details */}
                    <div className="space-y-3">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white">
                            {t("cart.subtotal")}
                          </span>
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
                          <span className="text-white">
                            {t("cart.discount")}
                          </span>
                          <span className="font-medium text-red-400">
                            {totalDiscount.toLocaleString("fa-IR")} تومان
                          </span>
                        </div>
                      )}

                      {/* Wallet */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">{t("cart.wallet")}</span>
                        <span className="font-medium text-white">
                          {walletAmount.toLocaleString("fa-IR")} تومان
                        </span>
                      </div>

                      {/* Shipping */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white">{t("cart.shipping")}</span>
                        {shippingCost === 0 ? (
                          <span className="font-medium text-white">
                            {t("cart.free")}
                          </span>
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
                        disabled={isEmpty || isExpired || expiredFirstTime}
                        className={`w-full py-2 text-sm font-medium transition-colors mt-3 rounded ${
                          isEmpty || isExpired || expiredFirstTime
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                            : "bg-white hover:bg-white/90 text-primary"
                        }`}
                      >
                        {isEmpty || isExpired || expiredFirstTime
                          ? t("cart.expiredButton")
                          : t("cart.continue")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Empty Cart Message - اولویت اول */}
            {isEmpty ? (
              <div className="lg:col-span-3 mb-4 flex justify-center">
                <div className="inline-block px-6 py-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-base font-bold text-gray-800 flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    {t("cart.empty")}
                  </p>
                </div>
              </div>
            ) : isExpired ? (
              /* Expired Message - اولویت دوم (فقط در اولین بار expired) */
              <div className="lg:col-span-3 mb-4 flex flex-col items-center gap-3 sm:gap-4 px-4">
                <div className="inline-block px-4 sm:px-6 py-3 sm:py-4 bg-red-100 border border-red-300 rounded-lg text-center w-full sm:w-auto">
                  <p className="text-sm sm:text-base font-bold text-red-800 mb-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <AlarmClockMinus className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {t("cart.expired.title")}
                      </span>
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-red-700 flex items-center justify-center gap-2">
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {t("cart.expired.message")}
                    </span>
                  </p>
                </div>
                <Link
                  href="/"
                  className="px-5 sm:px-6 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap w-full sm:w-auto text-center"
                >
                  بازگشت به محصولات
                </Link>
              </div>
            ) : null}
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
                    disabled={isExpired && expiredFirstTime}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded ${
                      isExpired && expiredFirstTime
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    <span>+</span>
                    <span>{t("address.addNew")}</span>
                  </button>
                </div>

                {isLoadingAddresses ? (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    در حال بارگذاری...
                  </p>
                ) : addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    {t("address.noAddress")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`border rounded-lg p-4 transition-all ${
                          selectedAddressId === addr._id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Radio Button */}
                          <div className="flex-shrink-0 pt-0.5">
                            <input
                              type="radio"
                              name="address-selection"
                              id={`address-${addr._id}`}
                              checked={selectedAddressId === addr._id}
                              onChange={() => setSelectedAddressId(addr._id)}
                              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 bg-white checked:bg-primary checked:border-primary cursor-pointer"
                            />
                          </div>

                          {/* Address Content */}
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`address-${addr._id}`}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900 text-base">
                                  {addr.title}
                                </h4>
                                {addr.isDefault && (
                                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded">
                                    پیش‌فرض
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p
                                  className="text-sm text-gray-600 mb-1.5 truncate"
                                  title={addr.address}
                                >
                                  {addr.address}
                                </p>
                                <p className="text-sm text-gray-700 font-medium">
                                  {addr.firstName} {addr.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {addr.mobile}
                                </p>
                              </div>
                            </label>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr);
                              }}
                              className="p-2 text-primary hover:bg-primary/10 transition-colors rounded border border-primary/30"
                              aria-label={t("address.edit")}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr._id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 transition-colors rounded border border-red-300"
                              aria-label={t("address.delete")}
                            >
                              <Trash2 className="w-4 h-4" />
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
                    {t("address.shippingMethod")}
                  </h3>
                </div>

                {/* ✅ Shipping Method Selection */}
                {isLoadingShippingMethods ? (
                  <div className="flex items-center justify-center py-8">
                    <Loading size="md" text="در حال دریافت روش‌های ارسال..." />
                  </div>
                ) : shippingMethods.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      در حال حاضر روش ارسالی در دسترس نیست. لطفاً با پشتیبانی
                      تماس بگیرید.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <div
                        key={method._id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedShippingId === method._id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedShippingId(method._id);
                          // ✅ محاسبه هزینه ارسال
                          const price = calculateShippingPrice(
                            method,
                            cartTotal
                          );
                          setShippingCost(price);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping-method"
                            id={`shipping-${method._id}`}
                            checked={selectedShippingId === method._id}
                            onChange={() => {
                              setSelectedShippingId(method._id);
                              // ✅ محاسبه هزینه ارسال
                              const price = calculateShippingPrice(
                                method,
                                cartTotal
                              );
                              setShippingCost(price);
                            }}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 bg-white checked:bg-primary checked:border-primary cursor-pointer"
                          />
                          <label
                            htmlFor={`shipping-${method._id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {method.name}
                                </p>
                                {method.description && (
                                  <p className="text-sm text-gray-500">
                                    {method.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-primary">
                                  {calculateShippingPrice(method, cartTotal) ===
                                  0 ? (
                                    <span className="text-green-600">
                                      رایگان
                                    </span>
                                  ) : (
                                    `${calculateShippingPrice(
                                      method,
                                      cartTotal
                                    ).toLocaleString("fa-IR")} تومان`
                                  )}
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ Warning if no shipping method selected */}
                {!selectedShippingId && (
                  <p className="text-red-500 text-sm mt-3 text-center">
                    لطفاً روش ارسال را انتخاب کنید
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-primary p-5 border border-gray-300 rounded sticky top-[180px]">
                {/* Timer Warning */}
                <div className="mb-5 py-1.5 px-3 border border-white/30 rounded text-center">
                  <div className="flex items-center justify-center gap-1.5 text-white">
                    <AlarmClockMinus className="w-3.5 h-3.5" />
                    <p className="text-[11px]">
                      برای تکمیل خرید خود{" "}
                      <span className="font-bold text-xs mx-1 bg-red-500 px-1.5 py-0.5 rounded inline-block text-center tabular-nums min-w-[3rem]">
                        {formatTime(timeLeft)}
                      </span>{" "}
                      {t("cart.timeLeft")}
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
                          وزن:{" "}
                          {item.weight
                            ? englishToPersian(item.weight)
                            : t("cart.product.unknown")}
                        </p>
                        {/* برای سکه: سال ضرب، برای بقیه: سایز */}
                        {item.productType === "coin" &&
                        item.goldInfo?.mintYear ? (
                          <p className="text-xs text-white/80">
                            سال ضرب: {item.goldInfo.mintYear}
                          </p>
                        ) : item.size ? (
                          <p className="text-xs text-white/80">
                            سایز: {englishToPersian(item.size)}
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
                      <span className="text-white">{t("cart.subtotal")}</span>
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
                      <span className="text-white">{t("cart.discount")}</span>
                      <span className="font-medium text-red-300">
                        {totalDiscount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}

                  {/* Wallet */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{t("cart.wallet")}</span>
                    <span className="font-medium text-white">
                      {walletAmount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{t("cart.shipping")}</span>
                    {shippingCost === 0 ? (
                      <span className="font-medium text-white">
                        {t("cart.free")}
                      </span>
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
                    disabled={isEmpty || isExpired || expiredFirstTime}
                    className={`w-full py-2 text-sm font-medium transition-colors mt-3 rounded ${
                      isEmpty || isExpired || expiredFirstTime
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-white hover:bg-white/90 text-primary"
                    }`}
                  >
                    {isEmpty || isExpired || expiredFirstTime
                      ? t("cart.expiredButton")
                      : t("cart.continue")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Empty Cart Message - اولویت اول */}
            {isEmpty ? (
              <div className="lg:col-span-3 mb-4 flex justify-center">
                <div className="inline-block px-6 py-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-base font-bold text-gray-800 flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    {t("cart.empty")}
                  </p>
                </div>
              </div>
            ) : isExpired ? (
              /* Expired Message - اولویت دوم (فقط در اولین بار expired) */
              <div className="lg:col-span-3 mb-4 flex flex-col items-center gap-3 sm:gap-4 px-4">
                <div className="inline-block px-4 sm:px-6 py-3 sm:py-4 bg-red-100 border border-red-300 rounded-lg text-center w-full sm:w-auto">
                  <p className="text-sm sm:text-base font-bold text-red-800 mb-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <AlarmClockMinus className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {t("cart.expired.title")}
                      </span>
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-red-700 flex items-center justify-center gap-2">
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {t("cart.expired.message")}
                    </span>
                  </p>
                </div>
                <Link
                  href="/"
                  className="px-5 sm:px-6 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap w-full sm:w-auto text-center"
                >
                  بازگشت به محصولات
                </Link>
              </div>
            ) : null}
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
                        alt={t("payment.gateways.saman")}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm text-gray-900">
                      {t("payment.saman")}
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
                        alt={t("payment.gateways.mellat")}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm text-gray-900">
                      {t("payment.mellat")}
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
                      {t("payment.zarinpal")}
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
                      placeholder={t("form.discountCode.placeholder")}
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
                    <AlarmClockMinus className="w-3.5 h-3.5" />
                    <p className="text-[11px]">
                      برای تکمیل خرید خود{" "}
                      <span className="font-bold text-xs mx-1 bg-red-500 px-1.5 py-0.5 rounded inline-block text-center tabular-nums min-w-[3rem]">
                        {formatTime(timeLeft)}
                      </span>{" "}
                      {t("cart.timeLeft")}
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
                          <p className="text-white/80">
                            وزن:{" "}
                            {item.weight
                              ? englishToPersian(item.weight)
                              : t("cart.product.unknown")}
                          </p>
                          {/* برای سکه: سال ضرب، برای بقیه: سایز */}
                          {item.productType === "coin" &&
                          item.goldInfo?.mintYear ? (
                            <p className="text-white/80">
                              سال ضرب: {item.goldInfo.mintYear}
                            </p>
                          ) : item.size ? (
                            <p className="text-white/80">
                              سایز: {englishToPersian(item.size)}
                            </p>
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
                    <span>{t("cart.totalItems")}</span>
                    <span className="font-medium">
                      {cartSubtotal.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span>{t("cart.totalDiscount")}</span>
                      <span className="font-medium text-red-300">
                        {totalDiscount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("cart.walletLabel")}</span>
                    <span className="font-medium">
                      {walletAmount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("cart.shippingLabel")}</span>
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
                    isEmpty ||
                    isExpired ||
                    expiredFirstTime ||
                    isProcessingPayment ||
                    !selectedAddressId
                  }
                  onClick={handlePayment}
                  className={`w-full py-2 text-sm font-medium transition-colors rounded ${
                    isEmpty ||
                    isExpired ||
                    expiredFirstTime ||
                    !selectedAddressId
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-white text-primary hover:bg-gray-100"
                  }`}
                >
                  {isEmpty || isExpired || expiredFirstTime
                    ? t("cart.expiredButton")
                    : isProcessingPayment
                    ? tCommon("loading")
                    : !selectedAddressId
                    ? t("error.selectAddress")
                    : t("payment.online")}
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
                  // ✅ Reset province and city selection
                  setSelectedProvinceExternalId(null);
                  setCities([]);
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
                  // ✅ Reset display states
                  setPostalCodeDisplay("");
                  setNationalIdDisplay("");
                  setMobileDisplay("");
                }}
                className="p-0.5 rounded hover:bg-gray-50 transition-colors"
                aria-label={tCommon("close")}
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
                      {editingAddressId
                        ? t("address.edit")
                        : t("address.addNew")}
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        عنوان آدرس{" "}
                        <span className="text-red-500 text-[10px]">
                          (الزامی)
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={25}
                        value={addressForm.title}
                        onChange={(e) => {
                          const value = e.target.value;
                          // ✅ بررسی اینکه آیا فقط فارسی است
                          if (value && !/^[\u0600-\u06FF\s،]+$/.test(value)) {
                            setFormErrors({
                              ...formErrors,
                              title: t("form.title.error"),
                            });
                            return;
                          }
                          setAddressForm({
                            ...addressForm,
                            title: value,
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
                        placeholder={t("form.title.placeholder")}
                      />
                      <FieldError error={formErrors.title} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          استان{" "}
                          <span className="text-red-500 text-[10px]">
                            (الزامی)
                          </span>
                        </label>
                        <select
                          required
                          disabled={isLoadingProvinces}
                          value={
                            selectedProvinceExternalId
                              ? selectedProvinceExternalId.toString()
                              : ""
                          }
                          onChange={(e) => {
                            const externalId =
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value, 10);
                            setSelectedProvinceExternalId(externalId);
                            // پیدا کردن نام استان
                            const selectedProvince = provinces.find(
                              (p) => p.externalId === externalId
                            );
                            setAddressForm({
                              ...addressForm,
                              province: selectedProvince?.name || "",
                              city: "", // Reset city when province changes
                            });
                            if (formErrors.province) {
                              setFormErrors({
                                ...formErrors,
                                province: undefined,
                              });
                            }
                            if (formErrors.city) {
                              setFormErrors({
                                ...formErrors,
                                city: undefined,
                              });
                            }
                          }}
                          className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 transition-colors rounded ${
                            formErrors.province
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${
                            isLoadingProvinces
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="" className="text-gray-400">
                            {isLoadingProvinces
                              ? tCommon("loading")
                              : t("form.province.select")}
                          </option>
                          {provinces.map((province) => (
                            <option
                              key={province._id}
                              value={province.externalId.toString()}
                            >
                              {province.name}
                            </option>
                          ))}
                        </select>
                        <FieldError error={formErrors.province} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          شهر{" "}
                          <span className="text-red-500 text-[10px]">
                            (الزامی)
                          </span>
                        </label>
                        <select
                          required
                          disabled={
                            !selectedProvinceExternalId || isLoadingCities
                          }
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
                          className={`w-full px-3 py-2 border bg-white focus:border-primary focus:outline-none text-sm text-gray-900 transition-colors rounded ${
                            formErrors.city
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${
                            !selectedProvinceExternalId || isLoadingCities
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="" className="text-gray-400">
                            {!selectedProvinceExternalId
                              ? t("form.city.selectProvince")
                              : isLoadingCities
                              ? tCommon("loading")
                              : t("form.city.select")}
                          </option>
                          {cities.map((city) => (
                            <option key={city._id} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        <FieldError error={formErrors.city} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        کد پستی{" "}
                        <span className="text-red-500 text-[10px]">
                          (الزامی)
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={postalCodeDisplay}
                        onChange={(e) => {
                          // ✅ استخراج فقط اعداد (فارسی و انگلیسی)
                          const numbersOnly = e.target.value.replace(
                            /[^\d۰-۹]/g,
                            ""
                          );
                          if (numbersOnly.length <= 10) {
                            // ✅ تبدیل به انگلیسی برای state اصلی
                            const englishValue = persianToEnglish(numbersOnly);
                            setAddressForm({
                              ...addressForm,
                              postalCode: englishValue,
                            });
                            // ✅ تبدیل به فارسی برای نمایش
                            const persianValue = englishToPersian(englishValue);
                            setPostalCodeDisplay(persianValue);
                          }
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
                        placeholder={t("form.postalCode.placeholder")}
                        dir="ltr"
                        inputMode="numeric"
                      />
                      <FieldError error={formErrors.postalCode} />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        آدرس{" "}
                        <span className="text-red-500 text-[10px]">
                          (الزامی)
                        </span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        maxLength={200}
                        value={addressForm.address}
                        onChange={(e) => {
                          const value = e.target.value;
                          // ✅ بررسی تعداد خطوط
                          const lines = value.split("\n").length;
                          if (lines > 3) {
                            return; // ✅ جلوگیری از بیش از 3 خط
                          }
                          // ✅ بررسی اینکه آیا فقط فارسی است
                          if (
                            value &&
                            !/^[\u0600-\u06FF\u06F0-\u06F9\s،.؛:]*$/.test(value)
                          ) {
                            setFormErrors({
                              ...formErrors,
                              address: t("form.address.error"),
                            });
                            return;
                          }
                          setAddressForm({
                            ...addressForm,
                            address: value,
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
                        placeholder={t("form.address.placeholder")}
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
                          نام{" "}
                          <span className="text-red-500 text-[10px]">
                            (الزامی)
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={30}
                          value={addressForm.firstName}
                          onChange={(e) => {
                            const value = e.target.value;
                            // ✅ بررسی اینکه آیا فقط فارسی است
                            if (value && !isPersianOnly(value)) {
                              setFormErrors({
                                ...formErrors,
                                firstName: t("form.firstName.error"),
                              });
                              return;
                            }
                            setAddressForm({
                              ...addressForm,
                              firstName: value,
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
                          placeholder={t("form.firstName.placeholder")}
                        />
                        <FieldError error={formErrors.firstName} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          نام خانوادگی{" "}
                          <span className="text-red-500 text-[10px]">
                            (الزامی)
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={30}
                          value={addressForm.lastName}
                          onChange={(e) => {
                            const value = e.target.value;
                            // ✅ بررسی اینکه آیا فقط فارسی است
                            if (value && !isPersianOnly(value)) {
                              setFormErrors({
                                ...formErrors,
                                lastName: t("form.lastName.error"),
                              });
                              return;
                            }
                            setAddressForm({
                              ...addressForm,
                              lastName: value,
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
                          placeholder={t("form.lastName.placeholder")}
                        />
                        <FieldError error={formErrors.lastName} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          کد ملی{" "}
                          <span className="text-red-500 text-[10px]">
                            (الزامی)
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={nationalIdDisplay}
                          onChange={(e) => {
                            // ✅ استخراج فقط اعداد (فارسی و انگلیسی)
                            const numbersOnly = e.target.value.replace(
                              /[^\d۰-۹]/g,
                              ""
                            );
                            if (numbersOnly.length <= 10) {
                              // ✅ تبدیل به انگلیسی برای state اصلی
                              const englishValue =
                                persianToEnglish(numbersOnly);
                              setAddressForm({
                                ...addressForm,
                                nationalId: englishValue,
                              });
                              // ✅ تبدیل به فارسی برای نمایش
                              const persianValue =
                                englishToPersian(englishValue);
                              setNationalIdDisplay(persianValue);
                            }
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
                          placeholder={t("form.nationalId.placeholder")}
                          dir="ltr"
                          inputMode="numeric"
                        />
                        <FieldError error={formErrors.nationalId} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1">
                          موبایل{" "}
                          <span className="text-red-500 text-[10px]">
                            (الزامی)
                          </span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          value={mobileDisplay}
                          onChange={(e) => {
                            // ✅ استخراج فقط اعداد (فارسی و انگلیسی)
                            const numbersOnly = e.target.value.replace(
                              /[^\d۰-۹]/g,
                              ""
                            );
                            if (numbersOnly.length <= 11) {
                              // ✅ تبدیل به انگلیسی برای state اصلی
                              const englishValue =
                                persianToEnglish(numbersOnly);
                              setAddressForm({
                                ...addressForm,
                                mobile: englishValue,
                              });
                              // ✅ تبدیل به فارسی برای نمایش
                              const persianValue =
                                englishToPersian(englishValue);
                              setMobileDisplay(persianValue);
                            }
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
                          placeholder={t("form.mobile.placeholder")}
                          dir="ltr"
                          inputMode="numeric"
                        />
                        <FieldError error={formErrors.mobile} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-800 mb-1">
                        ایمیل{" "}
                        <span className="text-gray-500 text-[10px]">
                          (اختیاری)
                        </span>
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
                        توضیحات{" "}
                        <span className="text-gray-500 text-[10px]">
                          (اختیاری)
                        </span>
                      </label>
                      <textarea
                        rows={3}
                        maxLength={200}
                        value={addressForm.notes || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          // ✅ بررسی اینکه آیا فقط فارسی است
                          if (
                            value &&
                            !/^[\u0600-\u06FF\u06F0-\u06F9\s،.؛:]*$/.test(value)
                          ) {
                            setFormErrors({
                              ...formErrors,
                              notes: t("form.notes.error"),
                            });
                            return;
                          }
                          setAddressForm({
                            ...addressForm,
                            notes: value,
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
                        placeholder={t("form.notes.placeholder")}
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
                    ? t("form.saving")
                    : editingAddressId
                    ? t("form.update")
                    : t("form.save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Confirmation Modal برای حذف آدرس */}
      <Transition appear show={deleteConfirm.isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setDeleteConfirm({ isOpen: false, addressId: null })}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-primary/50 backdrop-blur-sm p-6 text-right align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 mb-4"
                  >
                    حذف آدرس
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-white">
                      آیا مطمئن هستید که می‌خواهید این آدرس را حذف کنید؟
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      onClick={() =>
                        setDeleteConfirm({ isOpen: false, addressId: null })
                      }
                    >
                      {t("deleteConfirm.cancel")}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                      onClick={confirmDeleteAddress}
                    >
                      {t("deleteConfirm.confirm")}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
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
      <Loading fullScreen size="lg" />
    </div>
  ),
});
