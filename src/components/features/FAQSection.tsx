"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

interface Props {
  faqs: FAQ[];
}

const FAQSection = ({ faqs }: Props) => {
  const t = useTranslations("common");
  const [openId, setOpenId] = useState<string | null>(null);

  // اگر سوالی نبود، چیزی نشون نده
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // محدود به 8 سوال
  const faqItems = faqs.slice(0, 8);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full bg-gray-50 py-8 sm:py-10 lg:py-0">
      <div className="w-full lg:flex lg:h-auto">
        {/* Left Side - Image (Desktop) - Stuck to left, top, and bottom */}
        <div className="hidden lg:block lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-full min-h-[700px]"
          >
            <Image
              src="/images/aboutUs/logan.webp"
              alt={t("alt.faq")}
              fill
              className="object-cover"
              sizes="50vw"
            />
          </motion.div>
        </div>

        {/* Mobile/Tablet Image */}
        <div className="lg:hidden px-2 sm:px-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-[350px] sm:h-[400px] overflow-hidden border border-gray-300 rounded"
          >
            <Image
              src="/images/aboutUs/Main_Photos1.webp"
              alt={t("alt.faq")}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </div>

        {/* Right Side - FAQ Items */}
        <div className="lg:w-1/2 lg:flex lg:justify-center lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-3xl px-2 sm:px-6 lg:px-12 lg:py-12"
          >
            {/* Section Header */}
            <div className="text-right mb-4 sm:mb-6">
              <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
                {t("navbar.menu.faq")}
              </h2>
            </div>

            {/* FAQ Items */}
            <div className="space-y-2 sm:space-y-3">
              {faqItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div
                    className={`bg-white border transition-all duration-300 overflow-hidden rounded ${
                      openId === item._id ? "border-primary" : "border-gray-300"
                    }`}
                  >
                    {/* Question Button */}
                    <button
                      onClick={() => toggleFAQ(item._id)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between text-right group"
                    >
                      <span className="text-sm sm:text-base font-semibold text-gray-900 flex-1 ml-3">
                        {item.question}
                      </span>
                      <motion.div
                        animate={{ rotate: openId === item._id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex-shrink-0 transition-colors duration-300 ${
                          openId === item._id ? "text-primary" : "text-gray-400"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.div>
                    </button>

                    {/* Answer */}
                    <AnimatePresence initial={false}>
                      {openId === item._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                            <div className="border-t border-gray-100 pt-3">
                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-right">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
