"use client";
import React, { useEffect, useState } from "react";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { updateproductDetails } from "@/redux/features/product-details";
import Link from "next/link";
import { showToast } from "@/utils/toast";

const descriptionText =
  "Experience the epitome of luxury with this meticulously crafted piece. Designed to combine timeless elegance with modern functionality.";

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────
const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch<AppDispatch>();

  const product = useAppSelector((state) => state.quickViewReducer.value);
  const [activePreview, setActivePreview] = useState(0);

  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isInWishlist = wishlistItems.some((i) => i.id === product?.id);

  const handlePreviewSlider = () => {
    dispatch(updateproductDetails(product));
    openPreviewModal();
  };

  const handleAddToCart = () => {
    dispatch(addItemToCart({ ...product, quantity }));
    closeModal();
    showToast.success("Added to cart", `cart-${product.id}`);
  };

  const handleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(product.id));
      showToast.success("Removed from wishlist", `wishlist-${product.id}`);
    } else {
      dispatch(addItemToWishlist({ ...product, quantity: 1, status: "available" }));
      showToast.success("Added to wishlist", `wishlist-${product.id}`);
    }
    closeModal();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest(".modal-content")) closeModal();
    }
    if (isModalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setQuantity(1);
      setActivePreview(0);
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen || !product?.title) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal container – scrollable on mobile, max-height capped */}
      <div
        className="modal-content relative w-full max-w-[960px] max-h-[90vh] overflow-y-auto bg-[#FFFAF5] rounded-2xl shadow-[0_10px_40px_rgba(227,201,168,0.4)]"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          aria-label="Close modal"
          className="absolute top-3 right-3 z-50 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-[#C4896A] text-gray-800 hover:text-white transition-all shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* ── Two-column layout (stacks on mobile) ── */}
        <div className="flex flex-col md:flex-row">

          {/* ── LEFT COLUMN: Image ── */}
          <div className="md:w-[45%] flex-shrink-0 p-4 md:p-6">
            {/* Main product image – hover to zoom */}
            <div
              className="relative w-full h-[250px] md:h-[380px] rounded-xl overflow-hidden bg-[#FEF5EC] cursor-crosshair"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                const img = e.currentTarget.querySelector("img");
                if (img) {
                  img.style.transformOrigin = `${x}% ${y}%`;
                  img.style.transform = "scale(2)";
                }
              }}
              onMouseLeave={(e) => {
                const img = e.currentTarget.querySelector("img");
                if (img) {
                  img.style.transformOrigin = "center center";
                  img.style.transform = "scale(1)";
                }
              }}
            >
              <Image
                src={product.imgs?.previews?.[activePreview] || product.imgs?.previews?.[0] || ""}
                alt={product.title}
                fill
                className="object-contain transition-transform duration-300 ease-out"
              />
              {/* Fullscreen icon */}
              <button
                onClick={handlePreviewSlider}
                className="absolute top-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:text-[#C4896A] shadow-md transition-opacity z-20 group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {/* Tooltip on hover */}
                <span className="absolute left-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                  Fullscreen
                </span>
              </button>
            </div>

            {/* Thumbnails row */}
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {product.imgs?.thumbnails?.slice(0, 4).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreview(idx)}
                  className={`relative w-[60px] h-[60px] flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200 border-2 ${
                    activePreview === idx
                      ? "border-[#C4896A] opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Details ── */}
          <div className="md:w-[55%] p-5 md:p-8 md:pl-4 flex flex-col justify-center">
            <Link href="/shop-details" onClick={closeModal} className="block mb-1">
              <h2
                className="text-xl md:text-2xl font-semibold text-gray-800 hover:text-[#C4896A] transition-colors leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {product.title}
              </h2>
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-0.5 mb-3 mt-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
              <span className="text-xs text-gray-500 ml-1.5">(15 Reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl text-[#C4896A] font-semibold">${product.discountedPrice}</span>
              {product.price > product.discountedPrice && (
                <span className="text-base text-gray-400 line-through">${product.price}</span>
              )}
              <span className="ml-auto inline-block text-[10px] font-semibold tracking-wider text-[#C4896A] uppercase px-2 py-0.5 bg-[#FDF0E6] rounded">
                In Stock
              </span>
            </div>

            {/* Description – truncated */}
            <p className="text-gray-600 mb-5 leading-relaxed text-sm">
              {descriptionText.substring(0, 100)}...
            </p>

            <div className="h-px w-full bg-[#E3C9A8] opacity-50 mb-5" />

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-[#E3C9A8] rounded-full overflow-hidden bg-white">
                <button
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-[#C4896A] hover:bg-[#FDF0E6] transition-colors text-sm"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-[#C4896A] hover:bg-[#FDF0E6] transition-colors text-sm"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#3D2B1F] hover:bg-[#C4896A] text-white py-2.5 px-5 rounded-full font-medium tracking-wide transition-colors text-sm"
              >
                Add to Cart
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className={`flex items-center justify-center gap-2 w-full border ${
                isInWishlist ? "border-[#C4896A] text-[#C4896A]" : "border-[#E3C9A8] text-gray-700"
              } hover:border-[#C4896A] hover:text-[#C4896A] py-2.5 rounded-full font-medium transition-colors text-sm`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isInWishlist ? "Added to Wishlist" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

