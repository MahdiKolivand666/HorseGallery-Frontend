"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "چگونه می‌توانم سفارش خود را ثبت کنم؟",
      answer:
        "برای ثبت سفارش، ابتدا محصول مورد نظر خود را انتخاب کنید و به سبد خرید اضافه کنید. سپس با مراجعه به سبد خرید، اطلاعات خود را تکمیل کرده و روش پرداخت را انتخاب نمایید. پس از تکمیل فرآیند پرداخت، سفارش شما ثبت خواهد شد.",
    },
    {
      id: 2,
      question: "زمان تحویل سفارش چقدر است؟",
      answer:
        "زمان تحویل سفارش بسته به نوع محصول و موقعیت جغرافیایی شما متفاوت است. به طور معمول، سفارشات در تهران ظرف 2 تا 3 روز کاری و در شهرستان‌ها ظرف 3 تا 7 روز کاری تحویل داده می‌شوند. محصولات سفارشی ممکن است زمان بیشتری نیاز داشته باشند.",
    },
    {
      id: 3,
      question: "آیا امکان بازگشت کالا وجود دارد؟",
      answer:
        "بله، شما می‌توانید تا 7 روز پس از دریافت محصول، در صورت عدم رضایت یا وجود مشکل در کالا، درخواست بازگشت کالا را ثبت کنید. لازم است محصول در شرایط اولیه و با بسته‌بندی کامل باشد. هزینه ارسال بازگشتی بسته به نوع مشکل، ممکن است بر عهده خریدار یا فروشنده باشد.",
    },
    {
      id: 4,
      question: "روش‌های پرداخت چه مواردی هستند؟",
      answer:
        "ما روش‌های مختلف پرداخت را برای راحتی شما فراهم کرده‌ایم: پرداخت آنلاین از طریق درگاه بانکی، پرداخت در محل (برای شهر تهران)، واریز به حساب بانکی و پرداخت اقساطی از طریق کارت‌های اعتباری. تمامی تراکنش‌ها با بالاترین استانداردهای امنیتی انجام می‌شوند.",
    },
    {
      id: 5,
      question: "چگونه از اصالت محصولات اطمینان حاصل کنم؟",
      answer:
        "تمامی محصولات ارائه شده در Horse Gallery دارای گواهی اصالت هستند. هر محصول با کارت گارانتی و برگه اصالت تحویل داده می‌شود. همچنین شما می‌توانید از طریق کد رهگیری روی محصول، اصالت آن را در سایت بررسی کنید. ما فقط با برندهای معتبر همکاری می‌کنیم.",
    },
  ];

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="w-full bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-right py-8 sm:py-5"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
            سوالات متداول
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-2 sm:space-y-3 pb-6 sm:pb-8">
          {faqItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={`bg-white border transition-all duration-300 overflow-hidden ${
                  openId === item.id
                    ? "border-primary shadow-md"
                    : "border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between text-right group"
                >
                  <span className="text-sm sm:text-base font-semibold text-gray-900 flex-1 ml-3">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openId === item.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-shrink-0 transition-colors duration-300 ${
                      openId === item.id ? "text-primary" : "text-gray-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {openId === item.id && (
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
      </div>
    </section>
  );
};

export default FAQSection;

