"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

const FeaturesBar = () => {
  const features: Feature[] = [
    {
      id: 1,
      icon: "/images/icons/free-shipping.webp",
      title: "ارسال رایگان",
      description: "برای خریدهای بالای 5 میلیون تومان",
    },
    {
      id: 2,
      icon: "/images/icons/guarantee.webp",
      title: "ضمانت اصالت",
      description: "تضمین اصل بودن کالا",
    },
    {
      id: 3,
      icon: "/images/icons/payment.webp",
      title: "پرداخت امن",
      description: "درگاه پرداخت معتبر و امن",
    },
    {
      id: 4,
      icon: "/images/icons/warranty.webp",
      title: "گارانتی محصولات",
      description: "ضمانت 7 روزه بازگشت کالا",
    },
  ];

  return (
    <section className="w-full bg-[#faf6f0] py-4 sm:py-5 lg:py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-1.5 sm:mb-2">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">
                {feature.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
