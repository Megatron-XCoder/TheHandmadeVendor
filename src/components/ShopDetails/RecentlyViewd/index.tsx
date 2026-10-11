"use client";
import React, { useMemo } from "react";
import shopData from "@/components/Shop/shopData";
import ProductItem from "@/components/Common/ProductItem";
import Link from "next/link";

interface RecentlyViewdItemsProps {
  currentProductId?: number;
}

const RecentlyViewdItems: React.FC<RecentlyViewdItemsProps> = ({ currentProductId }) => {
  // Select top 4 complementary items, excluding the active product
  const recommendedItems = useMemo(() => {
    const filtered = shopData.filter((item) => item.id !== currentProductId);
    return filtered.slice(0, 4);
  }, [currentProductId]);

  return (
    <section className="py-16 sm:py-24 bg-[#FFFAF5] border-t border-[#E3C9A8]/40">
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#E3C9A8]/30">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#C4896A] mb-2 block">
              Curated Atelier Selection
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#2A1E17] tracking-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              You May Also Cherish
            </h2>
            <p className="text-xs sm:text-sm text-[#7D6E63] mt-1.5 font-light">
              Artisanal creations crafted to harmonize with your selected piece.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 self-start sm:self-auto text-xs font-semibold uppercase tracking-[0.15em] text-[#3D2B1F] hover:text-[#C4896A] transition-colors group cursor-pointer"
          >
            <span>View All Creations</span>
            <svg
              className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* 4 Cards on Desktop, 2 Cards on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {recommendedItems.map((item, key) => (
            <div key={item.id || key} className="h-full">
              <ProductItem item={item} />
            </div>
          ))}
        </div>

        {/* Bottom Explore Button */}
        <div className="text-center mt-12 sm:mt-14">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF6F0] bg-[#3D2B1F] hover:bg-[#C4896A] px-8 py-3.5 rounded-full transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Explore Entire Collection</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewdItems;
