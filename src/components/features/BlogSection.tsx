"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
}

interface Props {
  posts: Blog[];
}

const BlogSection = ({ posts }: Props) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  // اگر بلاگی نبود، چیزی نشون نده
  if (!posts || posts.length === 0) {
    return null;
  }

  // محدود به 2 پست
  const blogPosts = posts.slice(0, 2);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 pt-0 pb-12 sm:pb-16 lg:pb-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 20,
          }}
          className="text-right py-8 sm:py-5 mb-4 sm:mb-6 lg:mb-8"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
            داستان‌های گالری اسب
          </h2>
        </motion.div>

        {/* Mobile/Tablet Slider (hidden on desktop) */}
        <div className="lg:hidden relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            speed={800}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            onSwiper={setSwiperInstance}
            className="blog-swiper"
          >
            {blogPosts.map((post) => (
              <SwiperSlide key={post._id}>
                <article className="group bg-white">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="flex flex-row-reverse gap-4">
                      {/* Image - Left Side (Vertical) */}
                      <div className="w-1/2 flex-shrink-0">
                        <div className="relative w-full h-full min-h-[300px] overflow-hidden border border-gray-300 rounded">
                          <Image
                            src={post.image || "/images/blogs/Blog_Square.webp"}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="100vw"
                          />
                        </div>
                      </div>

                      {/* Content - Right Side */}
                      <div className="w-1/2 flex flex-col justify-between text-right py-2">
                        <div>
                          {/* Title */}
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 line-clamp-2">
                            {post.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Read More Link */}
                        <div className="mt-3 flex items-center gap-2 text-primary text-xs font-medium justify-end">
                          <span>ادامه مطلب</span>
                          <ChevronLeft className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Arrows - Always Visible */}
          <button
            onClick={() => swiperInstance?.slidePrev()}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </button>
          <button
            onClick={() => swiperInstance?.slideNext()}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </button>
        </div>

        {/* Desktop Grid (hidden on mobile/tablet) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="hidden lg:grid grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
        >
          {blogPosts.map((post) => (
            <motion.article
              key={post._id}
              variants={itemVariants}
              className="group bg-white"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-row-reverse gap-4">
                  {/* Image - Left Side (Vertical) */}
                  <div className="w-1/2 flex-shrink-0">
                    <div className="relative w-full h-full min-h-[320px] overflow-hidden border border-gray-300 rounded">
                      <Image
                        src={post.image || "/images/blogs/Blog_Square.webp"}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>
                  </div>

                  {/* Content - Right Side */}
                  <div className="w-1/2 flex flex-col justify-between text-right py-2">
                    <div>
                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Read More Link */}
                    <div className="mt-3 flex items-center gap-2 text-primary text-xs font-medium justify-end">
                      <span>ادامه مطلب</span>
                      <ChevronLeft className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
