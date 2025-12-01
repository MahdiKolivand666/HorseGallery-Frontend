"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
} from "lucide-react";
import FilterDrawer from "@/components/shop/FilterDrawer";
import FilterSidebar, { FilterState } from "@/components/shop/FilterSidebar";
import { getCategoryData } from "@/constants/categories";
import { notFound } from "next/navigation";
import { getProducts, ProductFilters } from "@/lib/api/products";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  category: {
    slug: string;
  };
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params);
  const categoryData = getCategoryData(category);

  // اگر category پیدا نشد، صفحه 404 نمایش بده
  if (!categoryData) {
    notFound();
  }

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const productsPerPage = 18;
  const [filters, setFilters] = useState<FilterState>({
    selectedCategories: [],
    priceRange: [0, 900000000],
    selectedColors: [],
    selectedKarats: [],
    selectedBrands: [],
    selectedBranches: [],
    selectedWages: [],
    selectedSizes: [],
    selectedCoatings: [],
    weightRange: [0, 100],
    lowCommission: false,
    inStock: false,
    onSale: false,
  });

  // Extract filter values for dependency array
  const minPrice = filters.priceRange[0];
  const maxPrice = filters.priceRange[1];
  const minWeight = filters.weightRange[0];
  const maxWeight = filters.weightRange[1];
  const colorsStr = JSON.stringify(filters.selectedColors);
  const karatsStr = JSON.stringify(filters.selectedKarats);
  const brandsStr = JSON.stringify(filters.selectedBrands);
  const branchesStr = JSON.stringify(filters.selectedBranches);
  const wagesStr = JSON.stringify(filters.selectedWages);
  const sizesStr = JSON.stringify(filters.selectedSizes);
  const coatingsStr = JSON.stringify(filters.selectedCoatings);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build filter parameters for API
        const apiFilters: ProductFilters = {
          category: category,
          page: currentPage,
          limit: productsPerPage,
          sortBy: sortBy || undefined,
          // Price range
          minPrice: minPrice,
          maxPrice: maxPrice,
          // Colors
          colors:
            filters.selectedColors.length > 0
              ? filters.selectedColors
              : undefined,
          // Karats
          karats:
            filters.selectedKarats.length > 0
              ? filters.selectedKarats
              : undefined,
          // Brands
          brands:
            filters.selectedBrands.length > 0
              ? filters.selectedBrands
              : undefined,
          // Branches
          branches:
            filters.selectedBranches.length > 0
              ? filters.selectedBranches
              : undefined,
          // Wages
          wages:
            filters.selectedWages.length > 0
              ? filters.selectedWages
              : undefined,
          // Sizes
          sizes:
            filters.selectedSizes.length > 0
              ? filters.selectedSizes
              : undefined,
          // Coatings
          coatings:
            filters.selectedCoatings.length > 0
              ? filters.selectedCoatings
              : undefined,
          // Weight range
          minWeight: minWeight,
          maxWeight: maxWeight,
          // Stock and sale
          inStock: filters.inStock || undefined,
          onSale: filters.onSale || undefined,
          lowCommission: filters.lowCommission || undefined,
        };

        const apiProducts = await getProducts(apiFilters);

        if (isMounted) {
          setProducts(apiProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    currentPage,
    sortBy,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    colorsStr,
    karatsStr,
    brandsStr,
    branchesStr,
    wagesStr,
    sizesStr,
    coatingsStr,
    filters.lowCommission,
    filters.inStock,
    filters.onSale,
  ]);

  const currentProducts = products;

  const totalPages = Math.ceil(products.length / productsPerPage);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری محصولات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] sm:pt-[105px] lg:pt-[105px]">
      {/* Hero Image */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96">
        <Image
          src={categoryData.heroImage}
          alt={`محصولات ${categoryData.title}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-end justify-start p-6 sm:p-8 lg:p-12">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#e8f5e9] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-wide">
            فروشگاه
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
            <span className="text-primary font-medium">
              محصولات {categoryData.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Filter Sidebar - Desktop Only */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-[180px]">
            <FilterSidebar
              onFilterChange={setFilters}
              initialFilters={filters}
              onClearAll={() => setSortBy("")}
            />
          </div>
        </aside>

        {/* Products Section */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Filter Button & Sort - Mobile/Tablet */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>فیلترها</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pl-10 pr-3 border border-gray-300 bg-white text-sm text-gray-900 focus:border-primary focus:outline-none cursor-pointer text-right"
                dir="rtl"
              >
                <option value="">مرتب کردن</option>
                <option value="newest">جدیدترین</option>
                <option value="price-asc">ارزان‌ترین</option>
                <option value="price-desc">گران‌ترین</option>
                <option value="popular">محبوب‌ترین</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Sort - Desktop Only */}
          <div className="hidden lg:flex items-center justify-end mb-6">
            <div className="relative my-[1.25rem]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pl-10 pr-3 border border-gray-300 bg-white text-sm text-gray-900 focus:border-primary focus:outline-none cursor-pointer text-right"
                dir="rtl"
              >
                <option value="">مرتب کردن</option>
                <option value="newest">جدیدترین</option>
                <option value="price-asc">ارزان‌ترین</option>
                <option value="price-desc">گران‌ترین</option>
                <option value="popular">محبوب‌ترین</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Products Grid with Loading Overlay */}
          <div className="relative min-h-[600px]">
            {/* Loading Overlay with Animation */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
                    <p className="mt-4 text-gray-700 font-medium text-lg">
                      در حال بارگذاری محصولات...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {currentProducts.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-20 text-center"
              >
                <p className="text-gray-600 text-lg">
                  هیچ محصولی با این فیلترها یافت نشد.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  لطفاً فیلترهای دیگری را امتحان کنید.
                </p>
              </motion.div>
            )}

            {/* Products Grid */}
            {currentProducts.length > 0 && (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
                  loading ? "opacity-50" : "opacity-100"
                }`}
              >
                {currentProducts.map((product) => {
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
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <Image
                            src={productHoverImage}
                            alt={product.name}
                            fill
                            className="object-cover absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-700">
                            {product.price.toLocaleString("fa-IR")} تومان
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && currentProducts.length > 0 && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
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
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="صفحه بعد"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Filter Drawer - Mobile/Tablet */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onFilterChange={setFilters}
        initialFilters={filters}
        onClearAll={() => setSortBy("")}
      />
    </div>
  );
}
