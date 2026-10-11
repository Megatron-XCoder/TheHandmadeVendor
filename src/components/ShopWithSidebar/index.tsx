"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import shopData from "../Shop/shopData";
import ProductItem from "@/components/Common/ProductItem";
import { Product } from "@/types/product";
import Link from "next/link";

type SortOption = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

const ITEMS_PER_PAGE = 12;

const CATEGORIES = [
  "All Collections",
  "Leather Goods",
  "Fine Jewelry & Rings",
  "Horology & Timepieces",
  "Ceramics & Stoneware",
  "Heritage Textiles",
  "Bespoke Metalwork",
];

const MATERIALS = [
  "All Materials",
  "Full-Grain Leather",
  "18k Solid Gold",
  "Solid Brass & Sapphire",
  "Italian Carrera Marble",
  "Damascus Steel & Walnut",
  "Pure Merino Wool",
  "Tuscan Terracotta",
  "925 Sterling Silver",
];

const PRICE_PRESETS = [
  { label: "All Prices", min: 0, max: 1000 },
  { label: "Under $150", min: 0, max: 150 },
  { label: "$150 – $250", min: 150, max: 250 },
  { label: "$250 – $350", min: 250, max: 350 },
  { label: "$350+", min: 350, max: 1000 },
];

export default function ShopWithSidebar() {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Collections");
  const [selectedMaterial, setSelectedMaterial] = useState("All Materials");
  const [selectedPricePreset, setSelectedPricePreset] = useState("All Prices");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [preorderOnly, setPreorderOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer toggle
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Floating Pill Visibility (Disappears once footer starts scrolling into view)
  const [isPillVisible, setIsPillVisible] = useState(true);

  const topGridRef = useRef<HTMLDivElement>(null);

  // Footer Intersection Observer: hide sticky pill when footer enters viewport
  useEffect(() => {
    const footerElement = document.getElementById("main-footer") || document.querySelector("footer");
    if (!footerElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsPillVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.05,
      }
    );

    observer.observe(footerElement);
    return () => observer.disconnect();
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Collections": shopData.length };
    shopData.forEach((item) => {
      const cat = item.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return shopData
      .filter((item) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesCat = item.category?.toLowerCase().includes(q);
          const matchesMat = item.material?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesCat && !matchesMat) return false;
        }

        // Category Filter
        if (selectedCategory !== "All Collections" && item.category !== selectedCategory) {
          return false;
        }

        // Material Filter
        if (selectedMaterial !== "All Materials" && item.material !== selectedMaterial) {
          return false;
        }

        // Price Filter
        const price = item.discountedPrice || item.price;
        if (price < minPrice || price > maxPrice) {
          return false;
        }

        // In Stock Filter
        if (inStockOnly && item.inStock === false) {
          return false;
        }

        // Preorder Products Filter
        if (preorderOnly && !item.isPreorder && !item.isBespoke) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountedPrice || a.price;
        const priceB = b.discountedPrice || b.price;

        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "rating") return (b.rating || 5) - (a.rating || 5);
        if (sortBy === "newest") return b.id - a.id;
        return a.id - b.id; // "featured"
      });
  }, [
    searchQuery,
    selectedCategory,
    selectedMaterial,
    minPrice,
    maxPrice,
    inStockOnly,
    preorderOnly,
    sortBy,
  ]);

  // Total pages
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  // Current page products
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedMaterial,
    minPrice,
    maxPrice,
    inStockOnly,
    preorderOnly,
    sortBy,
  ]);

  // Handle Page Change with smooth scroll
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (topGridRef.current) {
      topGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Collections");
    setSelectedMaterial("All Materials");
    setSelectedPricePreset("All Prices");
    setMinPrice(0);
    setMaxPrice(1000);
    setInStockOnly(false);
    setPreorderOnly(false);
    setSortBy("featured");
    setCurrentPage(1);
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== "All Collections") count++;
    if (selectedMaterial !== "All Materials") count++;
    if (selectedPricePreset !== "All Prices" || minPrice > 0 || maxPrice < 1000) count++;
    if (inStockOnly) count++;
    if (preorderOnly) count++;
    if (sortBy !== "featured") count++;
    return count;
  }, [searchQuery, selectedCategory, selectedMaterial, selectedPricePreset, minPrice, maxPrice, inStockOnly, preorderOnly, sortBy]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterDrawerOpen]);

  return (
    <div className="min-h-screen relative" style={{ background: "#FFFAF5" }}>
      {/* ── 1. LUXURY HERO BANNER ────────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-32 lg:pt-36 pb-10 sm:pb-14 overflow-hidden border-b border-[#E3C9A8]/40">
        {/* Ambient Warm Gradient Glows */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, #C4896A 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle, #E3C9A8 0%, transparent 70%)" }}
        />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#7A6B5D] mb-4">
            <Link href="/" className="hover:text-[#C4896A] transition-colors">
              Home
            </Link>
            <span className="text-[#C4896A]">/</span>
            <span className="text-[#3D2B1F] font-semibold">Artisanal Collection</span>
          </nav>

          {/* Heading */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-4"
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#3D2B1F",
            }}
          >
            The Artisanal Collection
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#7A6B5D] leading-relaxed mb-8">
            Masterfully handcrafted heirlooms and bespoke treasures from Florence to Kyoto.
            Each creation bears the signature touch of generational artisans.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search handcrafted pieces, styles..."
              className="w-full pl-11 pr-10 py-3 rounded-full text-sm text-[#3D2B1F] placeholder:text-[#A09082] bg-white border border-[#E3C9A8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4896A]/30 focus:border-[#C4896A] transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A09082]"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A09082] hover:text-[#3D2B1F] text-xs w-5 h-5 rounded-full flex items-center justify-center bg-gray-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. MAIN PRODUCTS SECTION ───────────────────────────────────── */}
      <div ref={topGridRef} className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Active Filter Chips & Counter (Subtle, clean, without bulky top box) */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in duration-200">
            <span className="text-xs uppercase tracking-wider text-[#A09082] font-semibold mr-1">
              Active Filters:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]">
                Query: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="hover:text-red-500 font-bold">✕</button>
              </span>
            )}

            {selectedCategory !== "All Collections" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("All Collections")} className="hover:text-red-500 font-bold">✕</button>
              </span>
            )}

            {selectedMaterial !== "All Materials" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]">
                Material: {selectedMaterial}
                <button onClick={() => setSelectedMaterial("All Materials")} className="hover:text-red-500 font-bold">✕</button>
              </span>
            )}

            {(minPrice > 0 || maxPrice < 1000) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]">
                Price: ${minPrice} – ${maxPrice}
                <button
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(1000);
                    setSelectedPricePreset("All Prices");
                  }}
                  className="hover:text-red-500 font-bold"
                >
                  ✕
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]">
                Ready to Ship
                <button onClick={() => setInStockOnly(false)} className="hover:text-red-500 font-bold">✕</button>
              </span>
            )}

            {preorderOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]">
                Preorder Products
                <button onClick={() => setPreorderOnly(false)} className="hover:text-red-500 font-bold">✕</button>
              </span>
            )}

            {sortBy !== "featured" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]">
                Sorted by: {sortBy}
                <button onClick={() => setSortBy("featured")} className="hover:text-red-500 font-bold">✕</button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-[#C4896A] font-semibold hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* ── PRODUCT GRID (4 columns on Desktop, 2 columns on Mobile) ─── */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {currentProducts.map((product) => (
              <ProductItem
                item={product}
                key={product.id}
                badge={product.badge}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            className="w-full rounded-3xl p-12 sm:p-16 text-center border"
            style={{ background: "#FFFFFF", borderColor: "#E3C9A8" }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5"
              style={{ background: "#FEF5EC", color: "#C4896A" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>

            <h3
              className="text-xl sm:text-2xl font-medium mb-3"
              style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
            >
              No Heirlooms Match Your Selection
            </h3>

            <p className="text-sm text-[#7A6B5D] max-w-md mx-auto mb-6 leading-relaxed">
              We could not find any items matching your active filters. Try broadening your criteria or reset the filters below.
            </p>

            <button
              onClick={handleResetFilters}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-all shadow-md hover:brightness-105 active:scale-95"
              style={{ background: "#C4896A" }}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ── 3. LUXURY PAGINATION ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 sm:mt-16">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous Page"
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-[#3D2B1F]"
              style={{ borderColor: "#E3C9A8", background: "#FFFAF5" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Page Number Pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-200 ${
                  currentPage === pageNum
                    ? "text-white shadow-md scale-105"
                    : "text-[#3D2B1F] hover:bg-white border border-transparent hover:border-[#E3C9A8]"
                }`}
                style={{
                  background: currentPage === pageNum ? "#3D2B1F" : "#FFFAF5",
                }}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-[#3D2B1F]"
              style={{ borderColor: "#E3C9A8", background: "#FFFAF5" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── 4. STICKY FLOATING PILL BUTTON (BOTTOM OF SCREEN) ─────────── */}
      {/* Disappears automatically when the footer enters viewport */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out ${
          isPillVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="group flex items-center gap-3 px-6 py-3.5 rounded-full text-white text-sm font-semibold tracking-wide border shadow-[0_12px_32px_rgba(31,21,14,0.38)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "#1F150E",
            borderColor: "#C4896A",
          }}
        >
          {/* Sliders Icon (identical to user image) */}
          <div className="w-5 h-5 flex items-center justify-center text-white group-hover:text-[#C4896A] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </div>

          <span className="font-medium whitespace-nowrap">Filter & Sort by</span>

          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-[#C4896A] text-white text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── 5. SLIDE-OVER FILTER & SORT DRAWER MODAL ───────────────────── */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end animate-in fade-in duration-300">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 bg-[#1F150E]/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Body */}
          <div
            className="relative w-full max-w-md sm:max-w-lg h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-hidden"
            style={{ background: "#FFFAF5" }}
          >
            {/* Header */}
            <div
              className="p-5 sm:p-6 border-b flex items-center justify-between"
              style={{ borderColor: "#E3C9A8", background: "#FFFFFF" }}
            >
              <div>
                <h2
                  className="text-lg sm:text-xl font-semibold tracking-wide"
                  style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
                >
                  Filter & Sort Heirlooms
                </h2>
                <p className="text-xs text-[#7A6B5D] mt-0.5">
                  Refine the atelier collection to your preferences
                </p>
              </div>

              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#7A6B5D] hover:text-[#3D2B1F] hover:bg-[#FFFAF5] transition-colors"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-7">
              {/* Sort By Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D2B1F] mb-3">
                  Sort Order
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Featured", value: "featured" },
                    { label: "Newest", value: "newest" },
                    { label: "Price: Low to High", value: "price-asc" },
                    { label: "Price: High to Low", value: "price-desc" },
                    { label: "Customer Rating", value: "rating" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                        sortBy === option.value
                          ? "bg-[#3D2B1F] text-white border-[#3D2B1F] shadow-sm font-semibold"
                          : "bg-white text-[#7A6B5D] border-[#E3C9A8] hover:bg-[#FEF5EC]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collections Category Section */}
              <div className="pt-6 border-t border-[#E3C9A8]/40">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D2B1F]">
                    Collections
                  </h3>
                  {selectedCategory !== "All Collections" && (
                    <button
                      onClick={() => setSelectedCategory("All Collections")}
                      className="text-[11px] text-[#C4896A] font-semibold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#C4896A] text-white font-semibold shadow-sm"
                          : "bg-white text-[#7A6B5D] border border-[#E3C9A8]/50 hover:bg-[#FEF5EC]"
                      }`}
                    >
                      <span>{cat}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          selectedCategory === cat ? "bg-white/20 text-white" : "text-[#A09082]"
                        }`}
                      >
                        {categoryCounts[cat] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Section */}
              <div className="pt-6 border-t border-[#E3C9A8]/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D2B1F] mb-3">
                  Price Range
                </h3>
                {/* Presets */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {PRICE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setSelectedPricePreset(preset.label);
                        setMinPrice(preset.min);
                        setMaxPrice(preset.max);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedPricePreset === preset.label
                          ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                          : "bg-white text-[#7A6B5D] border-[#E3C9A8] hover:bg-[#FEF5EC]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Min / Max inputs */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <span className="block text-[11px] text-[#A09082] mb-1">Min Price ($)</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(Number(e.target.value));
                        setSelectedPricePreset("Custom");
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]"
                    />
                  </div>
                  <span className="text-[#A09082] mt-4">–</span>
                  <div className="flex-1">
                    <span className="block text-[11px] text-[#A09082] mb-1">Max Price ($)</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Number(e.target.value));
                        setSelectedPricePreset("Custom");
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E3C9A8] text-[#3D2B1F]"
                    />
                  </div>
                </div>
              </div>

              {/* Craft Materials */}
              <div className="pt-6 border-t border-[#E3C9A8]/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D2B1F] mb-3">
                  Craft Material
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {MATERIALS.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        selectedMaterial === mat
                          ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                          : "bg-white text-[#7A6B5D] border-[#E3C9A8] hover:bg-[#FEF5EC]"
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability & Preorder Products */}
              <div className="pt-6 border-t border-[#E3C9A8]/40 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D2B1F] mb-2">
                  Atelier Availability
                </h3>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E3C9A8]/60 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#3D2B1F]">Ready to Ship</span>
                    <span className="text-[11px] text-[#A09082]">Finished pieces available immediately</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E3C9A8] text-[#C4896A] accent-[#C4896A]"
                  />
                </label>

                {/* Preorder Products Toggle (replaces Bespoke Heirlooms) */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E3C9A8]/60 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#3D2B1F]">Preorder Products</span>
                    <span className="text-[11px] text-[#A09082]">Reserve upcoming artisanal batch creations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preorderOnly}
                    onChange={(e) => setPreorderOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E3C9A8] text-[#C4896A] accent-[#C4896A]"
                  />
                </label>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div
              className="p-4 sm:p-5 border-t flex items-center gap-3"
              style={{ borderColor: "#E3C9A8", background: "#FFFFFF" }}
            >
              <button
                onClick={handleResetFilters}
                className="w-1/3 py-3 rounded-xl text-xs font-semibold text-[#7A6B5D] border border-[#E3C9A8] hover:bg-[#FFFAF5] transition-colors"
              >
                Reset All
              </button>

              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-2/3 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:brightness-105 active:scale-95"
                style={{ background: "#C4896A" }}
              >
                Show {filteredProducts.length} Heirlooms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
