"use client";
import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import Image from "next/image";
import { showToast } from "@/utils/toast";

interface WishlistItemType {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity?: number;
  imgs?: {
    thumbnails?: string[];
    previews?: string[];
  };
}

const SingleItem = ({ item }: { item: WishlistItemType }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRemove = () => {
    dispatch(removeItemFromWishlist(item.id));
    showToast.success("Removed from wishlist", `wishlist-remove-${item.id}`);
  };

  const handleAddToCart = () => {
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
    dispatch(removeItemFromWishlist(item.id));
    showToast.success("Moved to bag", `cart-add-${item.id}`);
  };

  const imageSrc =
    item.imgs?.thumbnails?.[0] ||
    item.imgs?.previews?.[0] ||
    "/images/products/product-1-sm-1.png";

  return (
    <div
      className="group relative flex items-center gap-3.5 sm:gap-4 p-3 sm:p-3.5 rounded-xl transition-all duration-300 border"
      style={{
        background: "#FFFFFF",
        borderColor: "#E3C9A8",
        boxShadow: "0 2px 10px rgba(227,201,168,0.18)",
      }}
    >
      {/* Product Image */}
      <div
        className="relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-lg overflow-hidden flex-shrink-0 border flex items-center justify-center"
        style={{ background: "#FEF5EC", borderColor: "#EDD9B8" }}
      >
        <Image
          src={imageSrc}
          alt={item.title}
          fill
          className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 pr-6">
        <h4
          className="text-xs sm:text-sm font-semibold tracking-wide truncate mb-1 transition-colors duration-200"
          style={{ color: "#3D2B1F" }}
        >
          <span className="hover:text-[#C4896A] cursor-pointer">
            {item.title}
          </span>
        </h4>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs sm:text-sm font-bold text-[#C4896A]">
            ${item.discountedPrice}
          </span>
          {item.price > item.discountedPrice && (
            <span className="text-[11px] text-[#A09082] line-through">
              ${item.price}
            </span>
          )}
        </div>

        {/* Action: Add to Bag */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold text-white transition-all duration-300 shadow-sm"
            style={{
              background: "#876651ff",
              fontFamily: "'Cinzel', serif",
              letterSpacing: "0.08em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#C4896A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#3D2B1F";
            }}
          >
            <svg
              width="12"
              height="12"
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
            <span>Add to Bag</span>
          </button>
        </div>
      </div>

      {/* Delete / Remove Button */}
      <button
        onClick={handleRemove}
        aria-label="Remove item"
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[#A09082] hover:text-[#C4896A] hover:bg-[#FEF5EC] transition-all duration-200"
      >
        <svg
          width="13"
          height="13"
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
  );
};

export default SingleItem;
