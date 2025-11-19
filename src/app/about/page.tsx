"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Full Width Video at Top */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden">
        <video
          src="/video/aboutUsClip.mp4"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Title Below Video */}
      <div className="bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center">
            درباره گالری اسب
          </h1>
        </div>
      </div>

      {/* Section 1: Image Right + Text Left */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Left */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-right">
              داستان ما
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed text-right">
              <p>
                گالری اسب با بیش از یک دهه تجربه درخشان در زمینه طراحی و تولید
                جواهرات و زیورآلات، یکی از معتبرترین و شناخته‌شده‌ترین برندهای
                ایرانی در این حوزه به شمار می‌رود. ما با ترکیب هنرمندانه هنر
                سنتی و اصیل ایرانی با طراحی مدرن و به‌روز جهانی، محصولاتی منحصر
                به فرد، زیبا و با کیفیت بی‌نظیر ارائه می‌دهیم که هر کدام داستانی
                ویژه و منحصر به فرد را روایت می‌کنند.
              </p>
              <p>
                هدف اصلی و رسالت ما در گالری اسب، فراهم کردن بهترین و کامل‌ترین
                تجربه خرید برای مشتریان عزیز و ارجمند است. از لحظه انتخاب بهترین
                و مرغوب‌ترین مواد اولیه گرفته تا طراحی دقیق، ساخت حرفه‌ای و
                ارائه خدمات جامع پس از فروش، در تمام مراحل فرآیند تولید و
                خدمات‌رسانی، کیفیت و رضایت شما را در بالاترین اولویت خود قرار
                داده‌ایم.
              </p>
              <p>
                تیم متخصص و با تجربه ما متشکل از طراحان حرفه‌ای و خلاق،
                جواهرسازان ماهر و استادکار، و مشاوران دلسوز و متعهد است که با
                دانش روز و مهارت بالا، همواره آماده‌اند تا شما را در انتخاب
                بهترین محصول متناسب با سلیقه و نیاز شما راهنمایی کنند. ما
                معتقدیم که هر قطعه جواهر نه تنها یک زینت است، بلکه نماد عشق،
                خاطرات و لحظات ارزشمند زندگی شماست.
              </p>
              <p>
                در گالری اسب، ما به ارزش‌های اصالت، صداقت، نوآوری و مشتری‌مداری
                پایبند هستیم و همواره تلاش می‌کنیم تا با ارائه محصولات بی‌نظیر و
                خدمات برتر، اعتماد و رضایت شما را جلب کنیم. هر روز با انگیزه و
                اشتیاق، به دنبال خلق زیبایی‌های جدید و ماندگار هستیم که بتوانند
                لحظات خاص زندگی شما را زیباتر و به یادماندنی‌تر کنند.
              </p>
            </div>
          </motion.div>

          {/* Image Right */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden shadow-lg">
              <Image
                src="/images/aboutUs/Main_Photos1.webp"
                alt="گالری اسب"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Section 2: Text Right + Image Left */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image Left */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-1"
            >
              <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden shadow-lg">
                <Image
                  src="/images/aboutUs/bridal.webp"
                  alt="تیم گالری اسب"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </motion.div>

            {/* Text Right */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-2 lg:order-2"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-right">
                تیم ما
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed text-right">
                <p>
                  تیم متخصص و حرفه‌ای گالری اسب متشکل از افرادی با تجربه، مهارت
                  و اشتیاق فراوان در زمینه طراحی، ساخت و فروش جواهرات است.
                  طراحان خلاق و با ذوق ما با دانش عمیق از هنر و فرهنگ ایرانی و
                  آشنایی کامل با آخرین ترندهای جهانی، هر روز در تلاش هستند تا
                  طرح‌هایی نو، منحصر به فرد و جذاب خلق کنند که هم هویت فرهنگی ما
                  را منعکس کند و هم با سلیقه مدرن و روز شما همخوانی داشته باشد.
                </p>
                <p>
                  جواهرسازان ماهر و استادکار ما با سال‌ها تجربه در کار با فلزات
                  گرانبها و سنگ‌های قیمتی، هر قطعه را با دقت، ظرافت و عشق به هنر
                  می‌سازند. آنها با استفاده از تکنیک‌های سنتی و مدرن، محصولاتی
                  با کیفیت بی‌نظیر و جزئیات دقیق تولید می‌کنند که نه تنها زیبا،
                  بلکه بادوام و ماندگار نیز هستند.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
