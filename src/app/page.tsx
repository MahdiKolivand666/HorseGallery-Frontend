"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import HeroSlider from "@/components/features/HeroSlider";
import CategoryGrid from "@/components/features/CategoryGrid";
import BestSellingProducts from "@/components/features/BestSellingProducts";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="bg-white overflow-x-hidden max-w-[100vw] w-full">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Best Selling Products */}
      <BestSellingProducts />

      {/* Banner Section */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
          >
            {t("banner.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-gray-300"
          >
            {t("banner.subtitle")}
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 sm:px-10 lg:px-12 py-3 sm:py-4 bg-white text-gray-900 rounded-full text-base sm:text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {t("banner.cta")}
          </motion.button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="aspect-square bg-gradient-to-br from-amber-200 to-amber-400 rounded-2xl sm:rounded-3xl" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-gray-900">
                {t("about.title")}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6">
                {t("about.paragraph1")}
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                {t("about.paragraph2")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
