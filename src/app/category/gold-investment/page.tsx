"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, ChevronLeft } from "lucide-react";
import { getProducts, Product } from "@/lib/api/products";

export default function GoldInvestmentPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "coin" | "melted_gold">(
    "all"
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getProducts({
          category: "gold-investment",
          limit: 100,
        });
        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((p) => p.productType === activeTab);

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28">
      {/* Hero Section */}
      <div className="relative h-[300px] sm:h-[400px] bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              💰 سرمایه‌گذاری طلا
            </h1>
            <p className="text-lg sm:text-xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              سکه و شمش طلا برای سرمایه‌گذاری
            </p>
          </div>
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
            <span className="text-primary font-medium">سرمایه‌گذاری طلا</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              همه ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("coin")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === "coin"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              🪙 سکه طلا (
              {products.filter((p) => p.productType === "coin").length})
            </button>
            <button
              onClick={() => setActiveTab("melted_gold")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === "melted_gold"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 شمش طلا (
              {products.filter((p) => p.productType === "melted_gold").length})
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-4 text-gray-700 font-medium text-lg">
              در حال بارگذاری محصولات...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <p className="text-gray-600 text-lg">
              هیچ محصولی در این دسته‌بندی یافت نشد.
            </p>
          </motion.div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const productImage =
    product.productType === "coin"
      ? "/images/products/coinphoto.webp"
      : product.productType === "melted_gold"
      ? "/images/products/goldbarphoto.webp"
      : product.images[0] || "/images/products/product1.webp";

  const productHref = `/${product.category.slug}/${product.slug}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white overflow-hidden border border-gray-300 rounded"
    >
      <Link href={productHref}>
        <div
          className="relative aspect-[3/4] overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={productImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badge نوع محصول */}
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
              {product.productType === "coin" ? "🪙 سکه" : "📊 شمش"}
            </span>
          </div>
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

