"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { createPortal } from "react-dom";
import { Slider } from "@/components/ui/slider";
import type { FilterState } from "./FilterSidebar";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  onClearAll?: () => void;
}

const FilterDrawer = ({ isOpen, onClose, onFilterChange, initialFilters, onClearAll }: FilterDrawerProps) => {
  const [mounted, setMounted] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0, 900000000,
  ]);
  const [priceInputs, setPriceInputs] = useState({ min: "0", max: "900000000" });
  const [weightRange, setWeightRange] = useState<[number, number]>([0, 100]);
  const [weightInputs, setWeightInputs] = useState({ min: "0", max: "100" });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedKarats, setSelectedKarats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedWages, setSelectedWages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCoatings, setSelectedCoatings] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [lowCommission, setLowCommission] = useState(false);

  // Convert to Persian digits
  const toPersianDigits = (str: string): string => {
    return str.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
  };

  // Format number with Persian digits and thousand separators
  const formatPersianNumber = (num: string): string => {
    if (!num) return "";
    // Convert Persian to English first
    const english = num.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
    // Remove non-digits
    const digits = english.replace(/\D/g, "");
    if (!digits) return "";
    // Add thousand separators
    const formatted = parseInt(digits).toLocaleString("en-US");
    // Convert to Persian digits
    return toPersianDigits(formatted);
  };

  // Get display value for input - always formatted with Persian digits and commas
  const getPriceDisplayValue = (value: string): string => {
    return formatPersianNumber(value);
  };

  const getWeightDisplayValue = (value: string): string => {
    return formatPersianNumber(value);
  };

  const colors = [
    { id: "gold", name: "طلایی", value: "#FFD700" },
    { id: "silver", name: "نقره‌ای", value: "#C0C0C0" },
    { id: "rose-gold", name: "رزگلد", value: "#B76E79" },
    { id: "white-gold", name: "طلای سفید", value: "#F5F5F5" },
  ];

  const karats = ["18", "21", "24"];

  const brands = [
    "Horse Gallery",
    "برند 2",
    "برند 3",
    "برند 4",
    "برند 5",
    "برند 6",
  ];

  const branches = ["Horse Gallery", "شعبه 2", "شعبه 3"];

  const wages = ["کم", "متوسط", "زیاد"];

  const sizes = ["کوچک", "متوسط", "بزرگ"];

  const coatings = ["رودیوم", "طلا", "بدون پوشش"];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize filters from props (فقط یکبار در mount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.priceRange) {
        setPriceRange(initialFilters.priceRange);
        setPriceInputs({
          min: initialFilters.priceRange[0].toString(),
          max: initialFilters.priceRange[1].toString(),
        });
      }
      if (initialFilters.selectedColors) setSelectedColors(initialFilters.selectedColors);
      if (initialFilters.selectedKarats) setSelectedKarats(initialFilters.selectedKarats);
      if (initialFilters.selectedBrands) setSelectedBrands(initialFilters.selectedBrands);
      if (initialFilters.selectedBranches) setSelectedBranches(initialFilters.selectedBranches);
      if (initialFilters.selectedWages) setSelectedWages(initialFilters.selectedWages);
      if (initialFilters.selectedSizes) setSelectedSizes(initialFilters.selectedSizes);
      if (initialFilters.selectedCoatings) setSelectedCoatings(initialFilters.selectedCoatings);
      if (initialFilters.weightRange) {
        setWeightRange(initialFilters.weightRange);
        setWeightInputs({
          min: initialFilters.weightRange[0].toString(),
          max: initialFilters.weightRange[1].toString(),
        });
      }
      if (initialFilters.lowCommission !== undefined) setLowCommission(initialFilters.lowCommission);
      if (initialFilters.inStock !== undefined) setInStock(initialFilters.inStock);
      if (initialFilters.onSale !== undefined) setOnSale(initialFilters.onSale);
    }
  }, []); // فقط یکبار در mount اجرا بشه

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const toggleColor = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId)
        ? prev.filter((id) => id !== colorId)
        : [...prev, colorId]
    );
  };

  const toggleKarat = (karat: string) => {
    setSelectedKarats((prev) =>
      prev.includes(karat)
        ? prev.filter((k) => k !== karat)
        : [...prev, karat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch)
        ? prev.filter((b) => b !== branch)
        : [...prev, branch]
    );
  };

  const toggleWage = (wage: string) => {
    setSelectedWages((prev) =>
      prev.includes(wage) ? prev.filter((w) => w !== wage) : [...prev, wage]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleCoating = (coating: string) => {
    setSelectedCoatings((prev) =>
      prev.includes(coating)
        ? prev.filter((c) => c !== coating)
        : [...prev, coating]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([0, 900000000]);
    setPriceInputs({ min: "0", max: "900000000" });
    setWeightRange([0, 100]);
    setWeightInputs({ min: "0", max: "100" });
    setSelectedColors([]);
    setSelectedKarats([]);
    setSelectedBrands([]);
    setSelectedBranches([]);
    setSelectedWages([]);
    setSelectedSizes([]);
    setSelectedCoatings([]);
    setInStock(false);
    setOnSale(false);
    setLowCommission(false);

    // Apply cleared filters
    if (onFilterChange) {
      onFilterChange({
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
        sortBy: "",
      });
    }

    // Reset sortBy and other states in parent
    if (onClearAll) {
      onClearAll();
    }
  };

  const applyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        selectedCategories: [],
        priceRange,
        selectedColors,
        selectedKarats,
        selectedBrands,
        selectedBranches,
        selectedWages,
        selectedSizes,
        selectedCoatings,
        weightRange,
        lowCommission,
        inStock,
        onSale,
      });
    }
    onClose();
  };

  if (!mounted) return null;

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-md bg-white shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between py-2 px-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-base font-normal text-gray-900">فیلترها</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="بستن"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
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

              {/* Price Range Filter - Always Visible */}
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
                      onValueChange={(value) => {
                        const range = value as [number, number];
                        setPriceRange(range);
                        setPriceInputs({
                          min: range[0].toString(),
                          max: range[1].toString(),
                        });
                      }}
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
                        value={getPriceDisplayValue(priceInputs.min)}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Convert Persian to English and remove non-digits
                          const english = value.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
                          const cleanValue = english.replace(/[^0-9]/g, "");
                          const numValue = parseInt(cleanValue) || 0;
                          setPriceInputs({ ...priceInputs, min: cleanValue });
                          setPriceRange([
                            Math.min(numValue, priceRange[1]),
                            priceRange[1],
                          ]);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 bg-[#faf6f0] text-sm text-gray-900 focus:border-primary focus:outline-none text-center"
                        placeholder="۰"
                      />
                    </div>
                    <div className="text-right">
                      <label className="text-sm text-gray-600 mb-1 block">
                        تا (تومان)
                      </label>
                      <input
                        type="text"
                        value={getPriceDisplayValue(priceInputs.max)}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Convert Persian to English and remove non-digits
                          const english = value.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
                          const cleanValue = english.replace(/[^0-9]/g, "");
                          const numValue = parseInt(cleanValue) || 900000000;
                          setPriceInputs({ ...priceInputs, max: cleanValue });
                          setPriceRange([
                            priceRange[0],
                            Math.max(numValue, priceRange[0]),
                          ]);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 bg-[#faf6f0] text-sm text-gray-900 focus:border-primary focus:outline-none text-center"
                        placeholder="۹۰۰,۰۰۰,۰۰۰"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Range Filter */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => toggleSection("weight")}
                  className="w-full flex items-center justify-between py-1"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    وزن محصول
                  </h3>
                  {openSections.includes("weight") ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {openSections.includes("weight") && (
                  <div className="space-y-3 mt-2">
                    <div className="pt-1 pb-1" dir="ltr">
                      <Slider
                        min={0}
                        max={100}
                        step={0.1}
                        value={weightRange}
                        onValueChange={(value) => {
                          const range = value as [number, number];
                          setWeightRange(range);
                          setWeightInputs({
                            min: range[0].toString(),
                            max: range[1].toString(),
                          });
                        }}
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
                          value={getWeightDisplayValue(weightInputs.min)}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Convert Persian to English and remove non-digits
                            const english = value.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
                            const cleanValue = english.replace(/[^0-9]/g, "");
                            const numValue = parseInt(cleanValue) || 0;
                            setWeightInputs({ ...weightInputs, min: cleanValue });
                            setWeightRange([
                              Math.min(numValue, weightRange[1]),
                              weightRange[1],
                            ]);
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 bg-[#faf6f0] text-sm text-gray-900 focus:border-primary focus:outline-none text-center"
                          placeholder="۰"
                        />
                      </div>
                      <div className="text-right">
                        <label className="text-sm text-gray-600 mb-1 block">
                          تا (گرم)
                        </label>
                        <input
                          type="text"
                          value={getWeightDisplayValue(weightInputs.max)}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Convert Persian to English and remove non-digits
                            const english = value.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
                            const cleanValue = english.replace(/[^0-9]/g, "");
                            const numValue = parseInt(cleanValue) || 100;
                            setWeightInputs({ ...weightInputs, max: cleanValue });
                            setWeightRange([
                              weightRange[0],
                              Math.max(numValue, weightRange[0]),
                            ]);
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 bg-[#faf6f0] text-sm text-gray-900 focus:border-primary focus:outline-none text-center"
                          placeholder="۱۰۰"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Filter */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => toggleSection("color")}
                  className="w-full flex items-center justify-between py-1"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    رنگ
                  </h3>
                  {openSections.includes("color") ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {openSections.includes("color") && (
                  <div className="space-y-2 mt-2">
                    {colors.map((color) => (
                      <label
                        key={color.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color.id)}
                          onChange={() => toggleColor(color.id)}
                          className="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0"
                        />
                        <div
                          className="w-5 h-5 border border-gray-300"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-sm text-gray-700">
                          {color.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Karat Filter */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => toggleSection("karat")}
                  className="w-full flex items-center justify-between py-1"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    عیار طلا
                  </h3>
                  {openSections.includes("karat") ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {openSections.includes("karat") && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {karats.map((karat) => (
                      <label
                        key={karat}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 border border-gray-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedKarats.includes(karat)}
                          onChange={() => toggleKarat(karat)}
                          className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700">
                          {karat} عیار
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand Filter */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => toggleSection("brand")}
                  className="w-full flex items-center justify-between py-1"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    برند
                  </h3>
                  {openSections.includes("brand") ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {openSections.includes("brand") && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 border border-gray-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Branch Filter */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => toggleSection("branch")}
                  className="w-full flex items-center justify-between py-1"
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    شعبه
                  </h3>
                  {openSections.includes("branch") ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {openSections.includes("branch") && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {branches.map((branch) => (
                      <label
                        key={branch}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 border border-gray-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBranches.includes(branch)}
                          onChange={() => toggleBranch(branch)}
                          className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700">{branch}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Wage Filter */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => toggleSection("wage")}
                  className="w-full flex items-center justify-between py-1"
                >
                  <h3 className="text-sm font-medium text-gray-900">اجرت</h3>
                  {openSections.includes("wage") ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {openSections.includes("wage") && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {wages.map((wage) => (
                      <label
                        key={wage}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 border border-gray-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedWages.includes(wage)}
                          onChange={() => toggleWage(wage)}
                          className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700">{wage}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Size Filter */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => toggleSection("size")}
                  className="w-full flex items-center justify-between py-1"
                >
                  <h3 className="text-sm font-medium text-gray-900">سایز</h3>
                  {openSections.includes("size") ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {openSections.includes("size") && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sizes.map((size) => (
                      <label
                        key={size}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 border border-gray-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSizes.includes(size)}
                          onChange={() => toggleSize(size)}
                          className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Coating Filter */}
              <div className="border-b border-gray-200 pb-2">
                <button
                  onClick={() => toggleSection("coating")}
                  className="w-full flex items-center justify-between py-1"
                >
                  <h3 className="text-sm font-medium text-gray-900">پوشش</h3>
                  {openSections.includes("coating") ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                {openSections.includes("coating") && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coatings.map((coating) => (
                      <label
                        key={coating}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 border border-gray-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCoatings.includes(coating)}
                          onChange={() => toggleCoating(coating)}
                          className="w-3.5 h-3.5 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700">{coating}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* In Stock Products */}
              <div className="border-b border-gray-200 pb-2">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    محصولات موجود
                  </h3>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className={`toggle toggle-sm ${inStock ? 'toggle-primary' : ''}`}
                    style={!inStock ? {
                      backgroundColor: '#d1d5db',
                      borderColor: '#d1d5db'
                    } : undefined}
                  />
                </label>
              </div>

              {/* On Sale Products */}
              <div className="border-b border-gray-200 pb-2">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    محصولات تخفیف‌دار
                  </h3>
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={(e) => setOnSale(e.target.checked)}
                    className={`toggle toggle-sm ${onSale ? 'toggle-primary' : ''}`}
                    style={!onSale ? {
                      backgroundColor: '#d1d5db',
                      borderColor: '#d1d5db'
                    } : undefined}
                  />
                </label>
              </div>

              {/* Low Commission Products */}
              <div className="border-b border-gray-200 pb-2">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    محصولات با کارمزد کم
                  </h3>
                  <input
                    type="checkbox"
                    checked={lowCommission}
                    onChange={(e) => setLowCommission(e.target.checked)}
                    className={`toggle toggle-sm ${lowCommission ? 'toggle-primary' : ''}`}
                    style={!lowCommission ? {
                      backgroundColor: '#d1d5db',
                      borderColor: '#d1d5db'
                    } : undefined}
                  />
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-3 border-t border-gray-200 bg-white space-y-2">
              <button
                onClick={applyFilters}
                className="w-full bg-primary text-white py-2 hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                اعمال فیلترها
              </button>
              <button
                onClick={clearAllFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                پاک کردن همه
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(drawerContent, document.body);
};

export default FilterDrawer;

