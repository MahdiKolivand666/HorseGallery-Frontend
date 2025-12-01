"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const AboutUsSection = () => {
  return (
    <section className="w-full bg-gray-50 pt-12 sm:pt-16 lg:pt-20 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Right Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1 text-right"
          >
            {/* Title */}
            <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-6">
              درباره گالری اسب
            </h2>

            {/* Description */}
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="text-base sm:text-lg">
                گالری اسب با بیش از یک دهه تجربه در زمینه طراحی و ساخت جواهرات
                دست‌ساز، به عنوان یکی از معتبرترین برندهای ایرانی در این حوزه
                شناخته می‌شود.
              </p>
              <p className="text-base sm:text-lg">
                ما با استفاده از بهترین مواد اولیه و دقت بالا در کار، محصولاتی
                منحصر به فرد و با کیفیت بالا را به مشتریان خود ارائه می‌دهیم. هر
                قطعه جواهرات در گالری اسب، داستانی از هنر و زیبایی است که با عشق
                و مهارت خلق شده است.
              </p>
              <p className="text-base sm:text-lg">
                فروشگاه ما در قلب تهران واقع شده و آماده ارائه بهترین خدمات به
                شما عزیزان است. تیم ما همواره در تلاش است تا تجربه‌ای
                به‌یادماندنی از خرید جواهرات را برای شما فراهم کند.
              </p>
            </div>

            {/* Logo Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 w-full bg-gray-50"
            >
              <div className="relative w-full h-64 sm:h-80 lg:h-96">
                <Image
                  src="/images/Logo/logo.png"
                  alt="Horse Gallery Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-1 lg:order-2"
          >
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden border border-gray-300 rounded">
              <Image
                src="/images/aboutUs/MainStore.webp"
                alt="Horse Gallery Store"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
