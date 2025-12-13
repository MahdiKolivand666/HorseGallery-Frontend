"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Category {
  id: string;
  image: string;
  hoverImage: string;
  href: string;
  name: string;
}

const CategoryGrid = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories: Category[] = [
    {
      id: "category1",
      image: "/images/categories/categories1.webp",
      hoverImage: "/images/categories/categories1-1.webp",
      href: "/products/women/bracelet",
      name: "دستبند",
    },
    {
      id: "category2",
      image: "/images/categories/categories2.webp",
      hoverImage: "/images/categories/categories2-2.webp",
      href: "/products/women/necklace",
      name: "گردنبند",
    },
    {
      id: "category3",
      image: "/images/categories/categories3.jpg",
      hoverImage: "/images/categories/categories3-3.webp",
      href: "/products/women/earring",
      name: "گوشواره",
    },
    {
      id: "category4",
      image: "/images/categories/categories4.jpg",
      hoverImage: "/images/categories/categories4-4.webp",
      href: "/products/women/ring",
      name: "انگشتر",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        mass: 0.8,
      },
    },
  };

  return (
    <section className="w-full px-2 sm:px-6 lg:px-8 pb-6 bg-white overflow-visible">
      <div className="max-w-7xl mx-auto overflow-visible">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 20,
          }}
          className="text-right py-8 sm:py-5"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
            دسته‌بندی
          </h2>
        </motion.div>

        {/* Categories Grid - 2 Columns Mobile, 4 Columns Desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-visible"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category.id;

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                className="relative"
              >
                <Link href={category.href}>
                  <div
                    className="relative mb-4"
                    onMouseEnter={() => setActiveCategory(category.id)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring" as const,
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="relative overflow-visible cursor-pointer w-full"
                    >
                      <div className="relative overflow-hidden w-full border border-gray-300 aspect-square rounded">
                        {/* Default Image */}
                        <motion.div
                          className="absolute inset-0"
                          initial={false}
                          animate={{
                            opacity: isActive ? 0 : 1,
                          }}
                          whileHover={{
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                          }}
                        >
                          <motion.div
                            className="w-full h-full"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 50vw, 360px"
                            />
                          </motion.div>
                        </motion.div>

                        {/* Hover Image */}
                        <motion.div
                          className="absolute inset-0"
                          initial={false}
                          animate={{
                            opacity: isActive ? 1 : 0,
                          }}
                          whileHover={{
                            opacity: 1,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                          }}
                        >
                          <motion.div
                            className="w-full h-full"
                            initial={{ scale: 0.9 }}
                            whileHover={{ scale: 1 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Image
                              src={category.hoverImage}
                              alt={category.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 50vw, 360px"
                            />
                          </motion.div>
                        </motion.div>

                        {/* Gradient Overlay on Hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Category Name Below Image */}
                  <p className="text-center text-base md:text-lg font-medium text-gray-800">
                    {category.name}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;
