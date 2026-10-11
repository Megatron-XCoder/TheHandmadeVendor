"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { showToast } from "@/utils/toast";
import Link from "next/link";
import Image from "next/image";

const SingleListItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const wishlistItems = useSelector((state: RootState) => state.wishlistReducer.items);
  const isInWishlist = wishlistItems.some((w) => w.id === item.id);

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
    openModal();
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        quantity: 1,
      })
    );
    showToast.success(`Added "${item.title}" to your shopping bag`);
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(item.id));
      showToast.info(`Removed "${item.title}" from your wishlist`);
    } else {
      dispatch(
        addItemToWishlist({
          ...item,
          status: "available",
          quantity: 1,
        })
      );
      showToast.success(`Added "${item.title}" to your curated wishlist`);
    }
  };

  const displayImage = item.imgs?.previews?.[0] || item.imgs?.thumbnails?.[0] || "/images/products/product-1-bg-1.png";

  return (
    <div
      className="group relative flex flex-col sm:flex-row rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-[0_12px_36px_rgba(61,43,31,0.12)] hover:-translate-y-0.5"
      style={{
        background: "#FFFFFF",
        borderColor: "#E3C9A8",
      }}
    >
      {/* Left/Image Area */}
      <div className="relative w-full sm:w-[260px] md:w-[280px] aspect-[4/3] sm:aspect-auto flex-shrink-0 bg-[#FDFBF7] overflow-hidden flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-[#E3C9A8]/50">
        {item.badge && (
          <span
            className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #3D2B1F 0%, #C4896A 100%)",
            }}
          >
            {item.badge}
          </span>
        )}

        <div className="relative w-full h-full min-h-[180px]">
          <Image
            src={displayImage}
            alt={item.title}
            fill
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, 280px"
          />
        </div>
      </div>

      {/* Right/Body Content */}
      <div className="p-6 sm:p-7 flex flex-col justify-between flex-1">
        <div>
          {/* Category & Materials */}
          <div className="flex items-center gap-3 text-xs mb-2 text-[#7A6B5D]">
            <span className="font-semibold uppercase tracking-wider text-[#C4896A]">{item.category || "Artisanal Heirlooms"}</span>
            {item.material && (
              <>
                <span>•</span>
                <span className="italic text-[#A09082]">{item.material}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-lg sm:text-xl font-semibold leading-snug transition-colors duration-200 hover:text-[#C4896A] mb-3"
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#3D2B1F",
            }}
          >
            <Link href={`/shop-details?id=${item.id}`}>{item.title}</Link>
          </h3>

          {/* Description */}
          <p className="text-sm text-[#7A6B5D] leading-relaxed line-clamp-2 mb-4">
            {item.description || "Individually handcrafted by master artisans using time-honored techniques, guaranteed for a lifetime of beauty and service."}
          </p>
        </div>

        {/* Pricing, Reviews & Actions */}
        <div className="pt-4 border-t border-[#E3C9A8]/40 flex flex-wrap items-center justify-between gap-4 mt-auto">
          {/* Price & Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold" style={{ color: "#C4896A" }}>
                ${item.discountedPrice.toFixed(2)}
              </span>
              {item.price > item.discountedPrice && (
                <span className="text-sm line-through text-[#A89F95]">
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#7A6B5D] pl-3 border-l border-[#E3C9A8]/60">
              <div className="flex items-center text-[#C4896A]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="font-semibold text-[#3D2B1F]">{item.rating || 5.0}</span>
              <span className="text-[#A09082]">({item.reviews} reviews)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickViewUpdate}
              aria-label="Quick View"
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#3D2B1F] bg-[#FFFAF5] border border-[#E3C9A8] hover:bg-[#3D2B1F] hover:text-white transition-colors duration-200"
            >
              Quick View
            </button>

            <button
              onClick={handleToggleWishlist}
              aria-label="Wishlist"
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                isInWishlist
                  ? "bg-[#3D2B1F] text-[#C4896A] border-[#3D2B1F]"
                  : "bg-[#FFFAF5] text-[#3D2B1F] border-[#E3C9A8] hover:bg-[#3D2B1F] hover:text-white"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isInWishlist ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            <button
              onClick={handleAddToCart}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-95"
              style={{ background: "#C4896A" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListItem;
