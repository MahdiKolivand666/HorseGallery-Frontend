"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { getProducts } from "@/lib/api/products";
import CoinGoldProductCard from "@/components/shop/CoinGoldProductCard";
import { Loading } from "@/components/ui/Loading";
import { useTranslations } from "next-intl";

interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  slug: string;
  category: {
    slug: string;
  };
  onSale?: boolean;
  discount?: number;
  lowCommission?: boolean;
}

export default function CoinPage() {
  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({
          productType: "coin",
          limit: 100,
          sortBy: sortBy || undefined,
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sortBy]);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Loading size="lg" text={tProducts("loading")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[110px] sm:pt-[105px] lg:pt-[105px]">
      {/* Hero Image */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96">
        <Image
          src="/images/headerwallp/coinwall2.png"
          alt={tCommon("alt.coinGold")}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-end justify-start p-6 sm:p-8 lg:p-12">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#e8f5e9] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-wide">
            سکه طلا
          </h1>
        </div>
      </div>

      {/* Breadcrumb */}
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
            <span className="text-primary font-medium">سکه طلا</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 pt-[5px] pb-6 lg:pb-8">
        {/* Sort */}
        <div className="flex items-center justify-end gap-4 my-[1.25rem]">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 pr-4 py-1 pl-8 text-xs text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer text-right"
              dir="rtl"
            >
              <option value="" disabled>
                مرتب‌سازی
              </option>
              <option value="inStock">موجود</option>
              <option value="outOfStock">ناموجود</option>
              <option value="weight-desc">از بیشترین وزن به کمترین</option>
              <option value="weight-asc">از کمترین وزن به بیشترین</option>
            </select>
            <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Products Grid - 4 columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {currentProducts.map((product) => (
              <CoinGoldProductCard
                key={product._id}
                product={{
                  name: product.name,
                  price: `${product.price.toLocaleString("fa-IR")} تومان`,
                  image: "/images/products/coinphoto.webp",
                  hoverImage: "/images/products/coinphoto.webp",
                  slug: product.slug,
                }}
                category={product.category.slug}
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
              aria-label={tCommon("ariaLabels.previousPage")}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            {getPaginationNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-3 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`min-w-[40px] h-10 px-3 border transition-colors rounded ${
                    currentPage === page
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {String(page)
                    .split("")
                    .map((digit) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(digit)])
                    .join("")}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
              aria-label={tCommon("ariaLabels.nextPage")}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
