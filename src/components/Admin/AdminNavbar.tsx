"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

interface AdminNavbarProps {
  showHamburger?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isLoggedIn?: boolean;
  adminEmail?: string;
  onSignOut?: () => void;
  isSigningOut?: boolean;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  showHamburger = false,
  onToggleSidebar,
  isSidebarOpen = false,
  isLoggedIn = false,
  adminEmail = "admin@vendor.com",
  onSignOut,
  isSigningOut = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFAF5] border-b border-[#E3C9A8] shadow-[0_2px_12px_rgba(227,201,168,0.25)] transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Left Side: Hamburger (optional) + Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {showHamburger && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? "Close admin sidebar" : "Open admin sidebar"}
              className="p-1.5 -ml-1 sm:p-2 sm:-ml-1.5 rounded-lg text-[#3D2B1F] hover:bg-[#FEF5EC] hover:text-[#C4896A] border border-transparent hover:border-[#E3C9A8]/70 transition-all cursor-pointer flex-shrink-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isSidebarOpen ? (
                  <path d="M18 6L6 18M6 6L18 18" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" />
                )}
              </svg>
            </button>
          )}

          {/* Logo matching homepage navbar */}
          <Link href={isLoggedIn ? "/admin" : "/"} className="flex items-center gap-3 flex-shrink-0 group">
            <div
              className="relative flex-shrink-0 overflow-hidden rounded-md"
              style={{
                width: 38,
                height: 38,
                border: "1px solid #E3C9A8",
                background: "#fff",
              }}
            >
              <Image
                src="/images/logo/logo.png"
                alt="The Handmade Vendor"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col" style={{ lineHeight: 1.15 }}>
              <span
                className="font-semibold text-gray-800 transition-colors tracking-[0.05em]"
                style={{
                  fontFamily: "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif",
                  fontVariant: "small-caps",
                  fontSize: "0.95rem",
                }}
              >
                The Handmade
              </span>
              <span
                className="font-semibold transition-colors tracking-[0.05em]"
                style={{
                  fontFamily: "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif",
                  fontVariant: "small-caps",
                  fontSize: "0.95rem",
                  color: "#C4896A",
                }}
              >
                Vendor
              </span>
            </div>
          </Link>

          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-[#E3C9A8]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8C5D3B]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Atelier Sanctuary
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Navbar items */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          {/* [Return to Storefront] link (hidden on mobile when logged in, visible on desktop) */}
          <Link
            href="/"
            className={`${
              isLoggedIn ? "hidden sm:inline-flex" : "inline-flex"
            } items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border border-[#E3C9A8] text-xs font-medium text-[#7A6B5D] hover:text-[#3D2B1F] hover:border-[#C4896A] hover:bg-[#FEF5EC] transition-all duration-200 shadow-2xs`}
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
              className="text-[#C4896A]"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="whitespace-nowrap">Return to Storefront</span>
          </Link>

          {isLoggedIn && (
            /* Curator Info Pill (Logout button removed from navbar on both desktop & mobile; available in sidebar) */
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF5EC] border border-[#E3C9A8]/70 text-xs">
              <span className="font-mono text-[11px] text-[#5C4D42] hidden sm:inline">{adminEmail}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C4896A]">Admin</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;

