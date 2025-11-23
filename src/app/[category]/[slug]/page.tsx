"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  ZoomIn,
} from "lucide-react";
import { motion } from "framer-motion";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { useCart } from "@/contexts/CartContext";

// Mock data - در پروژه واقعی از API دریافت می‌شه
const getProductData = (slug: string, category: string) => {
  // از slug اطلاعات محصول رو استخراج می‌کنیم
  const parts = slug.split("-");
  const id = parts[parts.length - 1];

  return {
    id,
    slug,
    name: "گردنبند طلای کلاسیک",
    code: "GN-001-18K",
    category:
      category === "women"
        ? "زنانه"
        : category === "men"
        ? "مردانه"
        : "کودکانه",
    categorySlug: category,
    subcategory: "گردنبند",
    subcategorySlug: "necklace",
    price: 45000000,
    goldPrice: 2500000,
    rating: 4.5,
    reviewsCount: 128,
    stock: 12,
    deliveryDays: "2-3",
    images: [
      "/images/products/product1.webp",
      "/images/products/product1-1.webp",
      "/images/products/product2.webp",
      "/images/products/product3.webp",
      "/images/products/product4.webp",
    ],
    specifications: {
      weight: "12.5 گرم",
      karat: "18 عیار",
      material: "طلای سرخ",
      brand: "گالری اسب",
      dimensions: "45 سانتی‌متر",
      warranty: "گارانتی اصالت و 18 ماه گارانتی ساخت",
    },
    description: `این گردنبند طلای کلاسیک با طراحی منحصر به فرد و ظریف، یکی از محبوب‌ترین محصولات گالری اسب است. این محصول با استفاده از بهترین مواد اولیه و با دقت بالا ساخته شده است.

طراحی این گردنبند به گونه‌ای است که می‌توانید آن را در مناسبت‌های مختلف به راحتی استفاده کنید. وزن مناسب و کیفیت عالی این محصول باعث شده تا یکی از پرفروش‌ترین محصولات باشد.

گالری اسب با سال‌ها تجربه در زمینه طراحی و ساخت جواهرات، تضمین می‌کند که این محصول کیفیتی عالی دارد و برای مدت طولانی قابل استفاده است.`,
    features: [
      "طلای 18 عیار با گارانتی اصالت",
      "طراحی منحصر به فرد و دست‌ساز",
      "قابلیت تنظیم طول زنجیر",
      "بسته‌بندی لوکس و مناسب هدیه",
    ],
    sizes: ["40 سانتی‌متر", "45 سانتی‌متر", "50 سانتی‌متر"],
    relatedProducts: [
      {
        id: 1,
        name: "گردنبند طلا",
        price: 38000000,
        image: "/images/products/product2.webp",
        hoverImage: "/images/products/product2-2.webp",
        slug: "gold-necklace-002",
      },
      {
        id: 2,
        name: "دستبند طلا",
        price: 42000000,
        image: "/images/products/product3.webp",
        hoverImage: "/images/products/product3-3.webp",
        slug: "gold-bracelet-003",
      },
      {
        id: 3,
        name: "انگشتر طلا",
        price: 35000000,
        image: "/images/products/product4.webp",
        hoverImage: "/images/products/product4-4.webp",
        slug: "gold-ring-004",
      },
      {
        id: 4,
        name: "گوشواره طلا",
        price: 28000000,
        image: "/images/products/product5.webp",
        hoverImage: "/images/products/product5-5.webp",
        slug: "gold-earring-005",
      },
    ],
  };
};

