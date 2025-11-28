"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
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

const BestSellingProducts = ({ products }: Props) => {
  const t = useTranslations("home.bestSelling");
  const [activeProduct, setActiveProduct] = useState<string | null>(null);

  // اگر محصولی نبود، چیزی نشون نده
  if (!products || products.length === 0) {
    return null;
  }

  const productsFormatted = products.slice(0, 10);


  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
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
            {t("title")}
          </h2>
          <Link
            href="/products/best-selling"
            className="text-xs sm:text-sm text-primary hover:opacity-70 transition-opacity font-medium"
          >
            {t("viewAll")}
          </Link>
        </motion.div>

        {/* Products Slider */}
        <div className="relative best-selling-swiper">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
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
            {productsFormatted.map((product) => {
              const isActive = activeProduct === product._id;
              const productImage = product.images[0] || "/images/products/product1.webp";
              const productHoverImage = product.images[1] || product.images[0] || "/images/products/product1-1.webp";
              const productHref = `/${product.category.slug}/${product.slug}`;

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
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveProduct(isActive ? null : product._id);
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
                          <div
                            className="relative overflow-hidden w-full shadow-md hover:shadow-2xl transition-shadow duration-300 rounded-sm"
                            style={{ height: "439px" }}
                          >
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
                                  width={340}
                                  height={439}
                                  className="object-cover w-full h-full"
                                  style={{
                                    width: "340px",
                                    height: "439px",
                                  }}
                                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 340px"
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
                                  width={340}
                                  height={439}
                                  className="object-cover w-full h-full"
                                  style={{
                                    width: "340px",
                                    height: "439px",
                                  }}
                                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 340px"
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
            className="swiper-button-prev-custom absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </button>
          <button
            className="swiper-button-next-custom absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestSellingProducts;
