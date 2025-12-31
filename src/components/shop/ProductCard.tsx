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
  onSale?: boolean;
  discount?: number;
  discountPrice?: string;
  lowCommission?: boolean; // ✅ آیا محصول اجرت کم دارد؟ (پیشنهاد ویژه)
}

interface ProductCardProps {
  product: Product;
  category: string;
}

export default function ProductCard({ product, category }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="overflow-hidden transition-all w-full max-w-[300px] flex flex-col"
    >
      <Link href={`/${category}/${product.slug}`} className="flex flex-col">
        <div
          className="relative w-full aspect-square overflow-hidden cursor-pointer rounded border border-gray-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Badges */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            {/* Discount Badge - اولویت اول */}
            {product.onSale && product.discount && product.discount > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount.toLocaleString("fa-IR")}% تخفیف
              </div>
            )}
            {/* Low Commission Badge - پیشنهاد ویژه (کم اجرت) - فقط اگر تخفیف نداشته باشد */}
            {product.lowCommission &&
              (!product.onSale ||
                !product.discount ||
                product.discount === 0) && (
                <div className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                  کم اجرت
                </div>
              )}
          </div>

          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 300px"
          />
          <Image
            src={product.hoverImage}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 300px"
          />
        </div>

        <div className="p-3 text-center">
          <h3 className="text-sm font-medium text-gray-800 truncate mb-1">
            {product.name}
          </h3>
          {product.onSale && product.discountPrice ? (
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm text-red-600 font-bold">
                {product.discountPrice}
              </p>
              <p className="text-xs text-gray-400 line-through">
                {product.price}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 font-bold">{product.price}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
