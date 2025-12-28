"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import AuthModal from "@/components/auth/AuthModal";
import CartDrawer from "@/components/cart/CartDrawer";

import "swiper/css";
import "swiper/css/navigation";
import { useCart } from "@/contexts/CartContext";
import { getGoldPrice } from "@/lib/api/gold";
import {
  isLoggedIn,
  getUserInfo,
  logout,
  getUserDashboardInfo,
  type UserDashboardInfo,
} from "@/lib/api/auth";
import { convertEnglishToPersian } from "@/lib/utils";

const Navbar = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isCoinGoldMenuOpen, setIsCoinGoldMenuOpen] = useState(false);
  const [isMobileCoinGoldOpen, setIsMobileCoinGoldOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [goldPrice, setGoldPrice] = useState<number | null>(null);
  const [userInfo, setUserInfo] =
    useState<ReturnType<typeof getUserInfo>>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [dashboardInfo, setDashboardInfo] = useState<UserDashboardInfo | null>(
    null
  );
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const userMenuRefDesktop = useRef<HTMLDivElement>(null);
  const userMenuRefMobile = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("navbar");
  const { isCartOpen, openCart, closeCart } = useCart();

  const productCategories = [
    {
      id: "women",
      title: "زنانه",
      image: "/images/categories/categories1.webp",
      products: [
        { id: 1, name: "گردنبند", href: "/products/women/necklace" },
        { id: 2, name: "دستبند", href: "/products/women/bracelet" },
        {
          id: 3,
          name: "دستبند چرم و طلا",
          href: "/products/women/leather-gold-bracelet",
        },
        { id: 4, name: "گوشواره", href: "/products/women/earring" },
        { id: 5, name: "انگشتر", href: "/products/women/ring" },
        { id: 6, name: "آویز گردنبند", href: "/products/women/pendant" },
        { id: 7, name: "پیرسینگ", href: "/products/women/piercing" },
        { id: 8, name: "پابند", href: "/products/women/anklet" },
      ],
    },
    {
      id: "men",
      title: "مردانه",
      image: "/images/categories/categories2.webp",
      products: [
        { id: 1, name: "گردنبند مردانه", href: "/products/men/necklace" },
        {
          id: 2,
          name: "دستبند چرم و طلا",
          href: "/products/men/leather-gold-bracelet",
        },
        { id: 3, name: "دستبند مردانه", href: "/products/men/bracelet" },
      ],
    },
    {
      id: "kids",
      title: "کودکانه",
      image: "/images/categories/categories3.jpg",
      products: [
        { id: 1, name: "گوشواره", href: "/products/kids/earring" },
        { id: 2, name: "دستبند", href: "/products/kids/bracelet" },
        { id: 3, name: "آویز گردنبند", href: "/products/kids/pendant" },
        {
          id: 4,
          name: "دستبند چرم و طلا",
          href: "/products/kids/leather-gold-bracelet",
        },
      ],
    },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results page
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
    // Close search box when scrolling
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

  // فرمت کردن عدد با جداکننده هزارگان فارسی
  const formatNumber = (num: number): string => {
    const formatted = num.toLocaleString("en-US");
    return englishToPersian(formatted);
  };

  // ✅ Set isMounted to true after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ استفاده از useRef برای جلوگیری از double call
  const hasFetchedGoldPriceRef = useRef(false);

  // دریافت قیمت طلا
  useEffect(() => {
    // ✅ جلوگیری از double call
    if (hasFetchedGoldPriceRef.current) return;
    hasFetchedGoldPriceRef.current = true;

    const fetchGoldPrice = async () => {
      try {
        const priceData = await getGoldPrice();
        setGoldPrice(priceData.price);
      } catch {
        // ✅ خطا را به صورت silent handle می‌کنیم (نه console.error)
        // فقط state را null می‌کنیم تا UI پیام مناسب نمایش دهد
        setGoldPrice(null);
      }
    };

    fetchGoldPrice();

    // به‌روزرسانی قیمت هر 60 ثانیه
    const interval = setInterval(fetchGoldPrice, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ دریافت اطلاعات کاربر در mount و بعد از reload
  useEffect(() => {
    const checkAndSetUserInfo = () => {
      const userInfoData = getUserInfo();
      const isLoggedInValue = isLoggedIn();

      if (isLoggedInValue && userInfoData) {
        setUserInfo(userInfoData);
      } else {
        setUserInfo(null);
      }
    };

    // ✅ بررسی در mount (همیشه)
    checkAndSetUserInfo();

    // ✅ Listener برای تغییرات localStorage (برای به‌روزرسانی بعد از login)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userInfo" || e.key === "accessToken") {
        checkAndSetUserInfo();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // ✅ همچنین یک interval برای چک کردن تغییرات (برای تغییرات در همان tab)
    const interval = setInterval(checkAndSetUserInfo, 1000); // هر 1 ثانیه چک می‌کند

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []); // ✅ فقط یک بار در mount اجرا می‌شود

  // ✅ به‌روزرسانی userInfo زمانی که modal باز/بسته می‌شود
  useEffect(() => {
    const userInfoData = getUserInfo();
    const isLoggedInValue = isLoggedIn();
    if (isLoggedInValue && userInfoData) {
      setUserInfo(userInfoData);
    } else {
      setUserInfo(null);
      setDashboardInfo(null);
    }
  }, [isAuthModalOpen]);

  // ✅ دریافت اطلاعات dashboard زمانی که user menu باز می‌شود
  useEffect(() => {
    if (
      isUserMenuOpen &&
      isLoggedIn() &&
      !dashboardInfo &&
      !isLoadingDashboard
    ) {
      const loadDashboardInfo = async () => {
        setIsLoadingDashboard(true);
        try {
          const info = await getUserDashboardInfo();
          setDashboardInfo(info);
        } catch (error) {
          console.error("Error loading dashboard info:", error);
        } finally {
          setIsLoadingDashboard(false);
        }
      };
      loadDashboardInfo();
    }
  }, [isUserMenuOpen, dashboardInfo, isLoadingDashboard]);

  // تابع برای خروج از سیستم
  const handleLogout = async () => {
    try {
      await logout();
      setUserInfo(null);
      setDashboardInfo(null);
      setIsUserMenuOpen(false);
      // Reload page to update navbar
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // حتی اگر logout failed، state را پاک کن
      setUserInfo(null);
      setDashboardInfo(null);
      setIsUserMenuOpen(false);
      window.location.reload();
    }
  };

  // Close mobile menu when window is resized to desktop
  const handleResize = useCallback(() => {
    if (window.innerWidth >= 1024 && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Prevent body scroll when mobile menu or products menu is open
  useEffect(() => {
    if (isMobileMenuOpen || isProductsMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen, isProductsMenuOpen]);

  // Close search box and products menu when clicking outside
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside search box and not on search button
      const isSearchButton = target.closest("[data-search-button]");
      const isProductsButton = target.closest("[data-products-button]");
      const isCoinGoldButton = target.closest("[data-coin-gold-button]");

      if (
        searchRef.current &&
        !searchRef.current.contains(target) &&
        !isSearchButton
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }

      if (
        productsMenuRef.current &&
        !productsMenuRef.current.contains(target) &&
        !isProductsButton
      ) {
        setIsProductsMenuOpen(false);
      }

      if (!isCoinGoldButton) {
        setIsCoinGoldMenuOpen(false);
      }

      // ✅ بستن user menu اگر کلیک خارج از آن باشد
      const isUserMenuButton = target.closest("[data-user-menu-button]");
      const isInsideUserMenu =
        (userMenuRefDesktop.current &&
          userMenuRefDesktop.current.contains(target)) ||
        (userMenuRefMobile.current &&
          userMenuRefMobile.current.contains(target));

      if (isUserMenuOpen && !isInsideUserMenu && !isUserMenuButton) {
        setIsUserMenuOpen(false);
      }
    },
    [isUserMenuOpen]
  );

  useEffect(() => {
    if (
      isSearchOpen ||
      isProductsMenuOpen ||
      isCoinGoldMenuOpen ||
      isUserMenuOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isSearchOpen,
    isProductsMenuOpen,
    isCoinGoldMenuOpen,
    isUserMenuOpen,
    handleClickOutside,
  ]);

  const menuItems = [
    { id: "home", href: "/" },
    { id: "shop", href: "/products/women" },
    { id: "coin-gold", href: "#" },
    { id: "suggest", href: "/suggest" },
    { id: "faq", href: "/faq" },
    { id: "blog", href: "/blog" },
    { id: "about", href: "/about" },
    { id: "contact", href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{
        backgroundColor:
          isScrolled || isNavHovered
            ? "rgba(49, 93, 73, 0.95)"
            : "rgba(49, 93, 73, 0.15)",
        backdropFilter: "blur(10px)",
      }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 w-full ${
        isScrolled || isNavHovered
          ? "border-b border-white/10"
          : "border-b border-primary/10"
      }`}
    >
      {/* Top Bar - Announcements & Gold Price */}
      <div
        className="w-full max-w-[1920px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 bg-primary/30"
        onMouseEnter={() => setIsNavHovered(true)}
        onMouseLeave={() => setIsNavHovered(false)}
      >
        <div className="h-8 sm:h-9 lg:h-10 flex items-center justify-center gap-4 lg:gap-6 relative">
          {/* Center - Announcements Slider */}
          <div className="w-full max-w-[400px] overflow-hidden relative announcements-slider">
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                nextEl: ".announcement-button-next",
                prevEl: ".announcement-button-prev",
              }}
              loop={true}
              speed={600}
              className="h-8 sm:h-9 lg:h-10"
            >
              {/* Announcement 1 */}
              <SwiperSlide>
                <Link
                  href="/offers/black-friday"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-9 lg:h-10 hover:opacity-80 transition-opacity px-2"
                >
                  <span className="px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded flex-shrink-0">
                    جدید
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/90 truncate">
                    🎉 جشنواره بلک فرایدی - تا ۵۰٪ تخفیف!
                  </span>
                </Link>
              </SwiperSlide>

              {/* Announcement 2 */}
              <SwiperSlide>
                <Link
                  href="/offers/special"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-9 lg:h-10 hover:opacity-80 transition-opacity px-2"
                >
                  <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-500 text-gray-900 text-[9px] sm:text-[10px] font-bold rounded flex-shrink-0">
                    ویژه
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/90 truncate">
                    ⭐ ارسال رایگان برای خریدهای بالای ۵ میلیون تومان
                  </span>
                </Link>
              </SwiperSlide>

              {/* Announcement 3 */}
              <SwiperSlide>
                <Link
                  href="/products/new"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-9 lg:h-10 hover:opacity-80 transition-opacity px-2"
                >
                  <span className="px-1.5 sm:px-2 py-0.5 bg-green-500 text-white text-[9px] sm:text-[10px] font-bold rounded flex-shrink-0">
                    محصول جدید
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/90 truncate">
                    ✨ کالکشن پاییزه الان موجوده!
                  </span>
                </Link>
              </SwiperSlide>

              {/* Announcement 4 */}
              <SwiperSlide>
                <Link
                  href="/offers/gold-discount"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-9 lg:h-10 hover:opacity-80 transition-opacity px-2"
                >
                  <span className="px-1.5 sm:px-2 py-0.5 bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold rounded flex-shrink-0">
                    تخفیف
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-white/90 truncate">
                    💰 تخفیف ویژه محصولات طلا - فقط امروز!
                  </span>
                </Link>
              </SwiperSlide>
            </Swiper>

            {/* Navigation Buttons */}
            <button
              className="announcement-button-prev absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-0.5 sm:p-1 rounded transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </button>
            <button
              className="announcement-button-next absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-0.5 sm:p-1 rounded transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </button>
          </div>

          {/* Left - Gold Price (Absolute Positioned - Desktop Only) */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0 absolute left-8 top-1/2 -translate-y-1/2">
            {/* Gold Price */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute w-2 h-2 bg-red-600 rounded-full animate-ping opacity-75"></span>
                <span className="relative w-2 h-2 bg-red-600 rounded-full block"></span>
              </div>
              <span className="text-xs font-medium text-white/90">
                قیمت لحظه‌ای طلا:
              </span>
              <span className="text-sm font-bold text-yellow-400">
                {goldPrice
                  ? `${formatNumber(goldPrice)} تومان`
                  : "در حال دریافت..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Top Bar - Always Visible */}
      <div className="xl:hidden w-full max-w-[1920px] mx-auto px-3 xs:px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 xs:h-18 sm:h-20 relative w-full">
          {/* Left Section - Menu + Favorites + Search */}
          <div className="flex items-center gap-4 xs:gap-3 sm:gap-4 flex-shrink-0 z-10">
            {/* Mobile Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className={`transition-colors z-10 active:opacity-70 flex-shrink-0 ${
                isScrolled ? "text-white" : "text-primary"
              }`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 xs:w-6 xs:h-6" />
              ) : (
                <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
              )}
            </button>

            {/* Favorites Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`transition-colors ${
                isScrolled ? "text-white" : "text-primary"
              }`}
              aria-label={t("favorites")}
            >
              <Heart className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* Search Button (Mobile/Tablet) */}
            <motion.button
              data-search-button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`transition-colors ${
                isScrolled ? "text-white" : "text-primary"
              }`}
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>

          {/* Logo - Mobile Center */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10">
            <Link href="/" className="flex-shrink-0">
              <motion.div whileHover={{ scale: 1.02 }} className="relative">
                <Image
                  src="/images/logo/logo.png"
                  alt="Horse Gallery Logo"
                  width={100}
                  height={100}
                  className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 object-contain"
                  priority
                />
              </motion.div>
            </Link>
          </div>

          {/* Right Section - Cart + Profile */}
          <div className="flex items-center gap-3 xs:gap-4 sm:gap-5 flex-shrink-0 z-10 justify-end">
            {/* فقط دکمه ورود برای کاربران لاگین نشده */}
            {isMounted && !isLoggedIn() && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`text-xs sm:text-sm font-medium tracking-wide transition-colors hover:opacity-70 whitespace-nowrap ${
                  isScrolled ? "text-white" : "text-primary"
                }`}
              >
                {t("auth.label")}
              </button>
            )}

            {/* Cart Button - Mobile */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCart}
              className={`transition-colors xl:hidden ${
                isScrolled ? "text-white" : "text-primary"
              }`}
              aria-label={t("cart")}
            >
              <ShoppingBag className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* User Name - Mobile */}
            {isMounted && isLoggedIn() && userInfo && (
              <div className="relative xl:hidden" ref={userMenuRefMobile}>
                <button
                  data-user-menu-button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap truncate transition-colors hover:opacity-70 flex items-center gap-1 max-w-[100px] xs:max-w-[120px] sm:max-w-[150px] ${
                    isScrolled ? "text-white" : "text-primary"
                  }`}
                >
                  <User className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 flex-shrink-0" />
                  {userInfo.firstName && userInfo.lastName
                    ? `${userInfo.firstName} ${userInfo.lastName}`
                    : userInfo.phoneNumber
                    ? convertEnglishToPersian(userInfo.phoneNumber)
                    : ""}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform flex-shrink-0 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User Dropdown Menu - Mobile */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-w-[calc(100vw-2rem)]"
                    >
                      <div className="p-4 space-y-3">
                        {/* User Info */}
                        <div className="pb-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">
                            {userInfo.firstName && userInfo.lastName
                              ? `${userInfo.firstName} ${userInfo.lastName}`
                              : "کاربر"}
                          </p>
                          {dashboardInfo && (
                            <p className="text-xs text-gray-500 mt-1">
                              {convertEnglishToPersian(
                                dashboardInfo.phoneNumber
                              )}
                            </p>
                          )}
                        </div>

                        {/* Dashboard Info */}
                        {isLoadingDashboard ? (
                          <div className="py-4 text-center text-sm text-gray-500">
                            در حال بارگذاری...
                          </div>
                        ) : dashboardInfo ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                کیف پول:
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {convertEnglishToPersian(
                                  dashboardInfo.walletBalance.toLocaleString()
                                )}{" "}
                                تومان
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                تعداد سفارش‌ها:
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {convertEnglishToPersian(
                                  dashboardInfo.ordersCount.toString()
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">
                                تعداد آدرس‌ها:
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {convertEnglishToPersian(
                                  dashboardInfo.addressesCount.toString()
                                )}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="w-full mt-4 py-2 px-4 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-colors"
                        >
                          خروج از حساب کاربری
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Main Navigation with Everything */}
      <div className="hidden xl:block border-t border-primary/10">
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex items-center justify-between h-16 gap-6 relative">
            {/* Left Section - Logo + User Name */}
            <div
              className="flex items-center gap-3 flex-shrink-0"
              onMouseEnter={() => setIsNavHovered(true)}
              onMouseLeave={() => setIsNavHovered(false)}
            >
              <Link href="/" className="flex-shrink-0">
                <motion.div whileHover={{ scale: 1.05 }} className="relative">
                  <Image
                    src="/images/logo/logo.png"
                    alt="Horse Gallery Logo"
                    width={100}
                    height={100}
                    className="w-20 h-20 lg:w-24 lg:h-24 object-contain"
                    priority
                  />
                </motion.div>
              </Link>

              {/* User Name - Desktop */}
              {isMounted && isLoggedIn() && userInfo && (
                <div className="flex items-center gap-3">
                  <div
                    className="relative hidden xl:block"
                    ref={userMenuRefDesktop}
                  >
                    <button
                      data-user-menu-button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`text-sm font-medium tracking-wide whitespace-nowrap transition-colors hover:opacity-70 flex items-center gap-1.5 ${
                        isScrolled || isNavHovered
                          ? "text-white"
                          : "text-primary"
                      }`}
                    >
                      <User className="w-5 h-5 flex-shrink-0" />
                      {userInfo.firstName && userInfo.lastName
                        ? `${userInfo.firstName} ${userInfo.lastName}`
                        : userInfo.phoneNumber
                        ? convertEnglishToPersian(userInfo.phoneNumber)
                        : ""}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isUserMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-w-[calc(100vw-2rem)]"
                        >
                          <div className="p-4 space-y-3">
                            {/* User Info */}
                            <div className="pb-3 border-b border-gray-200">
                              <p className="text-sm font-semibold text-gray-900">
                                {userInfo.firstName && userInfo.lastName
                                  ? `${userInfo.firstName} ${userInfo.lastName}`
                                  : "کاربر"}
                              </p>
                              {dashboardInfo && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {convertEnglishToPersian(
                                    dashboardInfo.phoneNumber
                                  )}
                                </p>
                              )}
                            </div>

                            {/* Dashboard Info */}
                            {isLoadingDashboard ? (
                              <div className="py-4 text-center text-sm text-gray-500">
                                در حال بارگذاری...
                              </div>
                            ) : dashboardInfo ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">
                                    کیف پول:
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {convertEnglishToPersian(
                                      dashboardInfo.walletBalance.toLocaleString()
                                    )}{" "}
                                    تومان
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">
                                    تعداد سفارش‌ها:
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {convertEnglishToPersian(
                                      dashboardInfo.ordersCount.toString()
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">
                                    تعداد آدرس‌ها:
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {convertEnglishToPersian(
                                      dashboardInfo.addressesCount.toString()
                                    )}
                                  </span>
                                </div>
                              </div>
                            ) : null}

                            {/* Logout Button */}
                            <button
                              onClick={handleLogout}
                              className="w-full mt-4 py-2 px-4 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition-colors"
                            >
                              خروج از حساب کاربری
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Center - Menu Items */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6"
              onMouseEnter={() => setIsNavHovered(true)}
              onMouseLeave={() => setIsNavHovered(false)}
            >
              {menuItems.map((item) =>
                item.id === "shop" ? (
                  <button
                    key={item.id}
                    data-products-button
                    onMouseEnter={() => {
                      setIsProductsMenuOpen(true);
                      setIsCoinGoldMenuOpen(false); // بستن dropdown سکه و شمش
                    }}
                    onClick={() => {
                      setIsProductsMenuOpen(!isProductsMenuOpen);
                      setIsCoinGoldMenuOpen(false); // بستن dropdown سکه و شمش
                    }}
                    className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-all hover:opacity-70 relative group ${
                      isScrolled || isNavHovered ? "text-white" : "text-primary"
                    }`}
                  >
                    {t(`menu.${item.id}`)}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isProductsMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                    <span
                      className={`absolute bottom-[-4px] left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                        isScrolled || isNavHovered ? "bg-white" : "bg-primary"
                      }`}
                    />
                  </button>
                ) : item.id === "coin-gold" ? (
                  <button
                    key={item.id}
                    data-coin-gold-button
                    onMouseEnter={() => {
                      setIsCoinGoldMenuOpen(true);
                      setIsProductsMenuOpen(false); // بستن dropdown فروشگاه
                    }}
                    onClick={() => {
                      setIsCoinGoldMenuOpen(!isCoinGoldMenuOpen);
                      setIsProductsMenuOpen(false); // بستن dropdown فروشگاه
                    }}
                    className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-all hover:opacity-70 relative group ${
                      isScrolled || isNavHovered ? "text-white" : "text-primary"
                    }`}
                  >
                    {t(`menu.${item.id}`)}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isCoinGoldMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                    <span
                      className={`absolute bottom-[-4px] left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                        isScrolled || isNavHovered ? "bg-white" : "bg-primary"
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`text-sm font-medium tracking-wide transition-all hover:opacity-70 relative group ${
                      isScrolled || isNavHovered ? "text-white" : "text-primary"
                    }`}
                  >
                    {t(`menu.${item.id}`)}
                    <span
                      className={`absolute bottom-[-4px] left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full ${
                        isScrolled || isNavHovered ? "bg-white" : "bg-primary"
                      }`}
                    />
                  </Link>
                )
              )}
            </div>

            {/* Right Section - Auth + Icons */}
            <div
              className="flex items-center gap-5 flex-shrink-0"
              onMouseEnter={() => setIsNavHovered(true)}
              onMouseLeave={() => setIsNavHovered(false)}
            >
              {/* Cart Button + Login/Register Button - Desktop (When not logged in) */}
              {isMounted && !isLoggedIn() && (
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openCart}
                    className={`transition-colors ${
                      isScrolled || isNavHovered
                        ? "text-white"
                        : "text-primary"
                    }`}
                    aria-label={t("cart")}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </motion.button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className={`text-sm font-medium tracking-wide transition-colors hover:opacity-70 whitespace-nowrap ${
                      isScrolled || isNavHovered
                        ? "text-white"
                        : "text-primary"
                    }`}
                  >
                    {t("auth.label")}
                  </button>
                </div>
              )}

              {/* Cart Button - Desktop (When logged in) */}
              {isMounted && isLoggedIn() && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openCart}
                  className={`transition-colors ${
                    isScrolled || isNavHovered ? "text-white" : "text-primary"
                  }`}
                  aria-label={t("cart")}
                >
                  <ShoppingBag className="w-5 h-5" />
                </motion.button>
              )}

              {/* Favorites */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`transition-colors ${
                  isScrolled || isNavHovered ? "text-white" : "text-primary"
                }`}
                aria-label={t("favorites")}
              >
                <Heart className="w-5 h-5" />
              </motion.button>

              {/* Search Button */}
              <motion.button
                data-search-button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`transition-colors ${
                  isScrolled || isNavHovered ? "text-white" : "text-primary"
                }`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="xl:hidden bg-primary/95 backdrop-blur-md z-40 border-t border-white/10"
          >
            <div className="flex flex-col px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Menu Items */}
              {menuItems.map((item, index) =>
                item.id === "shop" ? (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => {
                        setIsMobileProductsOpen(!isMobileProductsOpen);
                        setIsMobileCoinGoldOpen(false); // بستن dropdown سکه و شمش
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {t(`menu.${item.id}`)}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isMobileProductsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Mobile Products Submenu */}
                    <AnimatePresence>
                      {isMobileProductsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-1"
                        >
                          <div className="grid grid-cols-3 gap-2 px-2 py-2">
                            {productCategories.map((category) => (
                              <div key={category.id} className="space-y-1">
                                <div className="text-white text-xs font-semibold px-2 py-1.5 text-center bg-white/10 rounded">
                                  {category.title}
                                </div>
                                {category.products.map((product) => (
                                  <Link
                                    key={product.id}
                                    href={product.href}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false);
                                      setIsMobileProductsOpen(false);
                                    }}
                                    className="block py-1.5 px-2 text-xs text-white/80 rounded-lg transition-colors text-center"
                                  >
                                    {product.name}
                                  </Link>
                                ))}
                                <Link
                                  href={`/products/${category.id}`}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsMobileProductsOpen(false);
                                  }}
                                  className="flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium text-white/80 hover:text-white rounded-lg transition-colors"
                                >
                                  <span className="text-center">
                                    مشاهده همه
                                  </span>
                                  <ChevronLeft className="w-3 h-3" />
                                </Link>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : item.id === "coin-gold" ? (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => {
                        setIsMobileCoinGoldOpen(!isMobileCoinGoldOpen);
                        setIsMobileProductsOpen(false); // بستن dropdown فروشگاه
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {t(`menu.${item.id}`)}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isMobileCoinGoldOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Mobile Coin & Gold Submenu */}
                    <AnimatePresence>
                      {isMobileCoinGoldOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-1"
                        >
                          <div className="space-y-1 px-2 py-2">
                            <Link
                              href="/coin"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobileCoinGoldOpen(false);
                              }}
                              className="flex items-center gap-3 py-2 px-4 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <Image
                                  src="/images/products/qadimtamam.png"
                                  alt="سکه"
                                  width={35}
                                  height={35}
                                  className="object-contain"
                                />
                              </div>
                              <span>سکه</span>
                            </Link>
                            <Link
                              href="/melted-gold"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobileCoinGoldOpen(false);
                              }}
                              className="flex items-center gap-3 py-2 px-4 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <Image
                                  src="/images/products/shemsh.png"
                                  alt="شمش طلا"
                                  width={35}
                                  height={35}
                                  className="object-contain"
                                />
                              </div>
                              <span>شمش طلا</span>
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-3 px-4 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors text-center"
                    >
                      {t(`menu.${item.id}`)}
                    </Link>
                  </motion.div>
                )
              )}

              {/* Auth Link / User Name */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                className="pt-2 border-t border-white/10"
              >
                {isMounted && isLoggedIn() && userInfo ? (
                  <div className="flex flex-col gap-2">
                    {/* User Info */}
                    <div className="py-3 px-4 border-b border-white/20">
                      <p className="text-base font-semibold text-white text-center">
                        {userInfo.firstName && userInfo.lastName
                          ? `${userInfo.firstName} ${userInfo.lastName}`
                          : "کاربر"}
                      </p>
                      {dashboardInfo && (
                        <p className="text-xs text-white/70 mt-1 text-center">
                          {convertEnglishToPersian(dashboardInfo.phoneNumber)}
                        </p>
                      )}
                    </div>

                    {/* Dashboard Info */}
                    {isLoadingDashboard ? (
                      <div className="py-2 text-center text-xs text-white/70">
                        در حال بارگذاری...
                      </div>
                    ) : dashboardInfo ? (
                      <div className="space-y-2 px-4 py-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">کیف پول:</span>
                          <span className="text-white font-semibold">
                            {convertEnglishToPersian(
                              dashboardInfo.walletBalance.toLocaleString()
                            )}{" "}
                            تومان
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">تعداد سفارش‌ها:</span>
                          <span className="text-white font-semibold">
                            {convertEnglishToPersian(
                              dashboardInfo.ordersCount.toString()
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">تعداد آدرس‌ها:</span>
                          <span className="text-white font-semibold">
                            {convertEnglishToPersian(
                              dashboardInfo.addressesCount.toString()
                            )}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2 px-4 text-sm font-medium text-white bg-primary hover:opacity-90 rounded-lg transition-colors text-center mt-2"
                    >
                      خروج از حساب کاربری
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full py-3 px-4 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors text-center"
                  >
                    {t("auth.label")}
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay - Covers entire navbar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-primary shadow-lg"
          >
            {/* Top spacer to match navbar top bar */}
            <div className="h-8 sm:h-9 lg:h-10"></div>

            {/* Main search bar */}
            <div className="w-full max-w-[1920px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center gap-4 h-16 xs:h-18 sm:h-20">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-white hover:text-white/70 transition-colors flex-shrink-0"
                  aria-label="بستن جستجو"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Search Box Container */}
                <div className="flex items-center gap-3 flex-1 max-w-2xl">
                  {/* Search Input - Simple line */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="جستجوی محصولات"
                    autoFocus
                    className="flex-1 bg-transparent border-0 border-b-2 border-white/40 px-4 py-2 text-base sm:text-lg text-white placeholder:text-white/50 outline-none focus:border-white transition-colors text-center"
                  />

                  {/* Search Icon Button */}
                  <button
                    onClick={handleSearch}
                    className="text-white hover:text-white/80 transition-colors flex-shrink-0"
                    aria-label="جستجو"
                  >
                    <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Menu Dropdown - Desktop Only */}
      <AnimatePresence>
        {isProductsMenuOpen && (
          <motion.div
            ref={productsMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onMouseLeave={() => setIsProductsMenuOpen(false)}
            className="hidden xl:block overflow-hidden border-t backdrop-blur-md bg-primary/95 border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
              <div className="grid grid-cols-2 gap-8 lg:gap-12">
                {/* Right Side - Categories */}
                <div className="grid grid-cols-3 gap-6">
                  {productCategories.map((category) => (
                    <div key={category.id} className="flex flex-col gap-3">
                      {/* Category Title */}
                      <h3 className="text-lg font-bold text-white border-b border-white/20 pb-2">
                        {category.title}
                      </h3>

                      {/* Products List */}
                      <ul className="space-y-2">
                        {category.products.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={product.href}
                              onClick={() => setIsProductsMenuOpen(false)}
                              className="block py-1.5 px-2 transition-all hover:translate-x-1 text-white/90 hover:bg-white/10 hover:text-white text-sm"
                            >
                              {product.name}
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {/* View All Link */}
                      <Link
                        href={`/products/${category.id}`}
                        onClick={() => setIsProductsMenuOpen(false)}
                        className="inline-flex items-center gap-1 text-sm font-semibold transition-all hover:opacity-70 text-white/90 hover:text-white mt-3"
                      >
                        <span>مشاهده محصولات {category.title}</span>
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Left Side - Large Image */}
                <div className="relative w-full h-full min-h-[400px] overflow-hidden group border border-gray-400 rounded">
                  <Image
                    src="/images/aboutUs/bridal.webp"
                    alt="محصولات فروشگاه"
                    fill
                    sizes="(max-width: 1024px) 50vw, 600px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coin & Gold Menu Dropdown - Desktop Only */}
      <AnimatePresence>
        {isCoinGoldMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onMouseLeave={() => setIsCoinGoldMenuOpen(false)}
            className="hidden xl:block overflow-hidden border-t backdrop-blur-md bg-primary/95 border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-center items-center gap-8">
                {/* سکه */}
                <Link
                  href="/coin"
                  onClick={() => setIsCoinGoldMenuOpen(false)}
                  className="group flex flex-col items-center justify-center gap-3 p-6 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 min-w-[200px] min-h-[180px]"
                >
                  <div className="relative w-20 h-20 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    <Image
                      src="/images/products/qadimtamam.png"
                      alt="سکه طلا"
                      width={70}
                      height={70}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-semibold text-lg">سکه</span>
                  <span className="text-white/70 text-sm text-center">
                    انواع سکه طلا
                  </span>
                </Link>

                {/* طلای آب شده */}
                <Link
                  href="/melted-gold"
                  onClick={() => setIsCoinGoldMenuOpen(false)}
                  className="group flex flex-col items-center justify-center gap-3 p-6 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 min-w-[200px] min-h-[180px]"
                >
                  <div className="relative w-20 h-20 rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                    <Image
                      src="/images/products/shemsh.png"
                      alt="شمش طلا"
                      width={70}
                      height={70}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-semibold text-lg">
                    شمش طلا
                  </span>
                  <span className="text-white/70 text-sm text-center">
                    طلای آب شده
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </motion.nav>
  );
};

export default Navbar;
