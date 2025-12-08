"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface Product {
  name: string;
  price: string;
  image: string;
  hoverImage: string;
  slug: string;
}

interface CoinGoldProductCardProps {
  product: Product;
  category: string;
}

export default function CoinGoldProductCard({
  product,
  category,
}: CoinGoldProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="overflow-hidden transition-all flex flex-col"
    >
      <Link href={`/${category}/${product.slug}`} className="flex flex-col">
        <div
          className="relative w-full aspect-square overflow-hidden cursor-pointer rounded border border-gray-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
          <Image
            src={product.hoverImage}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        </div>

        <div className="p-3 text-center">
          <h3 className="text-sm font-medium text-gray-800 truncate mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 font-bold">{product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
}
