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

interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const BlogSection = () => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: "blog1",
      title: "تاریخچه طلا و جواهرات در ایران",
      description:
        "طلا و جواهرات از دیرباز در فرهنگ و تمدن ایران جایگاه ویژه‌ای داشته‌اند. از دوران هخامنشیان تا به امروز، هنر جواهرسازی ایرانی همواره در جهان زبانزد بوده است. در این مقاله به بررسی تاریخچه غنی جواهرات ایرانی می‌پردازیم و نقش آن را در فرهنگ و هنر این سرزمین بررسی می‌کنیم.",
      image: "/images/blogs/Blog_Square.webp",
      href: "/blog/history-of-gold-jewelry",
    },
    {
      id: "blog2",
      title: "راهنمای انتخاب جواهرات مناسب",
      description:
        "انتخاب جواهرات مناسب می‌تواند چالش‌برانگیز باشد. در این مقاله راهنمای کاملی برای انتخاب جواهرات مناسب با توجه به سلیقه، سبک زندگی و بودجه شما ارائه می‌دهیم. همچنین نکات مهم در نگهداری و مراقبت از جواهرات را بررسی می‌کنیم تا بتوانید از زیبایی آن‌ها برای سال‌های طولانی لذت ببرید.",
      image: "/images/blogs/Facetune_06-05-2024-10-01-19.webp",
      href: "/blog/jewelry-selection-guide",
    },
  ];

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
            داستان‌های Horse Gallery
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
              <SwiperSlide key={post.id}>
                <article className="group bg-white overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link href={post.href}>
                    <div className="flex flex-row-reverse gap-4">
                      {/* Image - Left Side (Vertical) */}
                      <div className="w-2/5 flex-shrink-0">
                        <div className="relative w-full h-full min-h-[280px] overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="100vw"
                          />
                        </div>
                      </div>

                      {/* Content - Right Side */}
                      <div className="w-3/5 flex flex-col justify-between text-right py-2">
                        <div>
                          {/* Title */}
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                            {post.description}
                          </p>
                        </div>

                        {/* Read More Link */}
                        <div className="mt-3 flex items-center gap-2 text-primary text-xs font-medium group-hover:gap-3 transition-all justify-end">
                          <span>ادامه مطلب</span>
                          <ChevronLeft className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
              key={post.id}
              variants={itemVariants}
              className="group bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <Link href={post.href}>
                <div className="flex flex-row-reverse gap-4">
                  {/* Image - Left Side (Vertical) */}
                  <div className="w-2/5 flex-shrink-0">
                    <div className="relative w-full h-full min-h-[280px] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 40vw, 20vw"
                      />
                    </div>
                  </div>

                  {/* Content - Right Side */}
                  <div className="w-3/5 flex flex-col justify-between text-right py-2">
                    <div>
                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                        {post.description}
                      </p>
                    </div>

                    {/* Read More Link */}
                    <div className="mt-3 flex items-center gap-2 text-primary text-xs font-medium group-hover:gap-3 transition-all justify-end">
                      <span>ادامه مطلب</span>
                      <ChevronLeft className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
