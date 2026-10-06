"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import shopData from "@/components/Shop/shopData";

const NewArrival = () => {
  return (
    <section className="overflow-hidden pt-16 lg:pt-20 pb-10" style={{ background: "#FFFAF5" }}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Section title */}
        <div className="mb-10 flex flex-row items-center justify-between gap-4">
          <div>
            <span
              className="flex items-center gap-2.5 font-medium mb-1.5 text-sm"
              style={{ color: "#C4896A" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#C4896A" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              This Week’s
            </span>
            <h2
              className="font-semibold text-xl xl:text-2xl"
              style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
            >
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="inline-flex items-center gap-1.5 font-medium text-sm py-2.5 px-7 rounded-full transition-all duration-300"
            style={{ color: "#C4896A", border: "1px solid #E3C9A8", background: "#fff" }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.background = "#C4896A";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#C4896A";
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#C4896A";
              e.currentTarget.style.borderColor = "#E3C9A8";
            }}
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* New Arrivals item */}
          {shopData.map((item, key) => (
            <ProductItem item={item} key={key} badge="New Arrival" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
