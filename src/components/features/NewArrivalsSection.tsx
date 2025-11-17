"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const NewArrivalsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
  const [activeProduct, setActiveProduct] = useState<number | null>(null);

  // Sample products data (12 products = 6 rows of 2)
  const productNames = [
    "گوشواره جدید",
    "دستبند جدید",
    "انگشتر جدید",
    "گردنبند جدید",
    "سرویس جدید",
    "پلاک جدید",
    "النگو جدید",
    "حلقه جدید",
    "آویز جدید",
    "زنجیر جدید",
    "النگو نقره",
    "انگشتر نقره",
  ];

  const productPrices = [
    "۲,۳۰۰,۰۰۰",
    "۳,۱۰۰,۰۰۰",
    "۱,۹۰۰,۰۰۰",
    "۲,۷۰۰,۰۰۰",
    "۶,۲۰۰,۰۰۰",
    "۱,۶۰۰,۰۰۰",
    "۴,۱۰۰,۰۰۰",
    "۲,۶۰۰,۰۰۰",
    "۱,۳۰۰,۰۰۰",
    "۳,۴۰۰,۰۰۰",
    "۲,۱۰۰,۰۰۰",
    "۱,۸۰۰,۰۰۰",
  ];

  const products = Array.from({ length: 12 }, (_, i) => {
    const productNum = (i % 10) + 1;
    // product1-1.webp doesn't exist, use product2-2.webp for product1
    const hoverNum = productNum === 1 ? 2 : productNum;

    return {
      id: i + 1,
      name: productNames[i],
      price: productPrices[i],
      image: `/images/products/product${productNum}.webp`,
      hoverImage: `/images/products/product${hoverNum}-${hoverNum}.webp`,
      href: `/product/${i + 1}`,
    };
  });

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
        // Section is being scrolled through - fix the image (LEFT side)
        setImageStyle({
          position: "fixed",
          top: 0,
          left: 0,
          width: "50%",
          height: "100vh",
        });
      } else if (sectionBottom <= windowHeight) {
        // Section is scrolled past - position at bottom
        setImageStyle({
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "50%",
          height: "100vh",
        });
      } else {
        // Section hasn't reached top yet - position at top
        setImageStyle({
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100vh",
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-white relative">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row relative">
          {/* Left Side - Large Sticky Image (Desktop) */}
          <div className="hidden lg:block lg:w-1/2 lg:order-2">
            <div style={imageStyle} className="z-0">
              <div className="relative w-full h-full">
                <Image
                  src="/images/aboutUs/posh.webp"
                  alt="New Arrivals Collection"
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
                {/* Optional Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />

                {/* View More Button on Image */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 gap-5">
                  <h3 className="text-white text-xl lg:text-2xl font-normal">
                    تازه‌ها
                  </h3>
                  <Link
                    href="/products"
                    className="inline-flex items-center px-12 py-4 bg-transparent border border-white text-white font-medium hover:bg-white hover:text-primary transition-all duration-300 text-base"
                  >
                    <span>سایر محصولات</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Products Grid (Scrollable) */}
          <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16 relative z-10 lg:order-1">
            <div className="max-w-3xl mx-auto">
              {/* Large Image for Mobile/Tablet (Above Products) */}
              <div className="lg:hidden mb-6 sm:mb-8">
                <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/images/aboutUs/posh.webp"
                    alt="New Arrivals Collection"
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
                      تازه‌ها
                    </h3>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 bg-transparent border border-white text-white font-medium hover:bg-white hover:text-primary transition-all duration-300"
                    >
                      <span className="text-sm sm:text-base">سایر محصولات</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Products Grid - 2 columns on mobile/tablet, 2 columns on desktop */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6">
                {products.map((product) => {
                  const isActive = activeProduct === product.id;

                  return (
                    <Link
                      key={product.id}
                      href={product.href}
                      className="group"
                    >
                      <div
                        className="relative"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveProduct(isActive ? null : product.id);
                        }}
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
                          <div className="relative overflow-hidden w-full aspect-square shadow-md hover:shadow-2xl transition-shadow duration-300 rounded-sm">
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
                                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 303px"
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
                                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 303px"
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
                          {product.price} تومان
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

export default NewArrivalsSection;
