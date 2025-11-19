"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const FilterSidebar = () => {
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 900000000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedKarats, setSelectedKarats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedWages, setSelectedWages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCoatings, setSelectedCoatings] = useState<string[]>([]);
  const [weightRange, setWeightRange] = useState([0, 100]);
  const [lowCommission, setLowCommission] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);

  // Accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: false,
    price: false,
    color: false,
    karat: false,
    weight: false,
    brand: false,
    branch: false,
    wage: false,
    size: false,
    coating: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const brands = [
    { id: "brand1", label: "برند 1" },
    { id: "brand2", label: "برند 2" },
    { id: "brand3", label: "برند 3" },
    { id: "brand4", label: "برند 4" },
  ];

  const colors = [
    { id: "gold", label: "طلایی", hex: "#FFD700" },
    { id: "silver", label: "نقره‌ای", hex: "#C0C0C0" },
    { id: "rose-gold", label: "رزگلد", hex: "#B76E79" },
    { id: "white", label: "سفید", hex: "#FFFFFF" },
  ];

  const karats = [
    { id: "18", label: "۱۸ عیار" },
    { id: "21", label: "۲۱ عیار" },
    { id: "24", label: "۲۴ عیار" },
  ];

  const branches = [
    { id: "horse-gallery", label: "Horse Gallery" },
    { id: "branch2", label: "شعبه 2" },
    { id: "branch3", label: "شعبه 3" },
  ];

  const wages = [
    { id: "low", label: "کم" },
    { id: "medium", label: "متوسط" },
    { id: "high", label: "زیاد" },
  ];

  const sizes = [
    { id: "small", label: "کوچک" },
    { id: "medium", label: "متوسط" },
    { id: "large", label: "بزرگ" },
  ];

  const coatings = [
    { id: "rhodium", label: "رودیوم" },
    { id: "gold", label: "طلا" },
    { id: "none", label: "بدون پوشش" },
  ];

  const toggleColor = (id: string) => {
    setSelectedColors((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleKarat = (id: string) => {
    setSelectedKarats((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleBranch = (id: string) => {
    setSelectedBranches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleWage = (id: string) => {
    setSelectedWages((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const toggleSize = (id: string) => {
    setSelectedSizes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleCoating = (id: string) => {
    setSelectedCoatings((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedKarats([]);
    setSelectedBrands([]);
    setSelectedBranches([]);
    setSelectedWages([]);
    setSelectedSizes([]);
    setSelectedCoatings([]);
    setPriceRange([0, 900000000]);
    setWeightRange([0, 100]);
    setLowCommission(false);
    setInStock(false);
    setOnSale(false);
  };

  const applyFilters = () => {
    console.log({
      categories: selectedCategories,
      priceRange,
      weightRange,
      colors: selectedColors,
      karats: selectedKarats,
      brands: selectedBrands,
      branches: selectedBranches,
      wages: selectedWages,
      sizes: selectedSizes,
      coatings: selectedCoatings,
      lowCommission,
      inStock,
      onSale,
    });
  };

  return (
    <div className="sticky top-[104px] right-0 w-80 h-[calc(100vh-104px)] bg-white shadow-2xl flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-primary flex-shrink-0">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-white" />
          <h2 className="text-lg font-normal text-white">فیلترها</h2>
        </div>
      </div>

      {/* Filters Content - Scrollable */}
      <div
        className="flex-1 overflow-y-scroll p-4 space-y-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e0 #f7fafc",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 8px;
            display: block;
          }
          div::-webkit-scrollbar-track {
            background: #f7fafc;
            display: block;
          }
          div::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 4px;
            display: block;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
          }
        `}</style>
        {/* Price Range Filter */}
        <div className="border-b border-gray-200 pb-2">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            محدوده قیمت
          </h3>
          <div className="space-y-3">
            <div className="pt-1 pb-1" dir="ltr">
              <Slider
                min={0}
                max={900000000}
                step={1000000}
                value={priceRange}
                onValueChange={(value) =>
                  setPriceRange(value as [number, number])
                }
                className="w-full"
                inverted
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-right">
                <label className="text-sm text-gray-600 mb-1 block">
                  از (تومان)
                </label>
                <input
                  type="text"
                  value={priceRange[0].toLocaleString("fa-IR")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    const numValue = parseInt(value) || 0;
                    setPriceRange([
                      Math.min(numValue, priceRange[1]),
                      priceRange[1],
                    ]);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 bg-[#faf6f0] text-sm text-gray-900 focus:border-primary focus:outline-none text-right"
                  placeholder="۰"
                />
              </div>
              <div className="text-right">
                <label className="text-sm text-gray-600 mb-1 block">
                  تا (تومان)
                </label>
                <input
                  type="text"
                  value={priceRange[1].toLocaleString("fa-IR")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    const numValue = parseInt(value) || 900000000;
                    setPriceRange([
                      priceRange[0],
                      Math.max(numValue, priceRange[0]),
                    ]);
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 bg-[#faf6f0] text-sm text-gray-900 focus:border-primary focus:outline-none text-right"
                  placeholder="۹۰۰٬۰۰۰٬۰۰۰"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weight Range Filter */}
        <div className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection("weight")}
            className="flex items-center justify-between w-full text-right py-1"
          >
            <h3 className="text-sm font-medium text-gray-900">وزن محصول</h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                openSections.weight ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openSections.weight && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 mt-2">
                  <div className="pt-1 pb-1" dir="ltr">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={weightRange}
                      onValueChange={(value) =>
                        setWeightRange(value as [number, number])
                      }
                      className="w-full"
                      inverted
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-right">
                      <label className="text-sm text-gray-600 mb-1 block">
                        از (گرم)
                      </label>
                      <input
                        type="text"
                        value={weightRange[0].toLocaleString("fa-IR")}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          const numValue = parseInt(value) || 0;
                          setWeightRange([
                            Math.min(numValue, weightRange[1]),
                            weightRange[1],
                          ]);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 bg-[#faf6f0] text-sm text-gray-900 focus:border-primary focus:outline-none text-right"
                        placeholder="۰"
                      />
                    </div>
                    <div className="text-right">
                      <label className="text-sm text-gray-600 mb-1 block">
                        تا (گرم)
                      </label>
                      <input
                        type="text"
                        value={weightRange[1].toLocaleString("fa-IR")}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          const numValue = parseInt(value) || 100;
                          setWeightRange([
                            weightRange[0],
                            Math.max(numValue, weightRange[0]),
                          ]);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 bg-[#faf6f0] text-sm text-gray-900 focus:border-primary focus:outline-none text-right"
                        placeholder="۱۰۰"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Color Filter */}
        <div className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection("color")}
            className="flex items-center justify-between w-full text-right py-1"
          >
            <h3 className="text-sm font-medium text-gray-900">رنگ</h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                openSections.color ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openSections.color && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => toggleColor(color.id)}
                      className={`flex flex-col items-center gap-1.5 p-2 border-2 transition-all ${
                        selectedColors.includes(color.id)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 border-2 ${
                          selectedColors.includes(color.id)
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] text-gray-700 text-center leading-tight">
                        {color.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Karat Filter */}
        <div className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection("karat")}
            className="flex items-center justify-between w-full text-right py-1"
          >
            <h3 className="text-sm font-medium text-gray-900">عیار طلا</h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                openSections.karat ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openSections.karat && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {karats.map((karat) => (
                    <label
                      key={karat.id}
                      className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 border border-gray-300 hover:border-primary transition-all bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedKarats.includes(karat.id)}
                        onChange={() => toggleKarat(karat.id)}
                        className="peer sr-only"
                      />
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 transition-all peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                        {selectedKarats.includes(karat.id) && (
                          <svg
                            className="w-2 h-2 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                        {karat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brand Filter */}
        <div className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection("brand")}
            className="flex items-center justify-between w-full text-right py-1"
          >
            <h3 className="text-sm font-medium text-gray-900">برند</h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                openSections.brand ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openSections.brand && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 border border-gray-300 hover:border-primary transition-all bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => toggleBrand(brand.id)}
                        className="peer sr-only"
                      />
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 transition-all peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                        {selectedBrands.includes(brand.id) && (
                          <svg
                            className="w-2 h-2 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                        {brand.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Branch Filter */}
        <div className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection("branch")}
            className="flex items-center justify-between w-full text-right py-1"
          >
            <h3 className="text-sm font-medium text-gray-900">شعبه</h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                openSections.branch ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openSections.branch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {branches.map((branch) => (
                    <label
                      key={branch.id}
                      className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 border border-gray-300 hover:border-primary transition-all bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBranches.includes(branch.id)}
                        onChange={() => toggleBranch(branch.id)}
                        className="peer sr-only"
                      />
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 transition-all peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                        {selectedBranches.includes(branch.id) && (
                          <svg
                            className="w-2 h-2 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                        {branch.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wage Filter */}
        <div className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection("wage")}
            className="flex items-center justify-between w-full text-right py-1"
          >
            <h3 className="text-sm font-medium text-gray-900">اجرت</h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                openSections.wage ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openSections.wage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {wages.map((wage) => (
                    <label
                      key={wage.id}
                      className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 border border-gray-300 hover:border-primary transition-all bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedWages.includes(wage.id)}
                        onChange={() => toggleWage(wage.id)}
                        className="peer sr-only"
                      />
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 transition-all peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                        {selectedWages.includes(wage.id) && (
                          <svg
                            className="w-2 h-2 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                        {wage.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Size Filter */}
        <div className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection("size")}
            className="flex items-center justify-between w-full text-right py-1"
          >
            <h3 className="text-sm font-medium text-gray-900">سایز</h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                openSections.size ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openSections.size && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {sizes.map((size) => (
                    <label
                      key={size.id}
                      className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 border border-gray-300 hover:border-primary transition-all bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size.id)}
                        onChange={() => toggleSize(size.id)}
                        className="peer sr-only"
                      />
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 transition-all peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                        {selectedSizes.includes(size.id) && (
                          <svg
                            className="w-2 h-2 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                        {size.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Coating Filter */}
        <div className="border-b border-gray-200 pb-2">
          <button
            onClick={() => toggleSection("coating")}
            className="flex items-center justify-between w-full text-right py-1"
          >
            <h3 className="text-sm font-medium text-gray-900">پوشش</h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${
                openSections.coating ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {openSections.coating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {coatings.map((coating) => (
                    <label
                      key={coating.id}
                      className="flex items-center gap-1.5 cursor-pointer group px-2 py-1 border border-gray-300 hover:border-primary transition-all bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCoatings.includes(coating.id)}
                        onChange={() => toggleCoating(coating.id)}
                        className="peer sr-only"
                      />
                      <div className="w-3.5 h-3.5 border-2 border-gray-300 transition-all peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
                        {selectedCoatings.includes(coating.id) && (
                          <svg
                            className="w-2 h-2 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                        {coating.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Special Features - Not in Accordion */}
        <div className="space-y-2 pt-1">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            ویژگی‌های خاص
          </h3>

          {/* In Stock */}
          <label className="flex items-center justify-between cursor-pointer group p-2 border border-gray-200 hover:border-primary/30 transition-all bg-white">
            <div className="flex-1 text-right ml-2">
              <span className="text-sm font-medium text-gray-800 block group-hover:text-primary transition-colors">
                محصولات موجود
              </span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={inStock}
                onChange={() => setInStock(!inStock)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer peer-checked:bg-primary transition-all">
                <div
                  className={`absolute top-0.5 right-0.5 w-4 h-4 bg-white shadow-sm transition-transform ${
                    inStock ? "translate-x-[-16px]" : ""
                  }`}
                ></div>
              </div>
            </div>
          </label>

          {/* On Sale */}
          <label className="flex items-center justify-between cursor-pointer group p-2 border border-gray-200 hover:border-primary/30 transition-all bg-white">
            <div className="flex-1 text-right ml-2">
              <span className="text-sm font-medium text-gray-800 block group-hover:text-primary transition-colors">
                محصولات تخفیف‌دار
              </span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={onSale}
                onChange={() => setOnSale(!onSale)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer peer-checked:bg-primary transition-all">
                <div
                  className={`absolute top-0.5 right-0.5 w-4 h-4 bg-white shadow-sm transition-transform ${
                    onSale ? "translate-x-[-16px]" : ""
                  }`}
                ></div>
              </div>
            </div>
          </label>

          {/* Low Commission */}
          <label className="flex items-center justify-between cursor-pointer group p-2 border border-gray-200 hover:border-primary/30 transition-all bg-white">
            <div className="flex-1 text-right ml-2">
              <span className="text-sm font-medium text-gray-800 block group-hover:text-primary transition-colors">
                کارمزد کم
              </span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={lowCommission}
                onChange={() => setLowCommission(!lowCommission)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer peer-checked:bg-primary transition-all">
                <div
                  className={`absolute top-0.5 right-0.5 w-4 h-4 bg-white shadow-sm transition-transform ${
                    lowCommission ? "translate-x-[-16px]" : ""
                  }`}
                ></div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 space-y-1.5 bg-gray-50">
        <button
          onClick={applyFilters}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-1.5 px-4 transition-colors text-sm"
        >
          اعمال فیلترها
        </button>
        <button
          onClick={clearAllFilters}
          className="w-full bg-white hover:bg-gray-100 text-gray-700 font-medium py-1.5 px-4 border border-gray-300 transition-colors text-sm"
        >
          پاک کردن همه
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
