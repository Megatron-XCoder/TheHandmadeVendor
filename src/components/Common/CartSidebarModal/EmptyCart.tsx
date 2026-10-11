"use client";
import React from "react";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const EmptyCart = () => {
  const { closeCartModal } = useCartModalContext();

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {/* Luxurious bag icon illustration */}
      <div 
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mb-6 relative border"
        style={{
          background: "linear-gradient(135deg, #FEF5EC 0%, #FFFAF5 100%)",
          borderColor: "#E3C9A8",
          boxShadow: "0 10px 30px rgba(196,137,106,0.15)",
        }}
      >
        <div className="absolute inset-1.5 rounded-full border border-dashed border-[#C4896A]/40 pointer-events-none" />
        <svg
          width="42"
          height="42"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C4896A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      <h3
        className="text-lg sm:text-xl font-medium tracking-[0.15em] uppercase mb-2.5"
        style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
      >
        Your Bag is Empty
      </h3>

      <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-[260px] leading-relaxed mb-7">
        Discover handcrafted leather treasures designed for the discerning collector.
      </p>

      <Link
        onClick={() => closeCartModal()}
        href="/shop"
        className="inline-flex items-center justify-center px-7 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-lg"
        style={{
          background: "#3D2B1F",
          fontFamily: "'Cinzel', serif",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#C4896A";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#3D2B1F";
        }}
      >
        Explore Collections
      </Link>
    </div>
  );
};

export default EmptyCart;
