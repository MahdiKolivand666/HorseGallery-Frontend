"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  category: {
    slug: string;
  };
}

interface Props {
  products: Product[];
}

const GiftSection = ({ products: apiProducts }: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
  const [activeProduct, setActiveProduct] = useState<string | null>(null);

  // محدود به 12 محصول
  const products =
    !apiProducts || apiProducts.length === 0 ? [] : apiProducts.slice(0, 12);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const windowHeight = window.innerHeight;

      // Check if section is in viewport
      if (sectionTop <= 0 && sectionBottom > windowHeight) {
        // Section is being scrolled through - fix the image (RIGHT side in RTL)
        setImageStyle({
          position: "fixed",
          top: 0,
          right: 0,
          width: "50%",
          height: "100vh",
        });
      } else if (sectionBottom <= windowHeight) {
        // Section is scrolled past - position at bottom
        setImageStyle({
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "50%",
          height: "100vh",
        });
      } else {
        // Section hasn't reached top yet - position at top
        setImageStyle({
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100vh",
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // اگر محصولی نبود، چیزی نشون نده
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white relative lg:min-h-[100vh]"
    >
      <div className="w-full">
        <div className="flex flex-col lg:flex-row relative">
          {/* Right Side - Large Sticky Image (Desktop) */}
          <div className="hidden lg:block lg:w-1/2 lg:order-1">
            <div style={imageStyle} className="z-0">
              <div className="relative w-full h-full">
                <Image
                  src="/images/categories/categories1.webp"
                  alt="Gift Collection"
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
                {/* Optional Overlay */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/40" />

                {/* View More Button on Image */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 gap-5">
                  <h3 className="text-white text-xl lg:text-2xl font-normal">
                    هدایای پیشنهادی
                  </h3>
                  <Link
                    href="/products/women"
                    className="inline-flex items-center px-12 py-4 bg-transparent border border-white text-white font-medium hover:bg-white hover:text-primary transition-all duration-300 text-base"
                  >
                    <span>سایر محصولات</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Left Side - Products Grid (Scrollable) */}
          <div className="w-full lg:w-1/2 px-2 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-16 pb-2 sm:pb-4 lg:pb-16 relative z-10 lg:order-2">
            <div className="max-w-3xl mx-auto">
              {/* Large Image for Mobile/Tablet (Above Products) */}
              <div className="lg:hidden mb-6 sm:mb-8">
                <div className="relative w-full h-64 sm:h-80 overflow-hidden border border-gray-300 rounded">
                  <Image
                    src="/images/categories/categories1.webp"
                    alt="Gift Collection"
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                  {/* Optional Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* View More Button on Image */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 gap-4">
                    <h3 className="text-white text-lg sm:text-xl font-normal">
                      هدایای پیشنهادی
                    </h3>
                    <Link
                      href="/products/women"
                      className="inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 bg-transparent border border-white text-white font-medium hover:bg-white hover:text-primary transition-all duration-300"
                    >
                      <span className="text-sm sm:text-base">سایر محصولات</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mobile Slider */}
              <div className="block lg:hidden relative gift-products-swiper mb-6">
                <Swiper
                  modules={[Navigation, Autoplay]}
                  spaceBetween={12}
                  slidesPerView={2}
                  navigation={{
                    nextEl: ".gift-swiper-button-next-custom",
                    prevEl: ".gift-swiper-button-prev-custom",
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  className="!pb-4"
                >
                  {products.map((product) => {
                    const isActive = activeProduct === product._id;
                    const productImage =
                      product.images[0] || "/images/products/product1.webp";
                    const productHoverImage =
                      product.images[1] ||
                      product.images[0] ||
                      "/images/products/product1-1.webp";
                    const productHref = `/${product.category.slug}/${product.slug}`;

                    return (
                      <SwiperSlide key={product._id}>
                        <motion.div
                          initial={{ opacity: 0, y: 40, scale: 0.95 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                            mass: 0.8,
                          }}
                          className="relative"
                        >
                          <Link href={productHref}>
                            <div
                              className="relative"
                              onMouseEnter={() => setActiveProduct(product._id)}
                              onMouseLeave={() => setActiveProduct(null)}
                            >
                              <motion.div
                                whileHover={{ scale: 1.05, y: -8 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20,
                                }}
                                className="relative overflow-visible cursor-pointer w-full"
                              >
                                <div className="relative overflow-hidden w-full aspect-square border border-gray-300 rounded">
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
                                        sizes="(max-width: 640px) 45vw, 303px"
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
                                        sizes="(max-width: 640px) 45vw, 303px"
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
                  className="gift-swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </button>
                <button
                  className="gift-swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </button>
              </div>

              {/* Desktop Grid - 2 columns */}
              <div className="hidden lg:grid lg:grid-cols-2 gap-6 mb-6">
                {products.map((product) => {
                  const isActive = activeProduct === product._id;
                  const productImage =
                    product.images[0] || "/images/products/product1.webp";
                  const productHoverImage =
                    product.images[1] ||
                    product.images[0] ||
                    "/images/products/product1-1.webp";
                  const productHref = `/${product.category.slug}/${product.slug}`;

                  return (
                    <Link
                      key={product._id}
                      href={productHref}
                      className="group"
                    >
                      <div
                        className="relative"
                        onMouseEnter={() => setActiveProduct(product._id)}
                        onMouseLeave={() => setActiveProduct(null)}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05, y: -8 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="relative overflow-visible cursor-pointer w-full"
                        >
                          <div className="relative overflow-hidden w-full aspect-square border border-gray-300 rounded">
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
                                  sizes="(max-width: 1024px) 40vw, 303px"
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
                                  sizes="(max-width: 1024px) 40vw, 303px"
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftSection;
