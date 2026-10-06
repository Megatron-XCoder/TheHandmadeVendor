"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const handleQuickViewUpdate = () => dispatch(updateQuickView({ ...item }));
  const handleAddToCart = () => dispatch(addItemToCart({ ...item, quantity: 1 }));
  const handleItemToWishList = () => dispatch(addItemToWishlist({ ...item, status: "available", quantity: 1 }));

  return (
    <div className="group flex flex-col h-full rounded-2xl overflow-hidden border transition-shadow duration-300 hover:shadow-xl" style={{ borderColor: "#E3C9A8", background: "#FEF5EC" }}>
      
      {/* Top Half: Content */}
      <div className="px-6 py-8 flex flex-col items-center text-center relative z-10">
        <h3 className="font-medium text-lg sm:text-xl mb-2 transition-colors duration-200" style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}>
          <Link href="/shop-details" className="hover:text-[#C4896A]">
            {item.title}
          </Link>
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold text-lg" style={{ color: "#C4896A" }}>
            ${item.discountedPrice}
          </span>
          {item.price > item.discountedPrice && (
            <span className="text-sm line-through" style={{ color: "#A89F95" }}>
              ${item.price}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#E3C9A8" stroke="#E3C9A8" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span className="text-xs ml-1" style={{ color: "#7A6B5D" }}>({item.reviews})</span>
        </div>
      </div>

      {/* Bottom Half: Image */}
      <div className="relative w-full aspect-square mt-auto bg-white">
        <Image 
          src={item.imgs.previews[0]} 
          alt={item.title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4 flex flex-col gap-3 translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => { handleQuickViewUpdate(); openModal(); }}
            aria-label="Quick view"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#3D2B1F] shadow-md hover:bg-[#3D2B1F] hover:text-white transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          
          <button
            onClick={() => handleAddToCart()}
            aria-label="Add to cart"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#3D2B1F] shadow-md hover:bg-[#3D2B1F] hover:text-white transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>

          <button
            onClick={() => handleItemToWishList()}
            aria-label="Add to wishlist"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#3D2B1F] shadow-md hover:bg-[#3D2B1F] hover:text-white transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
