"use client";
import React, { useEffect } from "react";
import { useWishlistModalContext } from "@/app/context/WishlistSidebarModalContext";
import {
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import SingleItem from "./SingleItem";
import EmptyWishlist from "./EmptyWishlist";
import { showToast } from "@/utils/toast";

const WishlistSidebarModal = () => {
  const { isWishlistModalOpen, closeWishlistModal } = useWishlistModalContext();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const dispatch = useDispatch<AppDispatch>();

  // Close on Escape & Lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWishlistModal();
    };

    if (isWishlistModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isWishlistModalOpen, closeWishlistModal]);

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      dispatch(
        addItemToCart({
          id: item.id,
          title: item.title,
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: 1,
          imgs: item.imgs as any,
        })
      );
    });
    dispatch(removeAllItemsFromWishlist());
    showToast.success("All items moved to bag", "wishlist-add-all");
  };

  const handleClearWishlist = () => {
    dispatch(removeAllItemsFromWishlist());
    showToast.success("Wishlist cleared", "wishlist-clear");
  };

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-all duration-500 ${
        isWishlistModalOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop overlay */}
      <div
        onClick={closeWishlistModal}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          isWishlistModalOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-full max-w-[440px] sm:max-w-[470px] flex flex-col z-[100000] transition-transform duration-500 ease-out border-l ${
          isWishlistModalOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "#FFFAF5",
          borderColor: "#E3C9A8",
          boxShadow: "-12px 0 45px rgba(61,43,31,0.22)",
        }}
      >
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b relative"
          style={{ borderColor: "#E3C9A8", background: "#FFFAF5" }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-base sm:text-lg font-medium tracking-[0.15em] uppercase"
              style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
            >
              Wishlist
            </h2>

            {/* Close Button */}
            <button
              onClick={closeWishlistModal}
              aria-label="Close wishlist"
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 shadow-sm"
              style={{
                borderColor: "#E3C9A8",
                background: "#FFFFFF",
                color: "#3D2B1F",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#C4896A";
                (e.currentTarget as HTMLElement).style.borderColor = "#C4896A";
                (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
                (e.currentTarget as HTMLElement).style.borderColor = "#E3C9A8";
                (e.currentTarget as HTMLElement).style.color = "#3D2B1F";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── WISHLIST ITEMS SCROLLABLE LIST ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {wishlistItems.length > 0 ? (
            wishlistItems.map((item, key) => (
              <SingleItem key={item.id || key} item={item} />
            ))
          ) : (
            <EmptyWishlist />
          )}
        </div>

        {/* ── FOOTER ACTIONS ─────────────────────────────────────────────────── */}
        {wishlistItems.length > 0 && (
          <div
            className="flex-shrink-0 px-5 sm:px-7 pt-4 pb-5 sm:pb-6 border-t"
            style={{
              background: "#FFFAF5",
              borderColor: "#E3C9A8",
              boxShadow: "0 -4px 20px rgba(227,201,168,0.25)",
            }}
          >
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleAddAllToCart}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl"
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
                <span>Add All to Shopping Bag</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </button>

              <button
                onClick={handleClearWishlist}
                className="w-full flex items-center justify-center py-2 px-6 rounded-full text-xs font-medium tracking-[0.12em] uppercase transition-colors duration-200 text-[#7A6B5D] hover:text-red-500"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Clear Wishlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistSidebarModal;
