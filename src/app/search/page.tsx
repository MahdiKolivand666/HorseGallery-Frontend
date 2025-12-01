"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  ArrowRight,
} from "lucide-react";
import { searchProducts, SearchResponse } from "@/lib/api/products";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    if (query) {
      performSearch(query, currentPage, sortBy);
    } else {
      setLoading(false);
    }
  }, [query, currentPage, sortBy]);

  const performSearch = async (
    searchQuery: string,
    page: number,
    sort: string
  ) => {
    setLoading(true);
    try {
      const results = await searchProducts(searchQuery, page, 20, sort);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginationNumbers = () => {
    if (!searchResults) return [];

    const pages = [];
    const totalPages = searchResults.pagination.totalPages;
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

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[110px] sm:pt-[105px] lg:pt-[105px]">
        {/* Hero Image */}
        <div className="relative w-full h-64 sm:h-80 lg:h-96">
          <Image
            src="/images/aboutUs/search.webp"
            alt="جستجو در محصولات"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <div className="text-center">
              <Search className="w-16 h-16 text-white mx-auto mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-wide">
                جستجو در محصولات
              </h1>
              <p className="text-white mt-4 text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                لطفاً کلمه کلیدی خود را در باکس جستجو وارد کنید
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p className="text-gray-600">
              از منوی بالا می‌توانید محصولات را جستجو کنید
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] sm:pt-[105px] lg:pt-[105px]">
      {/* Hero Image */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96">
        <Image
          src="/images/aboutUs/search.webp"
          alt="نتایج جستجو"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-8 lg:p-12">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-wide">
            نتایج جستجو: &ldquo;{query}&rdquo;
          </h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">نتایج جستجو</span>
            {query && (
              <>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
                <span className="text-primary font-medium">
                  &ldquo;{query}&rdquo;
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6 group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <span className="text-sm">بازگشت به صفحه اصلی</span>
        </Link>

        {/* Results Count */}
        {!loading && searchResults && (
          <div className="mb-6 text-center">
            <p className="text-lg font-bold text-gray-800">
              {searchResults.pagination.totalItems.toLocaleString("fa-IR")}{" "}
              محصول یافت شد
            </p>
          </div>
        )}

        {/* Sort Options */}
        {!loading && searchResults && searchResults.data.length > 0 && (
          <div className="mb-6 flex items-center justify-end gap-3">
            <label className="text-sm text-gray-700">مرتب‌سازی:</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pl-10 pr-3 border border-gray-300 bg-white text-sm text-gray-900 focus:border-primary focus:outline-none cursor-pointer"
                dir="rtl"
              >
                <option value="">پیش‌فرض</option>
                <option value="newest">جدیدترین</option>
                <option value="price-asc">ارزان‌ترین</option>
                <option value="price-desc">گران‌ترین</option>
                <option value="popular">محبوب‌ترین</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mb-4"></div>
            <p className="text-gray-600">در حال جستجو...</p>
          </div>
        )}

        {/* Results */}
        {!loading && searchResults && (
          <>
            {searchResults.data.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white shadow-sm"
              >
                <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  نتیجه‌ای یافت نشد
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  متأسفانه محصولی با کلمه کلیدی &ldquo;
                  <span className="font-bold text-primary">{query}</span>&rdquo;
                  پیدا نکردیم. لطفاً با کلمات دیگری جستجو کنید یا محصولات ما را
                  مشاهده کنید.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/products/women"
                    className="inline-block px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    مشاهده محصولات
                  </Link>
                  <button
                    onClick={() => window.history.back()}
                    className="inline-block px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    بازگشت
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {searchResults.data.map((product) => {
                    const productImage =
                      product.images[0] || "/images/products/product1.webp";
                    const productHoverImage =
                      product.images[1] ||
                      product.images[0] ||
                      "/images/products/product1-1.webp";
                    const productHref = `/${product.category.slug}/${product.slug}`;

                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group"
                      >
                        <Link href={productHref}>
                          <div className="relative aspect-[3/4] overflow-hidden mb-3 border border-gray-300 rounded">
                            <Image
                              src={productImage}
                              alt={product.name}
                              fill
                              className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <Image
                              src={productHoverImage}
                              alt={product.name}
                              fill
                              className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />

                            {/* Discount Badge */}
                            {product.onSale && product.discount && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold z-10">
                                {product.discount}٪ تخفیف
                              </div>
                            )}

                            {/* Low Commission Badge */}
                            {product.lowCommission && (
                              <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 text-xs font-bold z-10">
                                پیشنهاد ویژه
                              </div>
                            )}
                          </div>

                          <div className="text-center">
                            <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Price Display */}
                            {product.onSale && product.discountPrice ? (
                              <div className="flex items-center justify-center gap-2">
                                <p className="text-sm font-bold text-red-600">
                                  {product.discountPrice.toLocaleString(
                                    "fa-IR"
                                  )}{" "}
                                  تومان
                                </p>
                                <p className="text-xs text-gray-500 line-through">
                                  {product.price.toLocaleString("fa-IR")}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-gray-900">
                                {product.price.toLocaleString("fa-IR")} تومان
                              </p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {searchResults.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="صفحه قبل"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>

                    {getPaginationNumbers().map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 text-gray-500"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`min-w-[40px] h-10 px-3 border transition-colors ${
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
                      disabled={
                        currentPage === searchResults.pagination.totalPages
                      }
                      className="p-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="صفحه بعد"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
