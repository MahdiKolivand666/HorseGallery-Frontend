"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, Home } from "lucide-react";
import { getFAQs } from "@/lib/api/faq";
import { Loading } from "@/components/ui/Loading";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqItems, setFaqItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const faqs = await getFAQs();

        if (isMounted) {
          setFaqItems(faqs);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFAQs();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 sm:pt-28 flex items-center justify-center px-4">
        <Loading size="lg" text="در حال بارگذاری سوالات..." />
      </div>
    );
  }

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
            <span className="text-primary font-medium">سوالات متداول</span>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div>
        {/* Main Content - Desktop */}
        <div className="hidden lg:flex relative">
          {/* Large Image - Left Side (Sticky Half Screen) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-1/2"
          >
            <div className="sticky top-[104px] overflow-hidden">
              <div
                className="relative w-full"
                style={{ height: "calc(100vh - 104px)" }}
              >
                <Image
                  src="/images/aboutUs/logan2.webp"
                  alt="FAQ Image"
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* FAQ Items - Right Side */}
          <div className="w-1/2 flex items-center">
            <div className="w-full max-w-3xl mx-auto px-6 lg:px-12 py-12">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="space-y-3">
                  {faqItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="border border-gray-300 bg-white transition-all rounded"
                    >
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-right"
                      >
                        <span className="text-sm font-medium text-gray-900 flex-1">
                          {item.question}
                        </span>
                        <motion.div
                          animate={{ rotate: openIndex === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {openIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 border-t border-gray-100">
                              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-3">
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden px-4 sm:px-6 py-8">
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="border border-gray-300 bg-white transition-all rounded"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-right"
                >
                  <span className="text-sm font-medium text-gray-900 flex-1">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 border-t border-gray-100">
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-3">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
