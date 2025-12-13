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
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "photoswipe/style.css";
import { useCart } from "@/contexts/CartContext";
import { getProductBySlug, RelatedProduct, GoldInfo } from "@/lib/api/products";
import GoldInfoCard from "@/components/GoldInfoCard";

interface ProductDetail {
  id: string | number;
  slug: string;
  name: string;
  code: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  price: number;
  discountPrice?: number;
  discount?: number; // درصد تخفیف (محاسبه شده توسط backend)
  onSale?: boolean; // آیا محصول تخفیف دارد؟ (محاسبه شده توسط backend)
  lowCommission?: boolean; // آیا محصول اجرت کم دارد؟ (پیشنهاد ویژه)
  commission?: number; // درصد اجرت
  goldPrice: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  deliveryDays: string;
  images: string[];
  specifications: {
    weight: string;
    karat: string;
    material: string;
    brand: string;
    dimensions: string;
    warranty: string;
    purity?: string; // ✨ خلوص - برای سکه و شمش
    mintYear?: number; // ✨ سال ضرب - فقط برای سکه
  };
  description: string;
  features: string[];
  sizes: string[];
  relatedProducts: RelatedProduct[];
  // ✨ فیلدهای جدید برای سکه و شمش
  productType?: "jewelry" | "coin" | "melted_gold";
  goldInfo?: GoldInfo;
}

