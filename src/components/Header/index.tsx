"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { menuData } from "./menuData";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useWishlistModalContext } from "@/app/context/WishlistSidebarModalContext";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// Icon components
// ─────────────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z" fill="currentColor" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 1.25C9.37666 1.25 7.25001 3.37665 7.25001 6C7.25001 8.62335 9.37666 10.75 12 10.75C14.6234 10.75 16.75 8.62335 16.75 6C16.75 3.37665 14.6234 1.25 12 1.25ZM8.75001 6C8.75001 4.20507 10.2051 2.75 12 2.75C13.7949 2.75 15.25 4.20507 15.25 6C15.25 7.79493 13.7949 9.25 12 9.25C10.2051 9.25 8.75001 7.79493 8.75001 6Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 12.25C9.68646 12.25 7.55494 12.7759 5.97546 13.6643C4.4195 14.5396 3.25001 15.8661 3.25001 17.5C3.24882 18.7638 3.2474 20.222 4.52642 21.2635C5.15589 21.7761 6.03649 22.1406 7.22622 22.3815C8.41927 22.6229 9.97424 22.75 12 22.75C14.0258 22.75 15.5808 22.6229 16.7738 22.3815C17.9635 22.1406 18.8441 21.7761 19.4736 21.2635C20.7526 20.222 20.7512 18.7638 20.7501 17.602L20.75 17.5C20.75 15.8661 19.5805 14.5396 18.0246 13.6643C16.4451 12.7759 14.3136 12.25 12 12.25Z" fill="currentColor" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M1.29266 2.7512C1.43005 2.36044 1.8582 2.15503 2.24896 2.29242L2.55036 2.39838C3.16689 2.61511 3.69052 2.79919 4.10261 3.00139C4.54324 3.21759 4.92109 3.48393 5.20527 3.89979C5.48725 4.31243 5.60367 4.76515 5.6574 5.26153C5.66124 5.29706 5.6648 5.33321 5.66809 5.36996L17.1203 5.36996C17.9389 5.36995 18.7735 5.36993 19.4606 5.44674C19.8103 5.48584 20.1569 5.54814 20.4634 5.65583C20.7639 5.76141 21.0942 5.93432 21.3292 6.23974C21.711 6.73613 21.7777 7.31414 21.7416 7.90034C21.7071 8.45845 21.5686 9.15234 21.4039 9.97723L20.8836 12.5033C20.7339 13.2298 20.6079 13.841 20.4455 14.3231C20.2731 14.8346 20.0341 15.2842 19.6076 15.6318C19.1811 15.9793 18.6925 16.1226 18.1568 16.1882C17.6518 16.25 17.0278 16.25 16.2862 16.25H10.8804C9.53464 16.25 8.44479 16.25 7.58656 16.1283C6.69032 16.0012 5.93752 15.7285 5.34366 15.1022C4.79742 14.526 4.50529 13.9144 4.35897 13.0601C4.22191 12.2598 4.20828 11.2125 4.20828 9.75996V7.03832C4.20828 6.29837 4.20726 5.80316 4.16611 5.42295C4.12678 5.0596 4.05708 4.87818 3.96682 4.74609C3.87876 4.61723 3.74509 4.4968 3.44186 4.34802C3.11902 4.18961 2.68026 4.03406 2.01266 3.79934L1.75145 3.7075C1.36068 3.57012 1.15527 3.14197 1.29266 2.7512ZM5.70828 6.86996V9.75996C5.70828 11.249 5.72628 12.1578 5.83744 12.8068C5.93933 13.4018 6.11202 13.7324 6.43219 14.0701C6.70473 14.3576 7.08235 14.5418 7.79716 14.6432C8.53783 14.7482 9.5209 14.75 10.9377 14.75H16.2406C17.0399 14.75 17.5714 14.7487 17.9746 14.6993C18.3573 14.6525 18.5348 14.571 18.66 14.469C18.7853 14.3669 18.9009 14.2095 19.024 13.8441C19.1537 13.4592 19.2623 12.9389 19.4237 12.156L19.9225 9.73591C20.1005 8.84376 20.217 8.2515 20.2444 7.80793C20.2704 7.38648 20.2043 7.23927 20.1429 7.15786C19.9661 7.07101 19.8107 7.01639 19.5895 6.97049C19.2939 6.93745 18.6991 6.87096 17.089 6.86996H5.70828Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74285 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74285 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M14.25 19.5001C14.25 20.7427 15.2574 21.7501 16.5 21.7501C17.7426 21.7501 18.75 20.7427 18.75 19.5001C18.75 18.2574 17.7426 17.2501 16.5 17.2501C15.2574 17.2501 14.25 18.2574 14.25 19.5001Z" fill="currentColor" />
  </svg>
);

