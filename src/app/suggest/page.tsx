"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Star,
  MessageCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { getProducts } from "@/lib/api/products";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import FilterDrawer from "@/components/shop/FilterDrawer";
import { SlidersHorizontal } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  slug: string;
  category: {
    slug: string;
  };
  onSale?: boolean;
  discount?: number;
  lowCommission?: boolean;
  salesCount?: number;
  viewsCount?: number;
}

export default function SuggestPage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [specialProducts, setSpecialProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sale" | "special">("sale");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filter positioning (like GiftSection)
  const sectionRef = useRef<HTMLDivElement>(null);
  const [filterStyle, setFilterStyle] = useState<React.CSSProperties>({});
  const navbarHeight = 105;

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const windowHeight = window.innerHeight;

      if (sectionTop <= navbarHeight && sectionBottom > windowHeight) {
        // Section is being scrolled through - fix the filter
        setFilterStyle({
          position: "fixed",
          top: navbarHeight,
          right: 0,
        });
      } else if (sectionBottom <= windowHeight) {
        // Section is scrolled past - position at bottom
        setFilterStyle({
          position: "absolute",
          bottom: 0,
          right: 0,
        });
      } else {
        // Section hasn't reached top yet - position at top
        setFilterStyle({
          position: "absolute",
          top: 0,
          right: 0,
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // محصولات تخفیف‌دار
        const sale = await getProducts({ onSale: true, limit: 12 });
        setSaleProducts(sale);

        // محصولات با اجرت کم
        const special = await getProducts({ lowCommission: true, limit: 12 });
        setSpecialProducts(special);

        // محصولات پرفروش
        const popular = await getProducts({ sortBy: "popular", limit: 8 });
        setPopularProducts(popular);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری پیشنهادات ویژه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] sm:pt-[105px] lg:pt-[105px]">
      {/* Hero Section */}
      <div className="relative w-full h-80 sm:h-96 lg:h-[28rem]">
        <Image
          src="/images/aboutUs/bridal.webp"
          alt="پیشنهادات ویژه"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-center p-6 sm:p-8 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-wide">
              پیشنهادات ویژه
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              بهترین محصولات با تخفیف‌های استثنایی و اجرت کم
            </p>
          </motion.div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">پیشنهادات ویژه</span>
          </nav>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="relative">
        <main className="pb-6 lg:pb-8">
          {/* Filter Section (Tabs + Products Grid with Sidebar) */}
          <div ref={sectionRef} className="relative min-h-[calc(100vh-105px)]">
            {/* Filter Button - Mobile/Tablet */}
            <div className="lg:hidden flex items-center justify-end my-6 px-4 sm:px-6">
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm">فیلترها</span>
              </button>
            </div>

            {/* Filter Sidebar - Desktop Only */}
            <aside
              className="hidden lg:block w-80 h-[calc(100vh-105px)] z-40"
              style={filterStyle}
            >
              <FilterSidebar />
            </aside>

            {/* Content Area with Margin for Filter */}
            <div className="px-4 sm:px-6 lg:mr-80">
              {/* Tabs Section */}
              <div className="mt-4 mb-8">
                <div className="flex gap-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("sale")}
                    className={`pb-4 px-6 font-semibold transition-colors relative ${
                      activeTab === "sale"
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      محصولات تخفیف‌دار
                      {saleProducts.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {saleProducts.length}
                        </span>
                      )}
                    </span>
                    {activeTab === "sale" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("special")}
                    className={`pb-4 px-6 font-semibold transition-colors relative ${
                      activeTab === "special"
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      پیشنهادات ویژه ما (کم اجرت)
                      {specialProducts.length > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                          {specialProducts.length}
                        </span>
                      )}
                    </span>
                    {activeTab === "special" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <AnimatePresence mode="wait">
                {activeTab === "sale" && (
                  <motion.div
                    key="sale"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {saleProducts.length > 0 ? (
                      <div className="mb-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex flex-wrap gap-6 justify-center">
                            {saleProducts.map((product) => {
                              const productImage =
                                product.images[0] ||
                                "/images/products/product4.webp";
                              const productHoverImage =
                                product.images[1] ||
                                product.images[0] ||
                                "/images/products/product4-4.webp";
                              const finalPrice =
                                product.discountPrice || product.price;
                              const priceText =
                                product.discountPrice &&
                                product.discountPrice < product.price
                                  ? `${finalPrice.toLocaleString(
                                      "fa-IR"
                                    )} تومان`
                                  : `${product.price.toLocaleString(
                                      "fa-IR"
                                    )} تومان`;

                              return (
                                <ProductCard
                                  key={product._id}
                                  product={{
                                    name: product.name,
                                    price: priceText,
                                    image: productImage,
                                    hoverImage: productHoverImage,
                                    slug: product.slug,
                                  }}
                                  category={product.category.slug}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                          در حال حاضر محصولی با تخفیف وجود ندارد.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "special" && (
                  <motion.div
                    key="special"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {specialProducts.length > 0 ? (
                      <div className="mb-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="flex flex-wrap gap-6 justify-center">
                            {specialProducts.map((product) => {
                              const productImage =
                                product.images[0] ||
                                "/images/products/product6.webp";
                              const productHoverImage =
                                product.images[1] ||
                                product.images[0] ||
                                "/images/products/product6-6.webp";

                              return (
                                <ProductCard
                                  key={product._id}
                                  product={{
                                    name: product.name,
                                    price: `${product.price.toLocaleString(
                                      "fa-IR"
                                    )} تومان`,
                                    image: productImage,
                                    hoverImage: productHoverImage,
                                    slug: product.slug,
                                  }}
                                  category={product.category.slug}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                          در حال حاضر پیشنهاد ویژه‌ای وجود ندارد.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Popular Products Section */}
          <div className="mt-8">
            {popularProducts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-16"
              >
                <div className="flex items-center justify-between mb-8 px-4 sm:px-6">
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-700">
                    محصولات پرفروش
                  </h2>
                </div>

                {/* Slider */}
                <div className="relative popular-products-swiper px-12 sm:px-16">
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={1}
                    navigation={{
                      nextEl: ".popular-swiper-button-next",
                      prevEl: ".popular-swiper-button-prev",
                    }}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    breakpoints={{
                      640: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                      },
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 24,
                      },
                    }}
                    className="!pb-4"
                  >
                    {popularProducts.map((product) => (
                      <SwiperSlide key={product._id}>
                        <PopularProductCard product={product} />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <button
                    className="popular-swiper-button-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </button>
                  <button
                    className="popular-swiper-button-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </button>
                </div>
              </motion.section>
            )}

            {/* Consultation Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 text-white mx-4 sm:mx-6"
            >
              <div className="max-w-3xl mx-auto text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  نیاز به راهنمایی دارید؟
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-8">
                  مشاوران ما آماده‌اند تا بهترین پیشنهاد را متناسب با سلیقه و
                  بودجه شما ارائه دهند
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/contact"
                    className="w-full sm:w-auto px-8 py-4 bg-white text-primary font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    مشاوره رایگان
                  </Link>
                  <a
                    href="tel:+989123456789"
                    className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    تماس مستقیم
                  </a>
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>

      {/* Filter Drawer - Mobile/Tablet */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      />
    </div>
  );
}

// Popular Product Card Component (for slider)
const PopularProductCard = ({ product }: { product: Product }) => {
  const productImage = product.images[0] || "/images/products/product7.webp";
  const productHoverImage =
    product.images[1] ||
    product.images[0] ||
    "/images/products/product7-7.webp";

  return (
    <ProductCard
      product={{
        name: product.name,
        price: `${product.price.toLocaleString("fa-IR")} تومان`,
        image: productImage,
        hoverImage: productHoverImage,
        slug: product.slug,
      }}
      category={product.category.slug}
    />
  );
};
