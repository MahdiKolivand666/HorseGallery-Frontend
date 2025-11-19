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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("navbar");

  const productCategories = [
    {
      id: "women",
      title: "زنانه",
      image: "/images/categories/categories1.webp",
      products: [
        { id: 1, name: "گردنبند طلا", href: "/products/women/necklace" },
        { id: 2, name: "دستبند طلا", href: "/products/women/bracelet" },
        { id: 3, name: "انگشتر طلا", href: "/products/women/ring" },
        { id: 4, name: "گوشواره طلا", href: "/products/women/earring" },
      ],
    },
    {
      id: "men",
      title: "مردانه",
      image: "/images/categories/categories2.webp",
      products: [
        { id: 1, name: "انگشتر مردانه", href: "/products/men/ring" },
        { id: 2, name: "دستبند مردانه", href: "/products/men/bracelet" },
        { id: 3, name: "گردنبند مردانه", href: "/products/men/necklace" },
        { id: 4, name: "ساعت مردانه", href: "/products/men/watch" },
      ],
    },
    {
      id: "kids",
      title: "کودکانه",
      image: "/images/categories/categories3.jpg",
      products: [
        { id: 1, name: "دستبند کودک", href: "/products/kids/bracelet" },
        { id: 2, name: "گردنبند کودک", href: "/products/kids/necklace" },
        { id: 3, name: "انگشتر کودک", href: "/products/kids/ring" },
        { id: 4, name: "پابند کودک", href: "/products/kids/anklet" },
      ],
    },
  ];

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
    // Close search box when scrolling
    if (isSearchOpen) {
      setIsSearchOpen(false);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    // Check if click is outside search box and not on search button
    const isSearchButton = target.closest("[data-search-button]");
    const isProductsButton = target.closest("[data-products-button]");

    if (
      searchRef.current &&
      !searchRef.current.contains(target) &&
      !isSearchButton
    ) {
      setIsSearchOpen(false);
    }

    if (
      productsMenuRef.current &&
      !productsMenuRef.current.contains(target) &&
      !isProductsButton
    ) {
      setIsProductsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen || isProductsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, isProductsMenuOpen, handleClickOutside]);

  const menuItems = [
    { id: "home", href: "/" },
    { id: "shop", href: "/shop" },
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
        backgroundColor: isScrolled || isNavHovered
          ? "rgba(49, 93, 73, 0.95)"
          : "rgba(49, 93, 73, 0.15)",
        backdropFilter: isScrolled || isNavHovered ? "blur(10px)" : "blur(0px)",
      }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 w-full ${
        isScrolled || isNavHovered ? "border-b border-white/10" : "border-b border-primary/10"
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
            {/* Live Indicator */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />

            {/* Gold Price */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white/90">
                قیمت روز طلا:
              </span>
              <span className="text-sm font-bold text-yellow-400">
                ۲,۴۵۰,۰۰۰ تومان
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Top Bar - Always Visible */}
      <div className="lg:hidden w-full max-w-[1920px] mx-auto px-3 xs:px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 xs:h-18 sm:h-20 relative w-full">
          {/* Logo - Mobile Left */}
          <Link href="/" className="flex-shrink-0 z-10">
            <motion.div whileHover={{ scale: 1.02 }} className="relative">
              <Image
                src="/images/logo/logo.png"
                alt="Horse Gallery Logo"
                width={100}
                height={100}
                className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                priority
              />
            </motion.div>
          </Link>

          {/* Mobile Menu Button - Mobile Center */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className={`absolute left-1/2 -translate-x-1/2 transition-colors z-10 active:opacity-70 ${
              isScrolled ? "text-white" : "text-primary"
            }`}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 xs:w-6 xs:h-6 drop-shadow-md" />
            ) : (
              <Menu className="w-5 h-5 xs:w-6 xs:h-6 drop-shadow-md" />
            )}
          </button>

          {/* Right Section - User Actions */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 flex-shrink-0 z-10 max-w-[30%] justify-end">
            <Link
              href="/auth"
              className={`hidden md:block text-xs sm:text-sm font-medium tracking-wide transition-colors hover:opacity-70 whitespace-nowrap ${
                isScrolled ? "text-white" : "text-primary"
              }`}
              style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}
            >
              {t("auth.label")}
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`transition-colors ${
                isScrolled ? "text-white" : "text-primary"
              }`}
              aria-label={t("favorites")}
            >
              <Heart className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 drop-shadow-md" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`transition-colors ${
                isScrolled ? "text-white" : "text-primary"
              }`}
              aria-label={t("cart")}
            >
              <ShoppingBag className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 drop-shadow-md" />
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
              <Search className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 drop-shadow-md" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Main Navigation with Everything */}
      <div className="hidden lg:block border-t border-primary/10">
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Left Section - Logo + Filter Button */}
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
                    className="w-20 h-20 lg:w-24 lg:h-24 object-contain drop-shadow-lg"
                    priority
                  />
                </motion.div>
              </Link>
            </div>

            {/* Center - Menu Items */}
            <div 
              className="flex items-center gap-6 flex-1 justify-center"
              onMouseEnter={() => setIsNavHovered(true)}
              onMouseLeave={() => setIsNavHovered(false)}
            >
              {menuItems.map((item) =>
                item.id === "shop" ? (
                  <button
                    key={item.id}
                    data-products-button
                    onMouseEnter={() => setIsProductsMenuOpen(true)}
                    onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
                    className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-all hover:opacity-70 relative group ${
                      isScrolled || isNavHovered ? "text-white" : "text-primary"
                    }`}
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
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
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`text-sm font-medium tracking-wide transition-all hover:opacity-70 relative group ${
                      isScrolled || isNavHovered ? "text-white" : "text-primary"
                    }`}
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
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

            {/* Right Section - Search + Auth + Icons */}
            <div 
              className="flex items-center gap-5 flex-shrink-0"
              onMouseEnter={() => setIsNavHovered(true)}
              onMouseLeave={() => setIsNavHovered(false)}
            >
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
                <Search className="w-5 h-5 drop-shadow-md" />
              </motion.button>

              {/* Auth Link */}
              <Link
                href="/auth"
                className={`text-sm font-medium tracking-wide transition-colors hover:opacity-70 whitespace-nowrap ${
                  isScrolled || isNavHovered ? "text-white" : "text-primary"
                }`}
                style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
              >
                {t("auth.label")}
              </Link>

              {/* Favorites */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`transition-colors ${
                  isScrolled || isNavHovered ? "text-white" : "text-primary"
                }`}
                aria-label={t("favorites")}
              >
                <Heart className="w-5 h-5 drop-shadow-md" />
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`transition-colors ${
                  isScrolled || isNavHovered ? "text-white" : "text-primary"
                }`}
                aria-label={t("cart")}
              >
                <ShoppingBag className="w-5 h-5 drop-shadow-md" />
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
            className="lg:hidden bg-primary/95 backdrop-blur-md z-40 border-t border-white/10"
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
                      onClick={() =>
                        setIsMobileProductsOpen(!isMobileProductsOpen)
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                      style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
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
                          <div className="space-y-1 px-2 py-2">
                            {productCategories.map((category) => (
                              <div key={category.id} className="space-y-1">
                                <div className="text-white/60 text-xs font-semibold px-2 py-1">
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
                                    className="block py-2 px-4 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
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
                                  className="block py-2 px-4 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors underline"
                                >
                                  مشاهده همه {category.title}
                                </Link>
                              </div>
                            ))}
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
                      style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
                    >
                      {t(`menu.${item.id}`)}
                    </Link>
                  </motion.div>
                )
              )}

              {/* Auth Link */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                className="pt-2 border-t border-white/10"
              >
                <Link
                  href="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-4 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors text-center"
                  style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)" }}
                >
                  {t("auth.label")}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`overflow-hidden border-t backdrop-blur-md ${
              isScrolled
                ? "bg-primary/95 border-white/10"
                : "bg-primary/10 border-primary/10"
            }`}
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
              <div className="relative">
                <Search
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isScrolled ? "text-white/70" : "text-primary/70"
                  }`}
                />
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  autoFocus
                  className={`w-full pr-12 pl-6 py-4 text-base rounded-xl border-2 outline-none transition-all focus:scale-[1.02] ${
                    isScrolled
                      ? "bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/50"
                      : "bg-white/80 border-primary/30 text-primary placeholder:text-primary/60 focus:bg-white focus:border-primary/50"
                  }`}
                />
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
            className="hidden lg:block overflow-hidden border-t backdrop-blur-md bg-primary/95 border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {productCategories.map((category) => (
                  <div key={category.id} className="flex flex-col gap-4">
                    {/* Category Image */}
                    <div className="relative w-full h-48 overflow-hidden group">
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 right-0 left-0 p-4">
                        <h3 className="text-xl font-bold text-white">
                          {category.title}
                        </h3>
                      </div>
                    </div>

                    {/* Products List */}
                    <ul className="space-y-2">
                      {category.products.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={product.href}
                            onClick={() => setIsProductsMenuOpen(false)}
                            className="block py-2 px-3 rounded-lg transition-all hover:translate-x-1 text-white/90 hover:bg-white/10 hover:text-white text-sm"
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
                      className="inline-block text-sm font-medium transition-all hover:opacity-70 underline text-white/80 hover:text-white"
                    >
                      مشاهده همه {category.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
