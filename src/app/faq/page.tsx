"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, Home } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems: FAQItem[] = [
    {
      id: "1",
      question: "چگونه می‌توانم سفارش خود را ثبت کنم؟",
      answer:
        "برای ثبت سفارش، کافی است محصول مورد نظر خود را انتخاب کرده و به سبد خرید اضافه کنید. سپس با وارد کردن اطلاعات تماس و آدرس، سفارش خود را نهایی کنید. پس از پرداخت آنلاین، سفارش شما ثبت خواهد شد.",
    },
    {
      id: "2",
      question: "زمان تحویل سفارش چقدر است؟",
      answer:
        "زمان تحویل سفارش بستگی به محل سکونت شما دارد. برای تهران و شهرستان‌های اطراف، زمان تحویل ۲ تا ۳ روز کاری و برای سایر شهرستان‌ها ۳ تا ۵ روز کاری است. در صورت نیاز به ارسال فوری، گزینه ارسال اکسپرس را انتخاب کنید.",
    },
    {
      id: "3",
      question: "آیا امکان مرجوع کردن محصول وجود دارد؟",
      answer:
        "بله، شما می‌توانید تا ۷ روز پس از دریافت محصول، در صورت عدم رضایت و سالم بودن محصول، آن را مرجوع کنید. هزینه ارسال مرجوعی به عهده مشتری است مگر در مواردی که محصول دارای عیب و نقص باشد.",
    },
    {
      id: "4",
      question: "محصولات شما دارای گارانتی هستند؟",
      answer:
        "تمامی محصولات ما دارای گارانتی اصالت و ضمانت بازگشت وجه هستند. همچنین محصولات طلا و جواهرات دارای گارانتی ۱۸ ماهه کارگاهی می‌باشند که شامل تعمیرات و خدمات پس از فروش است.",
    },
    {
      id: "5",
      question: "روش‌های پرداخت چیست؟",
      answer:
        "ما سه روش پرداخت ارائه می‌دهیم: پرداخت آنلاین از طریق درگاه بانکی، پرداخت در محل هنگام تحویل سفارش (فقط برای تهران)، و پرداخت اقساطی با همکاری بانک‌های معتبر کشور.",
    },
    {
      id: "6",
      question: "آیا محصولات سفارشی می‌پذیرید؟",
      answer:
        "بله، ما امکان طراحی و ساخت محصولات سفارشی را بر اساس سلیقه و نیاز شما فراهم کرده‌ایم. کافی است از طریق بخش تماس با ما، درخواست خود را ارسال کنید تا کارشناسان ما با شما تماس بگیرند.",
    },
    {
      id: "7",
      question: "چگونه از اصل بودن محصولات مطمئن شوم؟",
      answer:
        "تمامی محصولات ما دارای مهر و برگه گارانتی اصالت هستند. همچنین شما می‌توانید با مراجعه به فروشگاه‌های فیزیکی ما، از نزدیک محصولات را بررسی و خریداری کنید.",
    },
    {
      id: "8",
      question: "هزینه ارسال چقدر است؟",
      answer:
        "هزینه ارسال بستگی به وزن محصول و مقصد دارد. برای سفارش‌های بالای ۵ میلیون تومان، ارسال به صورت رایگان انجام می‌شود. هزینه دقیق ارسال در مرحله نهایی کردن سفارش به شما نمایش داده می‌شود.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
              <div className="relative w-full" style={{ height: 'calc(100vh - 104px)' }}>
                <Image
                  src="/images/aboutUs/human.webp"
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
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="border border-gray-200 bg-white hover:shadow-md transition-all"
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
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="border border-gray-200 bg-white hover:shadow-md transition-all"
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

