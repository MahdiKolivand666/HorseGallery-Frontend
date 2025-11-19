"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronDown,
} from "lucide-react";
import FilterDrawer from "@/components/shop/FilterDrawer";
import FilterSidebar from "@/components/shop/FilterSidebar";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  hoverImage: string;
}

const WomenBraceletPage = () => {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const productsPerPage = 18;

  const allProducts = Array.from({ length: 60 }, (_, i) => {
    const productNum = (i % 10) + 1;
    const hoverImagePath =
      productNum === 1
        ? `/images/products/product8-8.webp`
        : `/images/products/product${productNum}-${productNum}.webp`;

    return {
      id: i + 1,
      name: `دستبند شماره ${i + 1}`,
      price: `${((i + 1) * 150000).toLocaleString("fa-IR")} تومان`,
      image: `/images/products/product${productNum}.webp`,
      hoverImage: hoverImagePath,
    };
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = allProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(allProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative w-full h-64 sm:h-80 lg:h-96 mt-0">
        <Image
          src="/images/headerwallp/RTS.webp"
          alt="دستبند زنانه"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-end justify-start p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            دستبند زنانه
          </h1>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <Link
              href="/products/women"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              محصولات زنانه
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">دستبند</span>
          </nav>
        </div>
      </div>

      <div className="flex">
        <div className="hidden lg:block">
          <FilterSidebar />
        </div>

        <main className="flex-1 px-4 sm:px-6 pt-[5px] pb-6 lg:pb-8">
          <div className="flex items-center justify-between lg:justify-end gap-4 my-[1.25rem]">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">فیلترها</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700 font-medium">
                مرتب‌سازی:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 pr-6 py-1 pl-2 text-xs text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer text-right"
                  dir="rtl"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="price-low">ارزان‌ترین</option>
                  <option value="price-high">گران‌ترین</option>
                  <option value="popular">محبوب‌ترین</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
      />
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <div
        className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-gray-100"
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
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <Image
          src={product.hoverImage}
          alt={product.name}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>

      <div className="p-3 sm:p-4 text-center">
        <h3 className="text-sm font-medium text-gray-800 truncate mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-600">{product.price}</p>
      </div>
    </motion.div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= showPages; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav className="flex items-center gap-1 sm:gap-2" dir="ltr">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === 1
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="صفحه قبل"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          typeof page === "number" ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`min-w-[36px] h-9 px-3 rounded-lg border font-medium text-sm transition-colors ${
                currentPage === page
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page.toLocaleString("fa-IR")}
            </button>
          ) : (
            <span key={index} className="px-2 text-gray-400">
              ...
            </span>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg border transition-colors ${
          currentPage === totalPages
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="صفحه بعد"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default WomenBraceletPage;