const ChevronDown = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M2.95363 5.67461C3.13334 5.46495 3.44899 5.44067 3.65866 5.62038L7.99993 9.34147L12.3412 5.62038C12.5509 5.44067 12.8665 5.46495 13.0462 5.67461C13.2259 5.88428 13.2017 6.19993 12.992 6.37964L8.32532 10.3796C8.13808 10.5401 7.86178 10.5401 7.67453 10.3796L3.00787 6.37964C2.7982 6.19993 2.77392 5.88428 2.95363 5.67461Z" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Desktop dropdown
// ─────────────────────────────────────────────────────────────────────────────
const NavDropdown = ({ menuItem }: { menuItem: any }) => {
  const [open, setOpen] = useState(false);
  const pathUrl = usePathname();
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = pathUrl.includes(menuItem.title.toLowerCase());

  return (
    <li ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-sm font-medium tracking-wide capitalize transition-colors duration-200
          ${isActive ? "text-[#C4896A]" : "text-gray-700 hover:text-[#C4896A]"}`}
      >
        {menuItem.title}
        <ChevronDown className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          className="absolute left-0 top-full mt-3 w-52 rounded-xl py-2 z-50"
          style={{
            background: "#FFFAF5",
            border: "1px solid #E3C9A8",
            boxShadow: "0px 8px 32px rgba(227,201,168,0.40), 0px 2px 8px rgba(221,175,152,0.15)",
          }}
        >
          {menuItem.submenu.map((item: any, i: number) => (
            <li key={i}>
              <Link
                href={item.path}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-sm transition-colors duration-150
                  ${pathUrl === item.path
                    ? "text-[#C4896A] font-medium bg-[#FFFAF5]"
                    : "text-gray-600 hover:text-[#C4896A] hover:bg-[#FFFAF5]"}`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Mobile sidebar accordion item
// ─────────────────────────────────────────────────────────────────────────────
const MobileSidebarItem = ({ menuItem, onClose }: { menuItem: any; onClose: () => void }) => {
  const [open, setOpen] = useState(false);
  const pathUrl = usePathname();

  if (!menuItem.submenu) {
    return (
      <li style={{ borderBottom: "1px solid #E3C9A8" }}>
        <Link
          href={menuItem.path}
          onClick={onClose}
          className={`flex items-center py-4 px-1 text-[15px] font-medium capitalize tracking-wide transition-colors duration-200
            ${pathUrl === menuItem.path ? "text-[#C4896A]" : "text-gray-700 hover:text-[#C4896A]"}`}
        >
          {menuItem.title}
        </Link>
      </li>
    );
  }

  return (
    <li style={{ borderBottom: "1px solid #E3C9A8" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 px-1 text-[15px] font-medium capitalize tracking-wide text-gray-700 hover:text-[#C4896A] transition-colors duration-200"
      >
        {menuItem.title}
        <ChevronDown className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        style={{
          maxHeight: open ? "600px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <ul className="pb-2">
          {menuItem.submenu.map((item: any, i: number) => (
            <li key={i}>
              <Link
                href={item.path}
                onClick={onClose}
                className={`block py-2.5 pl-4 pr-2 text-sm rounded-lg mx-1 my-0.5 transition-colors duration-150
                  ${pathUrl === item.path
                    ? "text-[#C4896A] font-medium bg-[#FFFAF5]"
                    : "text-gray-500 hover:text-[#C4896A] hover:bg-[#FFFAF5]"}`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Icon button wrapper
// ─────────────────────────────────────────────────────────────────────────────
const IconBtn = ({
  children,
  label,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) => (
  <button
    aria-label={label}
    onClick={onClick}
    className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
    style={{
      color: active ? "#C4896A" : "#555",
      background: active ? "#FFFAF5" : "transparent",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.color = "#C4896A";
      (e.currentTarget as HTMLElement).style.background = "#FFFAF5";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.color = active ? "#C4896A" : "#555";
      (e.currentTarget as HTMLElement).style.background = active ? "#FFFAF5" : "transparent";
    }}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Header
// ─────────────────────────────────────────────────────────────────────────────
const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathUrl = usePathname();

  const { openCartModal } = useCartModalContext();
  const { openWishlistModal } = useWishlistModalContext();
  const product = useAppSelector((state) => state.cartReducer.items);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Supabase Auth listener
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setCurrentUser(data.user);
      });
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setCurrentUser(session?.user ?? null);
        }
      );
      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (e) {
      // Supabase unconfigured
    }
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  // Sticky behaviour
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY >= 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus search input when popover opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close search popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const logoSize = sticky ? 36 : 44;

  return (
    <>
      {/* Cinzel font for brand name (closest Google Fonts match to Aries Small Cap Roman) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&display=swap');
        .thv-brand { font-family: 'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif; font-variant: small-caps; letter-spacing: 0.05em; }
      `}</style>

      {/* ── HEADER BAR ──────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 9999,
          background: sticky ? "#FFFAF5" : "#FFFAF5",
          borderBottom: `1px solid ${sticky ? "#E3C9A8" : "#EDD9B8"}`,
          boxShadow: sticky
            ? "0 4px 24px rgba(227,201,168,0.40), 0 1px 6px rgba(221,175,152,0.20)"
            : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 xl:px-8">
          <div
            className="flex items-center justify-between gap-4"
            style={{ paddingTop: sticky ? "10px" : "14px", paddingBottom: sticky ? "10px" : "14px", transition: "padding 0.3s" }}
          >
            {/* ── LEFT: Brand & Hamburger ───────────────────────────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hamburger (mobile only) */}
              <span className="lg:hidden -ml-2">
                <IconBtn label="Open menu" onClick={() => setSidebarOpen(true)}>
                  <HamburgerIcon />
                </IconBtn>
              </span>
              <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
                <div
                className="relative flex-shrink-0 overflow-hidden rounded-md"
                style={{
                  width: logoSize,
                  height: logoSize,
                  transition: "width 0.3s, height 0.3s",
                  border: "1px solid #E3C9A8",
                  background: "#fff",
                }}
              >
                <Image
                  src="/images/logo/logo.png"
                  alt="The Handmade Vendor"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col" style={{ lineHeight: 1.15 }}>
                <span
                  className="thv-brand font-semibold text-gray-800 transition-all duration-300"
                  style={{ fontSize: sticky ? "0.8rem" : "0.95rem" }}
                >
                  The Handmade
                </span>
                <span
                  className="thv-brand font-semibold transition-all duration-300"
                  style={{ fontSize: sticky ? "0.8rem" : "0.95rem", color: "#C4896A" }}
                >
                  Vendor
                </span>
              </div>
              </Link>
            </div>

            {/* ── CENTER: Nav (desktop) ──────────────────────────────────── */}
            <nav className="hidden lg:flex flex-1 items-center justify-center">
              <ul className="flex items-center gap-7 xl:gap-9">
                {menuData.map((item, i) =>
                  item.submenu ? (
                    <NavDropdown key={i} menuItem={item} />
                  ) : (
                    <li key={i} className="relative group">
                      <Link
                        href={item.path}
                        className="text-sm font-medium tracking-wide capitalize text-gray-700 hover:text-[#C4896A] transition-colors duration-200"
                      >
                        {item.title}
                      </Link>
                      {/* underline accent */}
                      <span
                        className="absolute -bottom-1 left-0 w-0 h-[2px] rounded-full group-hover:w-full transition-all duration-200"
                        style={{ background: "#DDAF98" }}
                      />
                    </li>
                  )
                )}
              </ul>
            </nav>

            {/* ── RIGHT: Icons ───────────────────────────────────────────── */}
            <div className="flex items-center gap-0.5 text-gray-700 sm:gap-1 flex-shrink-0">

              {/* Search */}
              <div ref={searchRef} className="relative hidden lg:block">
                <IconBtn label="Search" onClick={() => setSearchOpen(!searchOpen)} active={searchOpen}>
                  <SearchIcon />
                </IconBtn>

                {/* Search popover */}
                {searchOpen && (
                  <div
                    className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 rounded-2xl p-3 z-50"
                    style={{
                      background: "#FFFAF5",
                      boxShadow: "0 8px 32px rgba(227,201,168,0.45), 0 2px 8px rgba(221,175,152,0.20)",
                    }}
                  >
                    <div
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                      style={{ background: "#FFFAF5", border: "1px solid #E3C9A8" }}
                    >
                      <span style={{ color: "#DDAF98" }}>
                        <SearchIcon />
                      </span>
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for products..."
                        className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Profile / Account (Desktop only - on mobile view it lives inside the sidebar) */}
              <div className="hidden lg:block">
                {currentUser ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      aria-label="User account"
                      className="relative"
                    >
                      <IconBtn label="My Account" active={userMenuOpen}>
                        <UserIcon />
                      </IconBtn>
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white pointer-events-none"
                        style={{ background: "#C4896A" }}
                      />
                    </button>

                    {userMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{ borderColor: "#E3C9A8" }}
                      >
                        <div className="px-3 py-2 border-b border-[#E3C9A8]/40 mb-2">
                          <span
                            className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C4896A] block"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            Atelier Member
                          </span>
                          <p className="text-xs font-medium text-[#3D2B1F] truncate mt-0.5">
                            {currentUser.user_metadata?.first_name
                              ? `${currentUser.user_metadata.first_name} ${currentUser.user_metadata.last_name || ""}`.trim()
                              : currentUser.email}
                          </p>
                        </div>

                        <div className="space-y-1 text-xs">
                          <Link
                            href="/my-account"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#3D2B1F] hover:bg-[#FEF5EC] transition-colors"
                          >
                            <span>My Account</span>
                          </Link>

                          <button
                            type="button"
                            onClick={async () => {
                              const supabase = createClient();
                              await supabase.auth.signOut();
                              setUserMenuOpen(false);
                              window.location.href = "/";
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-[#FEF5EC] transition-colors"
                          >
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/signin" aria-label="Sign in">
                    <IconBtn label="Sign in" active={pathUrl === "/signin" || pathUrl === "/profile"}>
                      <UserIcon />
                    </IconBtn>
                  </Link>
                )}
              </div>

              {/* Wishlist */}
              <div className="relative">
                <IconBtn label="Wishlist" onClick={openWishlistModal}>
                  <HeartIcon />
                </IconBtn>
                {wishlistItems.length > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full leading-none pointer-events-none"
                    style={{
                      minWidth: "17px",
                      minHeight: "17px",
                      padding: "0 3px",
                      background: "#C4896A",
                    }}
                  >
                    {wishlistItems.length}
                  </span>
                )}
              </div>

              {/* Cart */}
              <div className="relative">
                <IconBtn label="Cart" onClick={openCartModal}>
                  <CartIcon />
                </IconBtn>
                {product.length > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full leading-none"
                    style={{
                      minWidth: "17px",
                      minHeight: "17px",
                      padding: "0 3px",
                      background: "#C4896A",
                    }}
                  >
                    {product.length}
                  </span>
                )}
              </div>

              {/* Divider (desktop only) */}
              <span className="hidden lg:block w-px h-5 mx-1" style={{ background: "#E3C9A8" }} />
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE SIDEBAR ──────────────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(70,40,20,0.35)",
          backdropFilter: "blur(2px)",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        className="lg:hidden"
      />

      {/* Sidebar panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "300px",
          zIndex: 10001,
          display: "flex",
          flexDirection: "column",
          background: "#FFFAF5",
          borderRight: "1px solid #E3C9A8",
          boxShadow: "4px 0 32px rgba(227,201,168,0.35)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="lg:hidden"
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #E3C9A8" }}
        >
          <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
            <div
              className="relative flex-shrink-0 rounded-md overflow-hidden"
              style={{ width: 36, height: 36, border: "1px solid #E3C9A8", background: "#fff" }}
            >
              <Image src="/images/logo/logo.png" alt="Logo" fill className="object-contain p-0.5" />
            </div>
            <div className="flex flex-col" style={{ lineHeight: 1.15 }}>
              <span className="thv-brand font-semibold text-gray-800 text-sm">The Handmade</span>
              <span className="thv-brand font-semibold text-sm" style={{ color: "#C4896A" }}>Vendor</span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200"
            style={{ color: "#999", background: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#C4896A";
              (e.currentTarget as HTMLElement).style.background = "#FFFAF5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#999";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Sidebar nav */}
        <nav className="flex-1 overflow-y-auto px-5 py-2">
          <ul>
            {menuData.map((item, i) => (
              <MobileSidebarItem key={i} menuItem={item} onClose={() => setSidebarOpen(false)} />
            ))}
          </ul>
        </nav>

        {/* Sidebar search */}
        <div className="px-5 py-4" style={{ borderTop: "1px solid #E3C9A8" }}>
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
            style={{ background: "#FFFAF5", border: "1px solid #E3C9A8" }}
          >
            <span style={{ color: "#DDAF98" }}>
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Search for products..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Sidebar Member / Profile section */}
        <div
          className="px-5 py-4 space-y-3"
          style={{ borderTop: "1px solid #E3C9A8" }}
        >
          {currentUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FEF5EC] border border-[#E3C9A8]/60">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ background: "#C4896A" }}
                >
                  {(currentUser.user_metadata?.first_name?.[0] || currentUser.email?.[0] || "U").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C4896A] block"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Atelier Member
                  </span>
                  <p className="text-sm font-semibold text-[#3D2B1F] truncate">
                    {currentUser.user_metadata?.first_name
                      ? `${currentUser.user_metadata.first_name} ${currentUser.user_metadata.last_name || ""}`.trim()
                      : currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href="/my-account"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#D49777] text-white hover:bg-[#D49777] transition-colors text-sm font-medium"
                >
                  <UserIcon />
                  <span>My Account</span>
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    setSidebarOpen(false);
                    window.location.href = "/";
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#D49777] text-red-600 bg-red-50/50 hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                href="/signin"
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border border-[#E3C9A8] ${
                  pathUrl === "/signin" || pathUrl === "/profile"
                    ? "bg-[#3D2B1F] text-white shadow-sm"
                    : "bg-white text-[#3D2B1F] hover:bg-[#FEF5EC]"
                }`}
              >
                <UserIcon />
                <span>Sign In</span>
              </Link>
              <Link
                href="/signup"
                onClick={() => setSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 bg-[#D49777] text-white hover:bg-[#D49777] shadow-sm"
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Header;