const ProductDetailPage = () => {
  const params = useParams();
  const category = params.category as string;
  const slug = params.slug as string;

  const productData = getProductData(slug, category);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(productData.sizes[1]);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();

  // Initialize PhotoSwipe
  useEffect(() => {
    let lightbox: PhotoSwipeLightbox | null = null;

    if (typeof window !== "undefined") {
      lightbox = new PhotoSwipeLightbox({
        gallery: "#product-gallery",
        children: "a",
        pswpModule: () => import("photoswipe"),
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        bgOpacity: 0.9,
      });

      lightbox.init();
    }

    return () => {
      if (lightbox) {
        lightbox.destroy();
      }
    };
  }, []);

  const handleAddToCart = () => {
    addToCart({
      id: parseInt(productData.id),
      name: productData.name,
      image: productData.images[0],
      price: productData.price,
      quantity: 1,
      code: productData.code,
      weight: productData.specifications.weight,
      size: selectedSize,
      slug: productData.slug,
      category: productData.categorySlug,
      discount: 0,
    });
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productData.images.length);
  };

  const handlePrevImage = () => {
    setSelectedImage(
      (prev) =>
        (prev - 1 + productData.images.length) % productData.images.length
    );
  };

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <Link
              href={`/products/${productData.categorySlug}`}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {productData.category}
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <Link
              href={`/products/${productData.categorySlug}/${productData.subcategorySlug}`}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {productData.subcategory}
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-gray-700">{productData.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery - Right Side */}
          <div className="order-1 h-full">
            <div className="bg-white p-4 h-full">
              {/* Main Image with PhotoSwipe */}
              <div
                className="relative aspect-square mb-4 bg-gray-100 group"
                id="product-gallery"
              >
                {productData.images.map((image, index) => (
                  <a
                    key={index}
                    href={image}
                    data-pswp-width="1200"
                    data-pswp-height="1200"
                    target="_blank"
                    rel="noreferrer"
                    className={`${
                      index === selectedImage ? "block" : "hidden"
                    } relative aspect-square cursor-zoom-in`}
                  >
                    <Image
                      src={image}
                      alt={`${productData.name} - تصویر ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute top-4 left-4 p-2 bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                    </div>
                  </a>
                ))}

                {/* Navigation Buttons */}
                <button
                  onClick={handlePrevImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                  aria-label="تصویر قبلی"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                  aria-label="تصویر بعدی"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-5 gap-2">
                {productData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square transition-colors ${
                      selectedImage === index
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-90"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${productData.name} - تصویر ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info - Left Side */}
          <div className="order-2 h-full">
            <div className="bg-white p-6 h-full flex flex-col">
              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-right">
                {productData.name}
              </h1>

              {/* Product Code */}
              <p className="text-sm text-gray-500 mb-4 text-right">
                کد محصول: {productData.code}
              </p>

              {/* Divider */}
              <div className="h-px bg-gray-200 mb-4" />

              {/* Size Selection */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">
                    سایزهای موجود:
                  </span>
                  <Link
                    href="#"
                    className="text-xs text-primary hover:text-primary/80 transition-colors border border-primary px-3 py-1.5"
                  >
                    راهنمای انتخاب سایز
                  </Link>
                </div>
                <div className="flex gap-2 justify-start">
                  {productData.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm transition-colors ${
                        selectedSize === size
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Specifications */}
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    وزن
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300" />
                  <span className="text-gray-700 whitespace-nowrap">
                    {productData.specifications.weight}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    اجرت
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300" />
                  <span className="text-gray-700 whitespace-nowrap">
                    ۲۵۰,۰۰۰ تومان
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    جنس
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300" />
                  <span className="text-gray-700 whitespace-nowrap">
                    {productData.specifications.material}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    نوع پوشش
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300" />
                  <span className="text-gray-700 whitespace-nowrap">
                    آبکاری طلا
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    مناسب برای
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300" />
                  <span className="text-gray-700 whitespace-nowrap">
                    خانم‌ها
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    قیمت روز طلای 18 عیار
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300" />
                  <span className="text-gray-700 whitespace-nowrap">
                    {productData.goldPrice.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-primary/5 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">قیمت:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {productData.price.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  <Link
                    href="#"
                    className="text-xs text-primary hover:text-primary/80 transition-colors border border-primary px-3 py-1.5"
                  >
                    نحوه محاسبه قیمت
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-12 h-12 flex items-center justify-center transition-colors ${
                    isFavorite ? "bg-red-50" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>افزودن به سبد خرید</span>
                </button>
              </div>

              {/* Help Links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/auth/guide"
                    className="text-sm text-gray-600 hover:text-primary hover:border-primary transition-colors text-center border border-gray-300 px-3 py-2"
                  >
                    راهنمای خرید
                  </Link>
                  <Link
                    href="/auth/guide"
                    className="text-sm text-gray-600 hover:text-primary hover:border-primary transition-colors text-center border border-gray-300 px-3 py-2"
                  >
                    راهنمای ارسال
                  </Link>
                  <Link
                    href="/faq"
                    className="text-sm text-gray-600 hover:text-primary hover:border-primary transition-colors text-center border border-gray-300 px-3 py-2"
                  >
                    سوالات متداول
                  </Link>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 hover:text-primary hover:border-primary transition-colors text-center border border-gray-300 px-3 py-2"
                  >
                    تماس با ما
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <section className="w-full bg-[#faf6f0] py-4 sm:py-5 lg:py-6 px-4 sm:px-6 lg:px-8 mt-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-1.5 sm:mb-2">
                  <Image
                    src="/images/icons/free-shipping.webp"
                    alt="ارسال رایگان"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">
                  ارسال رایگان
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  برای خریدهای بالای 5 میلیون تومان
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-1.5 sm:mb-2">
                  <Image
                    src="/images/icons/guarantee.webp"
                    alt="ضمانت اصالت"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">
                  ضمانت اصالت
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  تضمین اصل بودن کالا
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-1.5 sm:mb-2">
                  <Image
                    src="/images/icons/payment.webp"
                    alt="پرداخت امن"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">
                  پرداخت امن
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  درگاه پرداخت معتبر و امن
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-1.5 sm:mb-2">
                  <Image
                    src="/images/icons/warranty.webp"
                    alt="گارانتی محصولات"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">
                  گارانتی محصولات
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  ضمانت 7 روزه بازگشت کالا
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Description Section */}
        <div className="mt-8 bg-white p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">
            توضیحات
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4 text-right">
            {productData.description.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">
            محصولات مرتبط
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productData.relatedProducts.map((product) => (
              <RelatedProductCard
                key={product.id}
                product={product}
                categorySlug={productData.categorySlug}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Related Product Card Component with hover effect
const RelatedProductCard = ({
  product,
  categorySlug,
}: {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    hoverImage: string;
    slug: string;
  };
  categorySlug: string;
}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        mass: 0.8,
      }}
      className="relative"
    >
      <Link href={`/${categorySlug}/${product.slug}`}>
        <div
          className="relative"
          onClick={(e) => {
            e.preventDefault();
            setIsActive(!isActive);
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: "spring" as const,
              stiffness: 300,
              damping: 20,
            }}
            className="relative overflow-visible cursor-pointer w-full"
          >
            <div className="relative overflow-hidden w-full shadow-md hover:shadow-2xl transition-shadow duration-300">
              <div className="relative aspect-square">
                {/* Default Image */}
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: isActive ? 0 : 1,
                  }}
                  whileHover={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover w-full h-full"
                    />
                  </motion.div>
                </motion.div>

                {/* Hover Image */}
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0,
                  }}
                  whileHover={{
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    className="w-full h-full"
                    initial={{ scale: 0.9 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Image
                      src={product.hoverImage}
                      alt={product.name}
                      fill
                      className="object-cover w-full h-full"
                    />
                  </motion.div>
                </motion.div>

                {/* Gradient Overlay on Hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="mt-2 text-center">
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

export default ProductDetailPage;