const ProductDetailPage = () => {
  const params = useParams();
  const category = params.category as string;
  const slug = params.slug as string;

  const [productData, setProductData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeRelatedProduct, setActiveRelatedProduct] = useState<
    string | null
  >(null);
  const { addToCart } = useCart();

  // Fetch product data from API
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const product = await getProductBySlug(slug);

        if (isMounted && product) {
          // ✨ برای سکه و شمش از تصاویر اختصاصی استفاده کن
          const productImages =
            product.productType === "coin"
              ? ["/images/products/coinphoto.webp"]
              : product.productType === "melted_gold"
              ? ["/images/products/goldbarphoto.webp"]
              : product.images || ["/images/products/coinphoto.webp"];

          setProductData({
            id: product._id,
            slug: product.slug,
            name: product.name,
            code: product.code || "N/A",
            category: product.category?.name || "عمومی",
            categorySlug: product.category?.slug || category,
            subcategory: product.subcategory?.name,
            subcategorySlug: product.subcategory?.slug,
            price: product.price,
            discountPrice: product.discountPrice,
            discount: product.discount, // درصد تخفیف از backend
            onSale: product.onSale, // آیا تخفیف داره؟
            lowCommission: product.lowCommission, // آیا کم اجرت داره؟ (پیشنهاد ویژه)
            commission: product.commission, // درصد اجرت
            goldPrice: 2500000, // This should come from API
            rating: product.rating || 0,
            reviewsCount: product.reviewsCount || 0,
            stock: product.stock || 0,
            deliveryDays: "2-3",
            images: productImages,
            specifications: {
              // ✨ وزن:
              // - برای سکه: از goldInfo.weight (عددی به گرم) استفاده کن
              // - در غیر این صورت: از فیلد weight در root یا specifications
              weight:
                product.productType === "coin" && product.goldInfo?.weight
                  ? `${product.goldInfo.weight} گرم`
                  : product.weight ?? product.specifications?.weight ?? "N/A",
              karat: product.specifications?.karat ?? "N/A",
              // ✨ جنس: اول از material در root استفاده کن، بعد specifications
              material:
                product.material ?? product.specifications?.material ?? "N/A",
              brand: product.specifications?.brand ?? "گالری اسب",
              dimensions: product.specifications?.dimensions ?? "N/A",
              warranty: product.specifications?.warranty ?? "گارانتی اصالت",
              // ✨ خلوص و سال ضرب برای سکه و شمش
              purity: product.goldInfo?.purity,
              mintYear: product.goldInfo?.mintYear,
            },
            description: product.description || "",
            features: [
              "طلای 18 عیار با گارانتی اصالت",
              "طراحی منحصر به فرد و دست‌ساز",
              "قابلیت تنظیم طول زنجیر",
              "بسته‌بندی لوکس و مناسب هدیه",
            ],
            sizes: ["40 سانتی‌متر", "45 سانتی‌متر", "50 سانتی‌متر"],
            relatedProducts: product.relatedProducts || [],
            // ✨ فیلدهای جدید برای سکه و شمش
            productType: product.productType,
            goldInfo: product.goldInfo,
          });
          setSelectedSize("45 سانتی‌متر");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug, category]);

  // Open PhotoSwipe Gallery
  const openGallery = (startIndex: number = 0) => {
    const items =
      productData?.images.map((img) => ({
        src: img,
        width: 1200,
        height: 1200,
      })) || [];

    if (items.length === 0) return;

    import("photoswipe").then((PhotoSwipeModule) => {
      const PhotoSwipe = PhotoSwipeModule.default;
      const pswp = new PhotoSwipe({
        dataSource: items,
        index: startIndex,

        bgOpacity: 0.95,
        loop: true,
        pinchToClose: true,
        closeOnVerticalDrag: true,
        escKey: true,
        arrowKeys: true,
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
      });
      pswp.init();
    });
  };

  const handleAddToCart = async () => {
    if (!productData) return;

    try {
      const productId =
        typeof productData.id === "string"
          ? productData.id
          : String(productData.id);

      // برای سکه size نداریم، برای بقیه selectedSize
      const size =
        productData.productType === "coin" ? undefined : selectedSize;

      await addToCart(productId, 1, size);
    } catch (error) {
      console.error("Error adding to cart:", error);
      // می‌توانید یک toast یا alert نمایش دهید
      alert("خطا در افزودن محصول به سبد خرید");
    }
  };

  const handleNextImage = () => {
    if (productData) {
      setSelectedImage((prev) => (prev + 1) % productData.images.length);
    }
  };

  const handlePrevImage = () => {
    if (productData) {
      setSelectedImage(
        (prev) =>
          (prev - 1 + productData.images.length) % productData.images.length
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 sm:pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری جزئیات محصول...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-white pt-24 sm:pt-28 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">محصول مورد نظر یافت نشد.</p>
          <Link
            href="/"
            className="text-primary hover:text-primary/80 underline"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    );
  }

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

            {/* برای سکه و شمش */}
            {(productData.productType === "coin" ||
              productData.productType === "melted_gold") && (
              <>
                <Link
                  href={
                    productData.productType === "coin"
                      ? "/coin"
                      : "/melted-gold"
                  }
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {productData.productType === "coin" ? "سکه طلا" : "شمش طلا"}
                </Link>
              </>
            )}

            {/* برای جواهرات */}
            {productData.productType !== "coin" &&
              productData.productType !== "melted_gold" && (
                <>
                  <Link
                    href={`/products/${productData.categorySlug}`}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {productData.category}
                  </Link>

                  {productData.subcategory && productData.subcategorySlug && (
                    <>
                      <ChevronLeft className="w-4 h-4 text-primary" />
                      <Link
                        href={`/products/${productData.categorySlug}/${productData.subcategorySlug}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        {productData.subcategory}
                      </Link>
                    </>
                  )}
                </>
              )}

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
              {/* Main Image Display */}
              <div className="relative aspect-square mb-4 group">
                {/* Badges */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                  {/* Discount Badge - اولویت اول */}
                  {productData.discount && productData.discount > 0 && (
                    <div className="bg-red-500 text-white px-4 py-2 rounded text-sm font-bold">
                      {productData.discount}٪ تخفیف
                    </div>
                  )}

                  {/* Low Commission Badge - پیشنهاد ویژه (کم اجرت) */}
                  {productData.lowCommission && (
                    <div className="bg-green-800 text-white px-2 py-1 rounded text-xs font-bold">
                      کم اجرت
                    </div>
                  )}
                </div>

                {/* Current Image Display */}
                <div className="relative aspect-square">
                  <Image
                    src={productData.images[selectedImage]}
                    alt={`${productData.name} - تصویر ${selectedImage + 1}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-4 left-4 p-2 bg-white/80 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </div>

                {/* Click Overlay to Open Gallery */}
                <div
                  className="absolute inset-0 cursor-zoom-in z-10"
                  onClick={() => openGallery(selectedImage)}
                />

                {/* Navigation Buttons - فقط برای جواهرات */}
                {productData.productType !== "coin" &&
                  productData.productType !== "melted_gold" && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 border border-gray-300 rounded transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                        aria-label="تصویر قبلی"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 border border-gray-300 rounded transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                        aria-label="تصویر بعدی"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
              </div>

              {/* Thumbnails - فقط برای جواهرات */}
              {productData.productType !== "coin" &&
                productData.productType !== "melted_gold" && (
                  <div className="grid grid-cols-5 gap-2">
                    {productData.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(index);
                          openGallery(index);
                        }}
                        className={`relative aspect-square border transition-all cursor-pointer rounded overflow-hidden ${
                          selectedImage === index
                            ? "opacity-100 border-primary border-2"
                            : "opacity-70 hover:opacity-100 border-gray-300 hover:border-primary/50"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${productData.name} - تصویر ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 20vw, 80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
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

              {/* Size Selection – فقط برای جواهرات، نه سکه */}
              {productData.productType !== "coin" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">
                      سایزهای موجود:
                    </span>
                    <Link
                      href="#"
                      className="text-xs text-primary hover:text-primary/80 transition-colors border border-primary rounded px-3 py-1.5"
                    >
                      راهنمای انتخاب سایز
                    </Link>
                  </div>
                  <div className="flex gap-2 justify-start">
                    {productData.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-sm border rounded transition-colors ${
                          selectedSize === size
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Specifications */}
              <div className="mb-4 space-y-2 text-sm">
                {/* نوع سکه (denomination) - فقط برای سکه */}
                {productData.productType === "coin" &&
                  productData.goldInfo?.denomination && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-900 font-medium whitespace-nowrap">
                        نوع
                      </span>
                      <div className="flex-1 border-b border-dotted border-gray-300" />
                      <span className="text-gray-700 whitespace-nowrap">
                        {productData.goldInfo.denomination}
                      </span>
                    </div>
                  )}

                {/* وزن – همیشه نمایش داده می‌شود */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    وزن
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300" />
                  <span className="text-gray-700 whitespace-nowrap">
                    {productData.specifications.weight}
                  </span>
                </div>

                {/* جنس – همیشه نمایش داده می‌شود */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    جنس
                  </span>
                  <div className="flex-1 border-b border-dotted border-gray-300" />
                  <span className="text-gray-700 whitespace-nowrap">
                    {productData.specifications.material}
                  </span>
                </div>

                {/* خلوص و سال ضرب - فقط برای سکه */}
                {productData.productType === "coin" && (
                  <>
                    {productData.specifications.purity && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-900 font-medium whitespace-nowrap">
                          خلوص
                        </span>
                        <div className="flex-1 border-b border-dotted border-gray-300" />
                        <span className="text-gray-700 whitespace-nowrap">
                          {productData.specifications.purity}
                        </span>
                      </div>
                    )}
                    {productData.specifications.mintYear && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-900 font-medium whitespace-nowrap">
                          سال ضرب
                        </span>
                        <div className="flex-1 border-b border-dotted border-gray-300" />
                        <span className="text-gray-700 whitespace-nowrap">
                          {productData.specifications.mintYear}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* برای جواهرات: اجرت، نوع پوشش، مناسب برای، قیمت روز طلا */}
                {productData.productType !== "coin" && (
                  <>
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
                  </>
                )}
              </div>

              {/* Price */}
              <div className="bg-primary/5 border border-gray-300 rounded p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col gap-2 flex-1">
                    {productData.onSale &&
                    productData.discount &&
                    productData.discount > 0 ? (
                      <>
                        {/* Badge تخفیف - بالای قیمت */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            {productData.discount}٪ تخفیف
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-gray-600">
                            قیمت اصلی:
                          </span>
                          <span className="text-lg text-gray-400 line-through">
                            {productData.price.toLocaleString("fa-IR")} تومان
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-gray-600">
                            قیمت با تخفیف:
                          </span>
                          <span className="text-2xl font-bold text-red-600">
                            {productData.discountPrice?.toLocaleString(
                              "fa-IR"
                            ) || productData.price.toLocaleString("fa-IR")}{" "}
                            تومان
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600">قیمت:</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {productData.price.toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                    )}
                  </div>
                  {/* نحوه محاسبه قیمت – فقط برای جواهرات */}
                  {productData.productType !== "coin" && (
                    <Link
                      href="#"
                      className="text-xs text-primary hover:text-primary/80 transition-colors border border-primary rounded px-3 py-1.5 whitespace-nowrap self-start sm:self-center"
                    >
                      نحوه محاسبه قیمت
                    </Link>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-12 h-12 flex items-center justify-center border border-gray-300 rounded transition-colors ${
                    isFavorite ? "bg-red-50" : "bg-white hover:bg-gray-50"
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded transition-colors flex items-center justify-center gap-2"
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
                    className="text-sm text-gray-600 hover:text-primary hover:border-primary transition-colors text-center border border-gray-300 rounded px-3 py-2"
                  >
                    راهنمای خرید
                  </Link>
                  <Link
                    href="/auth/guide"
                    className="text-sm text-gray-600 hover:text-primary hover:border-primary transition-colors text-center border border-gray-300 rounded px-3 py-2"
                  >
                    راهنمای ارسال
                  </Link>
                  <Link
                    href="/faq"
                    className="text-sm text-gray-600 hover:text-primary hover:border-primary transition-colors text-center border border-gray-300 rounded px-3 py-2"
                  >
                    سوالات متداول
                  </Link>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 hover:text-primary hover:border-primary transition-colors text-center border border-gray-300 rounded px-3 py-2"
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
              <div className="hidden lg:flex flex-col items-center text-center">
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
              <div className="hidden lg:flex flex-col items-center text-center">
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

          {/* ✨ Gold Info Card - فقط برای شمش (سکه در specifications نمایش داده می‌شود) */}
          {productData.goldInfo &&
            productData.productType === "melted_gold" && (
              <GoldInfoCard
                goldInfo={productData.goldInfo}
                productType="melted_gold"
              />
            )}
        </div>

        {/* Related Products */}
        {productData.relatedProducts &&
          productData.relatedProducts.length > 0 && (
            <div className="mt-8 py-8">
              <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    type: "spring" as const,
                    stiffness: 150,
                    damping: 20,
                  }}
                  className="flex items-center justify-between py-8 sm:py-5"
                >
                  <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
                    {productData.productType === "coin"
                      ? "سکه‌های مشابه"
                      : productData.productType === "melted_gold"
                      ? "شمش‌های مشابه"
                      : "محصولات مرتبط"}
                  </h2>
                </motion.div>

                {/* Products Slider */}
                <div className="relative related-products-swiper">
                  <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={1}
                    navigation={{
                      nextEl: ".related-swiper-button-next-custom",
                      prevEl: ".related-swiper-button-prev-custom",
                    }}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    breakpoints={{
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 24,
                      },
                    }}
                    className="!pb-4"
                  >
                    {productData.relatedProducts.map((product) => {
                      const isActive = activeRelatedProduct === product._id;
                      // ✨ انتخاب عکس بر اساس productType
                      // برای سکه همیشه از coinphoto.webp استفاده کن (مثل جزئیات محصول)
                      const getProductImage = () => {
                        // برای سکه همیشه از عکس ثابت استفاده کن
                        if (product.productType === "coin") {
                          return "/images/products/coinphoto.webp";
                        }
                        // برای شمش همیشه از عکس ثابت استفاده کن
                        if (product.productType === "melted_gold") {
                          return "/images/products/goldbarphoto.webp";
                        }
                        // برای جواهرات از images استفاده کن
                        if (product.images && product.images.length > 0) {
                          return product.images[0];
                        }
                        // پیش‌فرض برای jewelry
                        return "/images/products/product1.webp";
                      };
                      const getProductHoverImage = () => {
                        // برای سکه و شمش همان عکس اصلی (hover ندارند)
                        if (
                          product.productType === "coin" ||
                          product.productType === "melted_gold"
                        ) {
                          return getProductImage();
                        }
                        // برای جواهرات اگر images وجود دارد و بیش از یک عکس داره، از دومی استفاده کن
                        if (product.images && product.images.length > 1) {
                          return product.images[1];
                        }
                        // در غیر این صورت همان عکس اصلی
                        return getProductImage();
                      };
                      const productImage = getProductImage();
                      const productHoverImage = getProductHoverImage();
                      // ✨ category slug بر اساس productType
                      const categorySlug =
                        product.productType === "coin"
                          ? "coin"
                          : product.productType === "melted_gold"
                          ? "melted-gold"
                          : productData.categorySlug;
                      const productHref = `/${categorySlug}/${product.slug}`;

                      return (
                        <SwiperSlide key={product._id}>
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
                            <Link href={productHref}>
                              <div
                                className="relative"
                                onMouseEnter={() =>
                                  setActiveRelatedProduct(product._id)
                                }
                                onMouseLeave={() =>
                                  setActiveRelatedProduct(null)
                                }
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
                                  <div className="relative overflow-hidden w-full border border-gray-300 rounded aspect-square">
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
                                          src={productImage}
                                          alt={product.name}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
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
                                          src={productHoverImage}
                                          alt={product.name}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
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
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <button
                    className="related-swiper-button-prev-custom absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </button>
                  <button
                    className="related-swiper-button-next-custom absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
