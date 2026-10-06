"use client";
import React from "react";
import ProductItem from "@/components/Common/ProductItem";
import Image from "next/image";
import Link from "next/link";
import shopData from "@/components/Shop/shopData";

const BestSeller = () => {
  return (
    <section className="overflow-hidden py-16 lg:py-20" style={{ background: "#FFFAF5" }}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Section title */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span
              className="flex items-center gap-2.5 font-medium mb-1.5 text-sm"
              style={{ color: "#C4896A" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#C4896A" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Customer Favorites
            </span>
            <h2
              className="font-semibold text-xl xl:text-2xl"
              style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
            >
              Best Sellers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Best Sellers item */}
          {shopData.slice(1, 9).map((item, key) => (
            <ProductItem item={item} key={key} badge="Best Seller" />
          ))}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex items-center gap-2 font-medium text-sm text-white px-8 py-3.5 rounded-full transition-all duration-300 shadow-sm"
            style={{ background: "#C4896A" }}
            onMouseEnter={(e: any) => (e.currentTarget.style.background = "#B37A5E")}
            onMouseLeave={(e: any) => (e.currentTarget.style.background = "#C4896A")}
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
