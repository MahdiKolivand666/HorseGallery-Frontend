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
      image: "/images/categories/categories1.webp",
      href: "/blog/history-of-gold-jewelry",
    },
    {
      id: "blog2",
      title: "راهنمای انتخاب جواهرات مناسب",
      description:
        "انتخاب جواهرات مناسب می‌تواند چالش‌برانگیز باشد. در این مقاله راهنمای کاملی برای انتخاب جواهرات مناسب با توجه به سلیقه، سبک زندگی و بودجه شما ارائه می‌دهیم. همچنین نکات مهم در نگهداری و مراقبت از جواهرات را بررسی می‌کنیم تا بتوانید از زیبایی آن‌ها برای سال‌های طولانی لذت ببرید.",
      image: "/images/categories/categories2.webp",
      href: "/blog/jewelry-selection-guide",
    },
    {
      id: "blog3",
      title: "هنر دست ساز بودن جواهرات",
      description:
        "جواهرات دست‌ساز دارای ارزش و زیبایی منحصر به فردی هستند که در تولیدات انبوه یافت نمی‌شود. در این مقاله به بررسی فرآیند ساخت جواهرات دست‌ساز می‌پردازیم و اهمیت هنر و مهارت استادکاران را در خلق آثار هنری بی‌نظیر بررسی می‌کنیم. همچنین تفاوت‌های جواهرات دست‌ساز با تولیدات صنعتی را بررسی می‌کنیم.",
      image: "/images/categories/categories3.jpg",
      href: "/blog/handmade-jewelry-art",
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
                <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                  {/* Blog Image */}
                  <Link href={post.href} className="block relative flex-shrink-0">
                    <div className="relative w-full h-64 sm:h-72 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="100vw"
                      />
                    </div>
                  </Link>

                  {/* Blog Content */}
                  <div className="p-6 sm:p-8 text-right flex flex-col flex-grow">
                    {/* Title */}
                    <Link href={post.href}>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-4 flex-grow">
                      {post.description}
                    </p>

                    {/* Read More Link */}
                    <Link
                      href={post.href}
                      className="inline-flex items-center gap-2 text-primary font-medium text-sm sm:text-base hover:gap-3 transition-all group/link justify-end mt-auto"
                    >
                      <span>ادامه مطلب</span>
                      <svg
                        className="w-4 h-4 rtl:rotate-180 group-hover/link:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
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
          className="hidden lg:grid grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
        >
          {blogPosts.map((post) => (
            <motion.article
              key={post.id}
              variants={itemVariants}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
            >
              {/* Blog Image */}
              <Link href={post.href} className="block relative flex-shrink-0">
                <div className="relative w-full h-80 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="33vw"
                  />
                </div>
              </Link>

              {/* Blog Content */}
              <div className="p-6 sm:p-8 text-right flex flex-col flex-grow">
                {/* Title */}
                <Link href={post.href}>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                    {post.title}
                  </h3>
                </Link>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-4 flex-grow">
                  {post.description}
                </p>

                {/* Read More Link */}
                <Link
                  href={post.href}
                  className="inline-flex items-center gap-2 text-primary font-medium text-sm sm:text-base hover:gap-3 transition-all group/link justify-end mt-auto"
                >
                  <span>ادامه مطلب</span>
                  <svg
                    className="w-4 h-4 rtl:rotate-180 group-hover/link:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
