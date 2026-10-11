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

const SingleGridItem = ({ item }: { item: Product }) => {
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
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-[0_12px_36px_rgba(61,43,31,0.12)] hover:-translate-y-1"
      style={{
        background: "#FFFFFF",
        borderColor: "#E3C9A8",
      }}
    >
      {/* Top Image Canvas */}
      <div className="relative w-full aspect-[4/3.5] bg-[#FDFBF7] overflow-hidden flex items-center justify-center p-6 border-b border-[#E3C9A8]/50">
        {/* Badge */}
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

        {/* Product Image */}
        <div className="relative w-full h-full">
          <Image
            src={displayImage}
            alt={item.title}
            fill
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-108"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Action Buttons Floating Overlay */}
        <div className="absolute inset-0 bg-[#1F150E]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5 backdrop-blur-[2px]">
          {/* Quick View */}
          <button
            onClick={handleQuickViewUpdate}
            aria-label="Quick View"
            title="Quick Preview"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#3D2B1F] bg-white shadow-md hover:bg-[#3D2B1F] hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {/* Add to Bag */}
          <button
            onClick={handleAddToCart}
            aria-label="Add to Bag"
            title="Add to Shopping Bag"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background: "#C4896A" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>

          {/* Wishlist Toggle */}
          <button
            onClick={handleToggleWishlist}
            aria-label="Wishlist"
            title={isInWishlist ? "In Wishlist" : "Add to Wishlist"}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-95 ${
              isInWishlist ? "bg-[#3D2B1F] text-[#C4896A]" : "bg-white text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white"
            }`}
          >
            <svg
              width="17"
              height="17"
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
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Craft Material */}
          <div className="flex items-center justify-between text-xs mb-2 text-[#7A6B5D]">
            <span className="font-medium uppercase tracking-wider">{item.category || "Artisanal Heirlooms"}</span>
            {item.material && <span className="text-[#A09082] italic text-[11px] truncate max-w-[120px]">{item.material}</span>}
          </div>

          {/* Product Title */}
          <h3
            className="text-base font-semibold leading-snug line-clamp-2 transition-colors duration-200 hover:text-[#C4896A] mb-2"
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#3D2B1F",
            }}
          >
            <Link href={`/shop-details?id=${item.id}`}>{item.title}</Link>
          </h3>
        </div>

        {/* Rating & Pricing Row */}
        <div className="pt-3 border-t border-[#E3C9A8]/40 flex items-center justify-between mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold" style={{ color: "#C4896A" }}>
              ${item.discountedPrice.toFixed(2)}
            </span>
            {item.price > item.discountedPrice && (
              <span className="text-xs line-through text-[#A89F95]">
                ${item.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 text-xs text-[#7A6B5D]">
            <div className="flex items-center text-[#C4896A]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="font-medium text-[#3D2B1F]">{item.rating || 5.0}</span>
            <span className="text-[#A09082]">({item.reviews})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleGridItem;
