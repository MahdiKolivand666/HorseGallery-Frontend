"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

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
        "برای ثبت سفارش، کافی است محصول مورد نظر خود را انتخاب کرده و به سبد خرید اضافه کنید. سپس با وارد کردن اطلاعات تماس و آدرس، سفارش خود را نهایی کنید. پس از پرداخت آنلاین، سفارش شما ثبت خواهد شد.",
    },
    {
      id: 2,
      question: "زمان تحویل سفارش چقدر است؟",
      answer:
        "زمان تحویل سفارش بستگی به محل سکونت شما دارد. برای تهران و شهرستان‌های اطراف، زمان تحویل ۲ تا ۳ روز کاری و برای سایر شهرستان‌ها ۳ تا ۵ روز کاری است. در صورت نیاز به ارسال فوری، گزینه ارسال اکسپرس را انتخاب کنید.",
    },
    {
      id: 3,
      question: "آیا امکان مرجوع کردن محصول وجود دارد؟",
      answer:
        "بله، شما می‌توانید تا ۷ روز پس از دریافت محصول، در صورت عدم رضایت و سالم بودن محصول، آن را مرجوع کنید. هزینه ارسال مرجوعی به عهده مشتری است مگر در مواردی که محصول دارای عیب و نقص باشد.",
    },
    {
      id: 4,
      question: "محصولات شما دارای گارانتی هستند؟",
      answer:
        "تمامی محصولات ما دارای گارانتی اصالت و ضمانت بازگشت وجه هستند. همچنین محصولات طلا و جواهرات دارای گارانتی ۱۸ ماهه کارگاهی می‌باشند که شامل تعمیرات و خدمات پس از فروش است.",
    },
    {
      id: 5,
      question: "روش‌های پرداخت چیست؟",
      answer:
        "ما سه روش پرداخت ارائه می‌دهیم: پرداخت آنلاین از طریق درگاه بانکی، پرداخت در محل هنگام تحویل سفارش (فقط برای تهران)، و پرداخت اقساطی با همکاری بانک‌های معتبر کشور.",
    },
    {
      id: 6,
      question: "آیا محصولات سفارشی می‌پذیرید؟",
      answer:
        "بله، ما امکان طراحی و ساخت محصولات سفارشی را بر اساس سلیقه و نیاز شما فراهم کرده‌ایم. کافی است از طریق بخش تماس با ما، درخواست خود را ارسال کنید تا کارشناسان ما با شما تماس بگیرند.",
    },
    {
      id: 7,
      question: "چگونه از اصل بودن محصولات مطمئن شوم؟",
      answer:
        "تمامی محصولات ما دارای مهر و برگه گارانتی اصالت هستند. همچنین شما می‌توانید با مراجعه به فروشگاه‌های فیزیکی ما، از نزدیک محصولات را بررسی و خریداری کنید.",
    },
    {
      id: 8,
      question: "هزینه ارسال چقدر است؟",
      answer:
        "هزینه ارسال بستگی به وزن محصول و مقصد دارد. برای سفارش‌های بالای ۵ میلیون تومان، ارسال به صورت رایگان انجام می‌شود. هزینه دقیق ارسال در مرحله نهایی کردن سفارش به شما نمایش داده می‌شود.",
    },
  ];

  const toggleFAQ = (id: number) => {
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
              src="/images/aboutUs/Main_Photos1.webp"
              alt="سوالات متداول"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </motion.div>
        </div>

        {/* Mobile/Tablet Image */}
        <div className="lg:hidden px-4 sm:px-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-[350px] sm:h-[400px] overflow-hidden shadow-2xl"
          >
            <Image
              src="/images/aboutUs/Main_Photos1.webp"
              alt="سوالات متداول"
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
            className="w-full max-w-3xl px-4 sm:px-6 lg:px-12 lg:py-12"
          >
          {/* Section Header */}
          <div className="text-right mb-4 sm:mb-6">
            <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
              سوالات متداول
            </h2>
          </div>

          {/* FAQ Items */}
          <div className="space-y-2 sm:space-y-3">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
