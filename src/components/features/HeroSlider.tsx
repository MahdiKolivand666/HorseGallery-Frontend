"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TypeAnimation } from "react-type-animation";

const HeroSlider = () => {
  const t = useTranslations("home.hero");
  const typewriterTexts = t.raw("typewriterTexts") as string[];

  const slides = {
    desktop: [
      "/images/slider/Slider-1.jpg",
      "/images/slider/Slider-2.jpg",
      "/images/slider/Slider-5.webp",
    ],
    mobile: ["/images/slider/sliderT-3.jpg", "/images/slider/sliderT-4.jpg"],
  };

  return (
    <section className="relative h-screen w-full max-w-[100vw] overflow-hidden bg-gray-900">
      {/* Desktop Slider */}
      <div className="hidden lg:block absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop={true}
          className="h-full w-full hero-swiper"
        >
          {slides.desktop.map((image, index) => (
            <SwiperSlide key={`desktop-${index}`}>
              <div className="relative h-full w-full">
                <Image
                  src={image}
                  alt={`Desktop Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={85}
                  unoptimized
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Mobile Slider */}
      <div className="block lg:hidden absolute inset-0 z-0">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop={true}
          className="h-full w-full hero-swiper"
        >
          {slides.mobile.map((image, index) => (
            <SwiperSlide key={`mobile-${index}`}>
              <div className="relative h-full w-full">
                <Image
                  src={image}
                  alt={`Mobile Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={85}
                  unoptimized
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-end md:items-center justify-center md:justify-end pointer-events-none pb-16 sm:pb-20 md:pb-0 md:pt-16 lg:pt-20">
        <div className="flex flex-col items-center md:items-start px-6 sm:px-8 md:pl-12 md:pr-8 lg:pl-24 lg:pr-16 w-full md:w-auto max-w-full md:max-w-2xl mb-12 sm:mb-16 md:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-2 sm:mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-normal h-10 sm:h-12 md:h-14 flex items-center justify-center text-center w-full"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
          >
            <TypeAnimation
              sequence={typewriterTexts.flatMap((text) => [text, 2000])}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              cursor={true}
              style={{
                display: "inline-block",
                direction: "rtl",
                textAlign: "center",
                width: "100%",
              }}
            />
          </motion.div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(49, 93, 73, 1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 bg-primary text-white rounded-full text-sm sm:text-base md:text-lg font-semibold hover:bg-primary-700 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] pointer-events-auto border-2 border-white/20"
          >
            {t("cta")}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
