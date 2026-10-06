"use client";
import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { showToast } from "@/utils/toast";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ProductItem = ({ item, badge }: { item: Product; badge?: string }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isInWishlist = wishlistItems.some((i) => i.id === item.id);

  const handleQuickViewUpdate = () => dispatch(updateQuickView({ ...item }));
  const handleAddToCart = () => {
    dispatch(addItemToCart({ ...item, quantity: 1 }));
    showToast.success("Added to cart");
  };
  const handleProductDetails = () => dispatch(updateproductDetails({ ...item }));
  
  const handleItemToWishList = () => {
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(item.id));
      showToast.success("Removed from wishlist");
    } else {
      dispatch(addItemToWishlist({ ...item, status: "available", quantity: 1 }));
      showToast.success("Added to wishlist");
    }
  };

  return (
    <div className="group flex flex-col h-full">
      {/* Image Container */}
      <div 
        className="relative overflow-hidden flex items-center justify-center rounded-xl mb-4 w-full"
        style={{ background: "#FEF5EC", aspectRatio: "4/5" }}
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-[#C4896A] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-sm shadow-sm">
              {badge}
            </span>
          </div>
        )}

        {item.imgs?.previews?.length > 1 ? (
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation={true}
            className="w-full h-full product-item-swiper"
            spaceBetween={0}
            slidesPerView={1}
            style={{
              "--swiper-pagination-color": "#C4896A",
              "--swiper-navigation-color": "#C4896A",
              "--swiper-navigation-size": "16px",
            } as any}
          >
            {item.imgs.previews.map((img, idx) => (
              <SwiperSlide key={idx} className="w-full h-full relative">
                <Image 
                  src={img} 
                  alt={`${item.title} - ${idx + 1}`} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Image 
            src={item.imgs?.previews?.[0] || "/images/placeholder.jpg"} 
            alt={item.title} 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

        <div className="absolute bottom-4 left-0 w-full flex justify-center gap-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4 z-10 pointer-events-auto">
          <button
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
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
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 ${
              isInWishlist ? "bg-[#3D2B1F] text-white" : "bg-white text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex items-center gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          ))}
        </div>
        <h3
          className="font-medium text-sm sm:text-base mb-1.5 transition-colors duration-200 line-clamp-1"
          style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
          onClick={() => handleProductDetails()}
        >
          <Link href="/shop-details" className="hover:text-[#C4896A]">
            {item.title}
          </Link>
        </h3>
        
        <div className="flex items-center gap-2 mt-auto">
          <span className="font-semibold text-sm sm:text-base" style={{ color: "#C4896A" }}>
            ${item.discountedPrice}
          </span>
          {item.price > item.discountedPrice && (
            <span className="text-xs sm:text-sm line-through" style={{ color: "#A89F95" }}>
              ${item.price}
            </span>
          )}
        </div>
      </div>
      
      {/* Internal style for swiper to hide buttons unless hovered */}
      <style>{`
        .product-item-swiper .swiper-button-next,
        .product-item-swiper .swiper-button-prev {
          opacity: 0;
          transition: opacity 0.3s;
          background-color: rgba(255, 255, 255, 0.8);
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
        .group:hover .product-item-swiper .swiper-button-next,
        .group:hover .product-item-swiper .swiper-button-prev {
          opacity: 1;
        }
        .product-item-swiper .swiper-button-next::after,
        .product-item-swiper .swiper-button-prev::after {
          font-size: 14px !important;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default ProductItem;
