"use client";
import React, { useState } from "react";
import Link from "next/link";
import { showToast } from "@/utils/toast";
import AdminNavbar from "@/components/Admin/AdminNavbar";

interface AdminDashboardProps {
  adminEmail: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminEmail }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "products" | "security">("overview");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      showToast.success("Curator session terminated. Returning to storefront.");
      window.location.href = "/";
    } catch (err) {
      window.location.href = "/";
    }
  };

  const navItems = [
    {
      id: "overview",
      label: "Sanctuary Overview",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "orders",
      label: "Bespoke Commissions",
      badge: "Active",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: "products",
      label: "Curated Catalogue",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      id: "security",
      label: "Vault Gate & Security",
      badge: "256-Bit",
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
      {/* ── Top Navbar (Shared with homepage logo aesthetic + Hamburger button) ── */}
      <AdminNavbar
        showHamburger={true}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
        isLoggedIn={true}
        adminEmail={adminEmail}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      {/* ── Slide-over / Collapsible Sidebar ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Sidebar Drawer */}
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-[#FFFFFF] border-r border-[#E3C9A8] shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200">
            {/* Top: Header & Nav links */}
            <div>
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-[#E3C9A8]/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C4896A] block">
                    Navigation
                  </span>
                  <span
                    className="text-sm font-semibold text-[#2A1E17] uppercase tracking-wider"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Atelier Console
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A6B5D] hover:text-[#3D2B1F] hover:bg-[#FEF5EC] transition-colors cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6L18 18" />
                  </svg>
                </button>
              </div>

              {/* Navigation Menu */}
              <nav className="p-3.5 space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#3D2B1F] text-[#E3C9A8] shadow-2xs"
                          : "text-[#5C4D42] hover:bg-[#FEF5EC] hover:text-[#C4896A]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? "text-[#E3C9A8]" : "text-[#8C5D3B]"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-[#C4896A] text-white"
                              : "bg-[#FEF5EC] text-[#8C5D3B] border border-[#E3C9A8]/70"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom: Curator Profile & External Quick Links */}
            <div className="p-4 border-t border-[#E3C9A8]/50 bg-[#FFFAF5]/50 space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E3C9A8]/60">
                <div className="w-8 h-8 rounded-full bg-[#3D2B1F] text-[#E3C9A8] flex items-center justify-center font-serif text-xs font-bold flex-shrink-0">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#2A1E17] truncate">Atelier Curator</div>
                  <div className="text-[11px] font-mono text-[#7A6B5D] truncate">{adminEmail}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#E3C9A8] text-[11px] font-semibold text-[#7A583A] hover:bg-white hover:border-[#C4896A] transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>Storefront</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#3D2B1F] hover:bg-[#C4896A] text-[#E3C9A8] hover:text-white text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSigningOut ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : null}
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Dashboard Body ── */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 xl:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-[#E3C9A8]/80 bg-[#FFFFFF] p-6 sm:p-8 shadow-[0_4px_24px_rgba(61,43,31,0.04)] relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-[#E3C9A8]/15 blur-2xl" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C4896A] block">
                Sanctuary Overview
              </span>
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#2A1E17]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Atelier Administration Console
              </h1>
              <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-xl">
                Manage bespoke leather commissions, inspect verified patron accounts, and govern the curated artisanal catalogue.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-[#FEF5EC] border border-[#E3C9A8] text-center">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#8C5D3B]">
                  Gate Status
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Secured
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Orders */}
          <div className="rounded-xl border border-[#E3C9A8]/70 bg-white p-5 shadow-2xs hover:border-[#C4896A]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6B5D]">
                Bespoke Commissions
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FEF5EC] text-[#C4896A] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#3D2B1F]" style={{ fontFamily: "'Cinzel', serif" }}>
              Active
            </div>
            <span className="text-[11px] text-[#A09082] block mt-1">Direct Courier Sync Online</span>
          </div>

          {/* Card 2: Masterpieces */}
          <div className="rounded-xl border border-[#E3C9A8]/70 bg-white p-5 shadow-2xs hover:border-[#C4896A]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6B5D]">
                Curated Catalogue
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FEF5EC] text-[#C4896A] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#3D2B1F]" style={{ fontFamily: "'Cinzel', serif" }}>
              Live
            </div>
            <span className="text-[11px] text-[#A09082] block mt-1">Artisanal Leather Creations</span>
          </div>

          {/* Card 3: Database & Cloud */}
          <div className="rounded-xl border border-[#E3C9A8]/70 bg-white p-5 shadow-2xs hover:border-[#C4896A]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6B5D]">
                Vault Database
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FEF5EC] text-[#C4896A] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#3D2B1F]" style={{ fontFamily: "'Cinzel', serif" }}>
              PostgreSQL
            </div>
            <span className="text-[11px] text-[#A09082] block mt-1">Supabase Cloud Connected</span>
          </div>

          {/* Card 4: Security Shield */}
          <div className="rounded-xl border border-[#E3C9A8]/70 bg-white p-5 shadow-2xs hover:border-[#C4896A]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6B5D]">
                Encryption Level
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FEF5EC] text-[#C4896A] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600" style={{ fontFamily: "'Cinzel', serif" }}>
              256-Bit
            </div>
            <span className="text-[11px] text-[#A09082] block mt-1">HMAC-SHA256 Signed Gateway</span>
          </div>
        </div>

        {/* Administration Hub Panel */}
        <div className="rounded-2xl border border-[#E3C9A8]/70 bg-white shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3C9A8]/40">
            <div>
              <h2
                className="text-base sm:text-lg font-semibold text-[#2A1E17] uppercase tracking-wider"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Curator Management Actions
              </h2>
              <p className="text-xs text-[#7A6B5D] mt-0.5">
                Quick administrative operations for The Handmade Vendor platform.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/shop"
              className="group p-5 rounded-xl border border-[#E3C9A8]/60 bg-[#FFFAF5]/40 hover:bg-[#FEF5EC] hover:border-[#C4896A] transition-all space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#3D2B1F] group-hover:text-[#C4896A] transition-colors">
                  Inspect Boutique Catalogue
                </span>
                <span className="text-xs text-[#C4896A]">→</span>
              </div>
              <p className="text-xs text-[#7A6B5D]">
                Review all active handcrafted creations, pricing tiers, and inventory states.
              </p>
            </Link>

            <Link
              href="/my-account"
              className="group p-5 rounded-xl border border-[#E3C9A8]/60 bg-[#FFFAF5]/40 hover:bg-[#FEF5EC] hover:border-[#C4896A] transition-all space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#3D2B1F] group-hover:text-[#C4896A] transition-colors">
                  Patron Sanctuary Portal
                </span>
                <span className="text-xs text-[#C4896A]">→</span>
              </div>
              <p className="text-xs text-[#7A6B5D]">
                Inspect patron profile architectures, delivery destinations, and order tracking flows.
              </p>
            </Link>

            <div className="p-5 rounded-xl border border-[#E3C9A8]/60 bg-[#FFFAF5]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#3D2B1F]">
                  Admin Gate Protection
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Enforced
                </span>
              </div>
              <p className="text-xs text-[#7A6B5D]">
                Protected route active. Login portal only opens when unlocked via the footer store icon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
