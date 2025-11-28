"use client";

import Image from "next/image";

const ImageCards = () => {
  const cards = [
    {
      id: 1,
      image: "/images/card/card1.webp",
      title: "پیشنهاد ویژه",
      description: "بهترین محصولات با کیفیت عالی\nو قیمت مناسب برای شما",
    },
    {
      id: 2,
      image: "/images/card/card2.webp",
      title: "محصولات اختصاصی",
      description: "طراحی‌های منحصر به فرد و خاص\nفقط در گالری اسب",
    },
    {
      id: 3,
      image: "/images/card/card3.webp",
      title: "کلکسیون جدید",
      description: "جدیدترین مدل‌های سال\nبا طراحی مدرن و شیک",
    },
    {
      id: 4,
      image: "/images/card/card4.webp",
      title: "فروش ویژه",
      description: "تخفیف‌های استثنایی\nبرای محصولات منتخب",
    },
  ];

  return (
    <section className="w-full bg-white py-8 px-4">
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="relative group cursor-pointer">
              {/* Image Container */}
              <div className="relative w-full lg:w-[358px] h-auto lg:h-[584px] aspect-[358/584] lg:aspect-auto overflow-hidden mx-auto">
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
                  <button className="w-[109px] h-[40px] bg-transparent border border-white text-white text-xs font-medium hover:bg-white hover:text-gray-900 transition-colors">
                    خرید محصول
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageCards;
