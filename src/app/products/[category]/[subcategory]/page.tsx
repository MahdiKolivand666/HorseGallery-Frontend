"use client";

import { useState, use, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
} from "lucide-react";
import FilterDrawer from "@/components/shop/FilterDrawer";
import FilterSidebar, { FilterState } from "@/components/shop/FilterSidebar";
import ProductCard from "@/components/shop/ProductCard";
import { getCategoryData, getSubcategoryData } from "@/constants/categories";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/api/products";

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
  const productsPerPage = 12;

  // Filter positioning (like GiftSection)
  const sectionRef = useRef<HTMLDivElement>(null);
  const [filterStyle, setFilterStyle] = useState<React.CSSProperties>({});
  const navbarHeight = 105;

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({
          productType: "jewelry",
          category,
          subcategory,
          limit: 100,
          sortBy: sortBy || undefined,
          minPrice:
            filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          maxPrice:
            filters.priceRange[1] < 900000000
              ? filters.priceRange[1]
              : undefined,
          colors:
            filters.selectedColors.length > 0
              ? filters.selectedColors
              : undefined,
          karats:
            filters.selectedKarats.length > 0
              ? filters.selectedKarats
              : undefined,
          brands:
            filters.selectedBrands.length > 0
              ? filters.selectedBrands
              : undefined,
          branches:
            filters.selectedBranches.length > 0
              ? filters.selectedBranches
              : undefined,
          wages:
            filters.selectedWages.length > 0
              ? filters.selectedWages
              : undefined,
          sizes:
            filters.selectedSizes.length > 0
              ? filters.selectedSizes
              : undefined,
          coatings:
            filters.selectedCoatings.length > 0
              ? filters.selectedCoatings
              : undefined,
          minWeight:
            filters.weightRange[0] > 0 ? filters.weightRange[0] : undefined,
          maxWeight:
            filters.weightRange[1] < 100 ? filters.weightRange[1] : undefined,
          lowCommission: filters.lowCommission || undefined,
          inStock: filters.inStock || undefined,
          onSale: filters.onSale || undefined,
        });
        setProducts(response.data);
        setCurrentPage(1); // Reset to first page when filters change
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory, sortBy, filters]);

  // Filter positioning
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const windowHeight = window.innerHeight;

      if (sectionTop <= navbarHeight && sectionBottom > windowHeight) {
        // Section is being scrolled through - fix the filter
        setFilterStyle({
          position: "fixed",
          top: navbarHeight,
          right: 0,
        });
      } else if (sectionBottom <= windowHeight) {
        // Section is scrolled past - position at bottom
        setFilterStyle({
          position: "absolute",
          bottom: 0,
          right: 0,
        });
      } else {
        // Section hasn't reached top yet - position at top
        setFilterStyle({
          position: "absolute",
          top: 0,
          right: 0,
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
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

      {/* Main Content with Sidebar */}
      <div ref={sectionRef} className="relative min-h-[calc(100vh-105px)]">
        {/* Filter Sidebar - Desktop Only */}
        <aside
          className="hidden lg:block w-80 h-[calc(100vh-105px)] z-40"
          style={filterStyle}
        >
          <FilterSidebar
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </aside>

        {/* Products Section */}
        <main className="px-4 sm:px-6 pt-[5px] pb-6 lg:pb-8 lg:mr-80">
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
            <div className="flex items-center">
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
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="price-low">ارزان‌ترین</option>
                  <option value="price-high">گران‌ترین</option>
                  <option value="popular">محبوب‌ترین</option>
                </select>
                <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">در حال بارگذاری محصولات...</p>
                </div>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">
                  هیچ محصولی در این دسته‌بندی یافت نشد.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-6 justify-center">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={{
                      name: product.name,
                      price: `${product.price.toLocaleString("fa-IR")} تومان`,
                      discountPrice: product.discountPrice
                        ? `${product.discountPrice.toLocaleString(
                            "fa-IR"
                          )} تومان`
                        : undefined,
                      image:
                        product.images[0] || "/images/products/product1.webp",
                      hoverImage:
                        product.images[1] ||
                        product.images[0] ||
                        "/images/products/product1-1.webp",
                      slug: product.slug,
                      onSale: product.onSale,
                      discount: product.discount,
                    }}
                    category={product.category.slug}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                aria-label={t("ariaLabels.previousPage")}
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
                aria-label={t("ariaLabels.nextPage")}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
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
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />
    </div>
  );
}
