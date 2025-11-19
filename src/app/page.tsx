"use client";

import { motion } from "framer-motion";
import HeroSlider from "@/components/features/HeroSlider";
import CategoryGrid from "@/components/features/CategoryGrid";
import BestSellingProducts from "@/components/features/BestSellingProducts";
import VideoSection from "@/components/features/VideoSection";
import BlogSection from "@/components/features/BlogSection";
import AboutUsSection from "@/components/features/AboutUsSection";
import GiftSection from "@/components/features/GiftSection";
import NewArrivalsSection from "@/components/features/NewArrivalsSection";
import FAQSection from "@/components/features/FAQSection";
import FeaturesBar from "@/components/features/FeaturesBar";

export default function Home() {
  return (
    <div className="bg-white w-full">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Features Bar */}
      <FeaturesBar />

      {/* Best Selling Products */}
      <BestSellingProducts />

      {/* Divider */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent origin-center"
          />
        </div>
      </div>

      {/* Video Section */}
      <VideoSection />

      {/* Divider */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent origin-center"
          />
        </div>
      </div>

      {/* Gift Section */}
      <GiftSection />

      {/* New Arrivals Section */}
      <NewArrivalsSection />

      {/* About Us Section */}
      <AboutUsSection />

      {/* Features Bar */}
      <FeaturesBar />

      {/* Blog Section */}
      <BlogSection />

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}
