"use client";

import { useState, use, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronDown,
} from "lucide-react";
import FilterDrawer from "@/components/shop/FilterDrawer";
import FilterSidebar, { FilterState } from "@/components/shop/FilterSidebar";
import { getCategoryData, getSubcategoryData } from "@/constants/categories";
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

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

export default function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category, subcategory } = use(params);
  const categoryData = getCategoryData(category);
  const subcategoryData = getSubcategoryData(category, subcategory);

  // اگر category یا subcategory پیدا نشد، صفحه 404 نمایش بده
  if (!categoryData || !subcategoryData) {
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
          subcategory: subcategory,
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
    subcategory,
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

  // ✅ Conditional Rendering: بررسی می‌کنیم که آیا این subcategory نیاز به description داره یا نه
  const shouldShowDescription =
    (category === "kids" && subcategory === "bracelet") ||
    (category === "kids" && subcategory === "earring") ||
    (category === "kids" && subcategory === "pendant") ||
    (category === "kids" && subcategory === "leather-gold-bracelet") ||
    (category === "men" && subcategory === "necklace") ||
    (category === "men" && subcategory === "bracelet") ||
    (category === "men" && subcategory === "leather-gold-bracelet") ||
    (category === "women" && subcategory === "necklace") ||
    (category === "women" && subcategory === "bracelet") ||
    (category === "women" && subcategory === "leather-gold-bracelet") ||
    (category === "women" && subcategory === "earring") ||
    (category === "women" && subcategory === "ring") ||
    (category === "women" && subcategory === "pendant") ||
    (category === "women" && subcategory === "piercing") ||
    (category === "women" && subcategory === "anklet");

  // محتوای description برای هر subcategory
  const getDescriptionContent = () => {
    return {
      title: `درباره ${subcategoryData.name}`,
      paragraphs: [
        `${subcategoryData.name} گالری اسب با طراحی‌های منحصر به فرد و استفاده از بهترین مواد اولیه، برای شما عزیزان تهیه شده است. تمامی محصولات با دقت و ظرافت خاصی ساخته شده‌اند.`,
        `مجموعه ${subcategoryData.name} ما شامل طرح‌های متنوعی است که هر کدام با توجه به سلیقه‌های مختلف طراحی شده‌اند. از کلاسیک تا مدرن، از ساده تا پرزرق و برق، هر آنچه که نیاز دارید در گالری اسب پیدا می‌کنید.`,
        `تمامی محصولات ما دارای گارانتی اصالت بوده و با بسته‌بندی مخصوص به دست شما می‌رسند. برای انتخاب بهترین ${subcategoryData.name}، می‌توانید از مشاوران ما کمک بگیرید.`,
      ],
    };
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
          alt={`${subcategoryData.name} ${categoryData.title}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-end justify-start p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#e8f5e9] drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
            {subcategoryData.name} {categoryData.title}
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
            <Link
              href={`/products/${category}`}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              محصولات {categoryData.title}
            </Link>
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">
              {subcategoryData.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Filter Sidebar - Desktop Only */}
        <aside className="hidden lg:block">
          <FilterSidebar
            onFilterChange={setFilters}
            initialFilters={filters}
            onClearAll={() => setSortBy("")}
          />
        </aside>

        {/* Products Section */}
        <main className="flex-1 px-4 sm:px-6 pt-[5px] pb-6 lg:pb-8">
          {/* Filter Button & Sort */}
          <div className="flex items-center justify-between lg:justify-end gap-4 my-[1.25rem]">
            {/* Filter Button - Mobile/Tablet */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm">فیلترها</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 px-3 py-2 pl-10 pr-3 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer text-right"
                dir="rtl"
              >
                <option value="">مرتب کردن</option>
                <option value="newest">جدیدترین</option>
                <option value="oldest">قدیمی‌ترین</option>
                <option value="price-low">ارزان‌ترین</option>
                <option value="price-high">گران‌ترین</option>
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
                className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 transition-opacity duration-300 ${
                  loading ? "opacity-50" : "opacity-100"
                }`}
              >
                {currentProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && currentProducts.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-1 sm:gap-2" dir="ltr">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
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
                        onClick={() => handlePageChange(page)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
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
            </div>
          )}
        </main>
      </div>

      {/* ✅ Conditional Rendering: Description Section (فقط برای صفحاتی که نیاز دارن) */}
      {shouldShowDescription && (
        <>
          {/* Divider */}
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent origin-center"
              />
            </div>
          </div>

          {/* Description Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-right">
                {getDescriptionContent().title}
              </h2>
              <div className="space-y-4 text-gray-700 text-right leading-relaxed">
                {getDescriptionContent().paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

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

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const productImage = product.images[0] || "/images/products/product1.webp";
  const productHoverImage =
    product.images[1] ||
    product.images[0] ||
    "/images/products/product1-1.webp";
  const productHref = `/${product.category.slug}/${product.slug}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      <Link href={productHref}>
        <div
          className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-gray-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={productImage}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <Image
            src={productHoverImage}
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
          <p className="text-xs text-gray-600">
            {product.price.toLocaleString("fa-IR")} تومان
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
