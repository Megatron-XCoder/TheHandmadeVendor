"use client";
import React from "react";
import Link from "next/link";
import { useWishlistModalContext } from "@/app/context/WishlistSidebarModalContext";

const EmptyWishlist = () => {
  const { closeWishlistModal } = useWishlistModalContext();

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {/* Luxurious heart icon illustration */}
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
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C4896A"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      <h3
        className="text-lg sm:text-xl font-medium tracking-[0.15em] uppercase mb-2.5"
        style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
      >
        Your Wishlist is Empty
      </h3>

      <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-[270px] leading-relaxed mb-7">
        Save your favorite handcrafted treasures to view or add to your shopping bag anytime.
      </p>

      <Link
        onClick={() => closeWishlistModal()}
        href="/shop-with-sidebar"
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

export default EmptyWishlist;
