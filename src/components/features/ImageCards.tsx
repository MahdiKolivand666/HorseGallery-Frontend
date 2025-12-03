"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageCards = () => {
  const cards = [
    {
      id: 1,
      image: "/images/card/card1.webp",
      title: "پیشنهاد ویژه",
      description: "بهترین محصولات با کیفیت عالی\nو قیمت مناسب برای شما",
      href: "/suggest",
    },
    {
      id: 2,
      image: "/images/card/card2.webp",
      title: "محصولات اختصاصی",
      description: "طراحی‌های منحصر به فرد و خاص\nفقط در گالری اسب",
      href: "/products/women",
    },
    {
      id: 3,
      image: "/images/card/card3.webp",
      title: "کلکسیون جدید",
      description: "جدیدترین مدل‌های سال\nبا طراحی مدرن و شیک",
      href: "/products/women",
    },
    {
      id: 4,
      image: "/images/card/card4.webp",
      title: "فروش ویژه",
      description: "تخفیف‌های استثنایی\nبرای محصولات منتخب",
      href: "/suggest",
    },
  ];

  return (
    <section className="w-full bg-white py-8 px-2 sm:px-4">
      <div className="w-full">
        {/* Mobile Slider */}
        <div className="block sm:hidden relative image-cards-swiper">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            navigation={{
              nextEl: ".image-cards-button-next-custom",
              prevEl: ".image-cards-button-prev-custom",
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            className="!pb-4"
          >
            {cards.map((card) => (
              <SwiperSlide key={card.id}>
                <Link href={card.href} className="relative group cursor-pointer block">
                  {/* Image Container */}
                  <div className="relative w-full aspect-[358/584] overflow-hidden mx-auto border border-gray-300 rounded">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="100vw"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                    {/* Title and Description on Image */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full px-4 text-center transition-all duration-300 group-hover:bottom-24">
                      <h3 className="text-base font-bold text-white mb-2">
                        {card.title}
                      </h3>
                      <p className="text-xs text-white leading-relaxed whitespace-pre-line">
                        {card.description}
                      </p>
                    </div>

                    {/* Button on Image */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:bottom-8">
                      <div className="w-[109px] h-[40px] bg-transparent border border-white text-white text-xs font-medium hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center">
                        خرید محصول
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button
            className="image-cards-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
          <button
            className="image-cards-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="relative group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative w-full lg:w-[358px] h-auto lg:h-[584px] aspect-[358/584] lg:aspect-auto overflow-hidden mx-auto border border-gray-300 rounded">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                {/* Title and Description on Image */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full px-4 text-center transition-all duration-300 group-hover:bottom-24">
                  <h3 className="text-base font-bold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-white leading-relaxed whitespace-pre-line">
                    {card.description}
                  </p>
                </div>

                {/* Button on Image */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 group-hover:bottom-8">
                  <div className="w-[109px] h-[40px] bg-transparent border border-white text-white text-xs font-medium hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center">
                    خرید محصول
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageCards;
