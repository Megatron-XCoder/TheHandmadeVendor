"use client";
import React, { useEffect, useState } from "react";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { removeItemFromCart, selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import SingleItem from "./SingleItem";
import Link from "next/link";
import EmptyCart from "./EmptyCart";

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCartModal();
    };

    if (isCartModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-all duration-500 ${
        isCartModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop overlay */}
      <div
        onClick={closeCartModal}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
          isCartModalOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-full max-w-[440px] sm:max-w-[470px] flex flex-col z-[100000] transition-transform duration-500 ease-out border-l ${
          isCartModalOpen ? "translate-x-0" : "translate-x-full"
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
              Shopping Bag
            </h2>

            {/* Close Button */}
            <button
              onClick={closeCartModal}
              aria-label="Close cart"
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── CART ITEMS SCROLLABLE LIST ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {cartItems.length > 0 ? (
            cartItems.map((item, key) => (
              <SingleItem
                key={item.id || key}
                item={item}
                removeItemFromCart={removeItemFromCart}
              />
            ))
          ) : (
            <EmptyCart />
          )}
        </div>

        {/* ── FOOTER / CHECKOUT ──────────────────────────────────────────────── */}
        {cartItems.length > 0 && (
          <div
            className="flex-shrink-0 px-5 sm:px-7 pt-4 pb-5 sm:pb-6 border-t"
            style={{
              background: "#FFFAF5",
              borderColor: "#E3C9A8",
              boxShadow: "0 -4px 20px rgba(227,201,168,0.25)",
            }}
          >
            {/* Subtotal */}
            <div className="flex items-baseline justify-between mb-2">
              <span
                className="text-xs sm:text-sm font-medium tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Cinzel', serif", color: "#7A6B5D" }}
              >
                Estimated Subtotal
              </span>
              <span
                className="text-lg sm:text-xl font-bold"
                style={{ color: "#3D2B1F" }}
              >
                ${Number(totalPrice).toFixed(2)}
              </span>
            </div>

            <p className="text-[11px] text-[#A09082] mb-4 text-center sm:text-left leading-relaxed">
              Shipping & taxes calculated at checkout. Complimentary luxury gift packaging included.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <Link
                onClick={closeCartModal}
                href="/checkout"
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
                <span>Proceed to Checkout</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>

              <button
                onClick={closeCartModal}
                className="w-full flex items-center justify-center py-2.5 px-6 rounded-full text-xs sm:text-sm font-medium tracking-[0.15em] uppercase border transition-all duration-300"
                style={{
                  borderColor: "#3D2B1F",
                  color: "#3D2B1F",
                  background: "transparent",
                  fontFamily: "'Cinzel', serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#FEF5EC";
                  (e.currentTarget as HTMLElement).style.borderColor = "#C4896A";
                  (e.currentTarget as HTMLElement).style.color = "#C4896A";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "#3D2B1F";
                  (e.currentTarget as HTMLElement).style.color = "#3D2B1F";
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebarModal;
