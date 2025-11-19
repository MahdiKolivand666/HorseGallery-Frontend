"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Home, Award, Users, Target, Heart } from "lucide-react";

const AboutPage = () => {
  const features = [
    {
      icon: Award,
      title: "کیفیت برتر",
      description: "ارائه محصولات با بالاترین کیفیت و اصالت",
    },
    {
      icon: Users,
      title: "تیم حرفه‌ای",
      description: "متخصصان مجرب در خدمت شما",
    },
    {
      icon: Target,
      title: "تعهد به مشتری",
      description: "رضایت شما اولویت ماست",
    },
    {
      icon: Heart,
      title: "عشق به هنر",
      description: "علاقه‌مندی به زیبایی و هنر",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">درباره ما</span>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-12 sm:pb-16 lg:pb-24">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 text-right"
        >
          <h1 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
            درباره ما
          </h1>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-1"
          >
            {/* About Text */}
            <div className="mb-6 text-right">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                داستان Horse Gallery
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  گالری اسب با بیش از یک دهه تجربه در زمینه طراحی و تولید جواهرات،
                  یکی از معتبرترین برندهای ایرانی در این حوزه است. ما با ترکیب هنر
                  سنتی ایرانی و طراحی مدرن، محصولاتی منحصر به فرد و با کیفیت بالا
                  ارائه می‌دهیم.
                </p>
                <p>
                  هدف ما در گالری اسب، فراهم کردن بهترین تجربه خرید برای مشتریان
                  عزیز است. از انتخاب بهترین مواد اولیه گرفته تا ارائه خدمات پس از
                  فروش، در تمام مراحل کیفیت را در اولویت قرار می‌دهیم.
                </p>
                <p>
                  تیم ما متشکل از طراحان حرفه‌ای، جواهرسازان ماهر و مشاوران
                  متخصص است که همواره آماده‌اند تا شما را در انتخاب بهترین
                  محصول راهنمایی کنند.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-primary p-4 text-right hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-white/90">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Left Side - Video */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-2"
          >
            <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] overflow-hidden shadow-lg">
              <video
                src="/video/aboutUsClip.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

