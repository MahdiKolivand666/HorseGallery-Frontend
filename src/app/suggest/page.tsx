"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Star,
  TrendingUp,
  MessageCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { getProducts } from "@/lib/api/products";

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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs Section */}
        <div className="mb-8">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {saleProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      type="sale"
                    />
                  ))}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {specialProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      type="special"
                    />
                  ))}
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

        {/* Popular Products Section */}
        {popularProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  محصولات پرفروش
                </h2>
              </div>
            </div>

            {/* Slider */}
            <div className="relative popular-products-swiper">
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
          className="bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 text-white"
        >
          <div className="max-w-3xl mx-auto text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              نیاز به راهنمایی دارید؟
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-8">
              مشاوران ما آماده‌اند تا بهترین پیشنهاد را متناسب با سلیقه و بودجه
              شما ارائه دهند
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
  const productHref = `/${product.category.slug}/${product.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      {/* Badge */}
      <div className="absolute top-2 right-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        پرفروش
      </div>

      <Link href={productHref}>
        <div className="relative aspect-[3/4] overflow-hidden mb-2 border border-gray-300 rounded">
          <Image
            src={productImage}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <Image
            src={productHoverImage}
            alt={product.name}
            fill
            className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        <div className="text-center">
          <h3 className="text-xs font-medium text-gray-800 truncate">
            {product.name}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            {product.price.toLocaleString("fa-IR")} تومان
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

// Product Card Component
const ProductCard = ({
  product,
  type,
}: {
  product: Product;
  type: "sale" | "special" | "popular";
}) => {
  // عکس‌های مختلف برای هر نوع محصول
  const defaultImages = {
    sale: {
      main: "/images/products/product4.webp",
      hover: "/images/products/product4-4.webp",
    },
    special: {
      main: "/images/products/product6.webp",
      hover: "/images/products/product6-6.webp",
    },
    popular: {
      main: "/images/products/product8.webp",
      hover: "/images/products/product8-8.webp",
    },
  };

  const productImage = product.images[0] || defaultImages[type].main;
  const productHoverImage =
    product.images[1] || product.images[0] || defaultImages[type].hover;
  const productHref = `/${product.category.slug}/${product.slug}`;

  // محاسبه قیمت نهایی و درصد تخفیف
  const finalPrice = product.discountPrice || product.price;
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const discountPercent =
    hasDiscount && product.discount
      ? product.discount
      : hasDiscount
      ? Math.round(
          ((product.price - product.discountPrice!) / product.price) * 100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      {/* Badge */}
      {type === "sale" && discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
          {discountPercent}٪ تخفیف
        </div>
      )}
      {type === "special" && (
        <div className="absolute top-3 right-3 z-10 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Star className="w-3 h-3 fill-white" />
          پیشنهاد ویژه (کم اجرت)
        </div>
      )}
      {type === "popular" && (
        <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          پرفروش
        </div>
      )}

      <Link href={productHref}>
        <div className="relative aspect-[3/4] overflow-hidden mb-3 border border-gray-300 rounded">
          <Image
            src={productImage}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <Image
            src={productHoverImage}
            alt={product.name}
            fill
            className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>

          {hasDiscount ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-400 line-through text-sm">
                {product.price.toLocaleString("fa-IR")}
              </span>
              <span className="text-red-600 font-bold text-sm">
                {finalPrice.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              {product.price.toLocaleString("fa-IR")} تومان
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
