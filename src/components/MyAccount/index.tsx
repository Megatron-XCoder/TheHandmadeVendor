"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressModal, { AddressData } from "./AddressModal";
import Orders from "../Orders";
import { createClient } from "@/utils/supabase/client";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { showToast } from "@/utils/toast";
import AtelierDropdown, { DropdownItem } from "../Common/AtelierDropdown";

export default function MyAccount() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Tab navigation state - initial sidebar collapsed per user request
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Address Modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressModalType, setAddressModalType] = useState<"shipping" | "billing">("shipping");

  // User & Profile State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Orders summary state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Addresses state (persisted locally)
  const [shippingAddress, setShippingAddress] = useState<AddressData>({
    name: "James Septimus",
    phone: "+1 (555) 234-5678",
    street: "7398 Smoke Ranch Road",
    city: "Las Vegas",
    state: "Nevada",
    postalCode: "89128",
    country: "United States",
  });

  const [billingAddress, setBillingAddress] = useState<AddressData>({
    name: "James Septimus",
    phone: "+1 (555) 234-5678",
    street: "7398 Smoke Ranch Road",
    city: "Las Vegas",
    state: "Nevada",
    postalCode: "89128",
    country: "United States",
  });

  // Account details form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "United States",
    preferredCurrency: "USD ($)",
    monogramInitials: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Security password form state
  const [securityForm, setSecurityForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Wishlist from Redux
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const [wishlistPage, setWishlistPage] = useState(1);
  const wishlistPageSize = 6;

  // Load user & profile from Supabase
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (data?.user) {
          setCurrentUser(data.user);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
            setProfileForm({
              firstName: profileData.first_name || "",
              lastName: profileData.last_name || "",
              email: profileData.email || data.user.email || "",
              phone: profileData.phone || "",
              country: "United States",
              preferredCurrency: "USD ($)",
              monogramInitials: `${profileData.first_name?.[0] || ""}${profileData.last_name?.[0] || ""}`.toUpperCase(),
            });
          } else {
            setProfileForm((prev) => ({
              ...prev,
              email: data.user.email || "",
              firstName: data.user.user_metadata?.first_name || "",
              lastName: data.user.user_metadata?.last_name || "",
            }));
          }
        }
      } catch (err) {
        console.warn("Could not load user profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadUser();

    // Load persisted addresses from localStorage if available
    try {
      const savedShip = localStorage.getItem("thv_shipping_address");
      if (savedShip) setShippingAddress(JSON.parse(savedShip));
      const savedBill = localStorage.getItem("thv_billing_address");
      if (savedBill) setBillingAddress(JSON.parse(savedBill));
    } catch (e) {
      // LocalStorage unavailable
    }
  }, []);

  // Fetch orders summary for stats
  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((err) => {
        console.warn("Could not fetch orders overview:", err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, []);

  // Derived user display values
  const displayName = useMemo(() => {
    if (profile?.first_name) {
      return `${profile.first_name} ${profile.last_name || ""}`.trim();
    }
    if (currentUser?.user_metadata?.first_name) {
      return `${currentUser.user_metadata.first_name} ${currentUser.user_metadata.last_name || ""}`.trim();
    }
    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }
    return "Esteemed Patron";
  }, [profile, currentUser]);

  const memberSince = useMemo(() => {
    if (currentUser?.created_at) {
      return `Member Since ${new Date(currentUser.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    }
    return "Atelier Patron Circle";
  }, [currentUser]);

  // Orders statistics
  const inProgressCount = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === "Processing" ||
        o.status === "Artisan Crafting" ||
        o.status === "Quality Inspection" ||
        o.status === "Dispatched"
    ).length;
  }, [orders]);

  const latestOrder = orders.length > 0 ? orders[0] : null;

  // Wishlist Pagination
  const totalWishlistPages = Math.max(1, Math.ceil(wishlistItems.length / wishlistPageSize));
  const currentWishlistItems = useMemo(() => {
    const start = (wishlistPage - 1) * wishlistPageSize;
    return wishlistItems.slice(start, start + wishlistPageSize);
  }, [wishlistItems, wishlistPage]);

  // Handle Address Save
  const handleAddressSave = (updatedData: AddressData, type: "shipping" | "billing") => {
    if (type === "shipping") {
      setShippingAddress(updatedData);
      try {
        localStorage.setItem("thv_shipping_address", JSON.stringify(updatedData));
      } catch (e) {}
    } else {
      setBillingAddress(updatedData);
      try {
        localStorage.setItem("thv_billing_address", JSON.stringify(updatedData));
      } catch (e) {}
    }
    showToast.success(`${type === "shipping" ? "Shipping" : "Billing"} coordinates updated.`);
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const supabase = createClient();
      if (currentUser?.id) {
        const { error } = await supabase.from("profiles").upsert({
          id: currentUser.id,
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          phone: profileForm.phone,
          email: profileForm.email,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          throw error;
        }

        setProfile((prev: any) => ({
          ...prev,
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          phone: profileForm.phone,
          email: profileForm.email,
        }));
      }

      showToast.success("Atelier Profile details saved successfully.");
    } catch (err: any) {
      console.error("Save profile error:", err);
      showToast.error(err.message || "Failed to save profile changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityForm.newPassword) {
      showToast.error("Please enter a new password.");
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast.error("Password confirmation does not match.");
      return;
    }
    if (securityForm.newPassword.length < 8) {
      showToast.error("Password must be at least 8 characters.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: securityForm.newPassword,
      });

      if (error) throw error;

      showToast.success("Security key updated successfully.");
      setSecurityForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showToast.error(err.message || "Could not update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    const pw = securityForm.newPassword;
    if (!pw) return { score: 0, label: "Enter Password", color: "#D1D5DB" };
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (pw.length >= 12) score += 1;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    if (score <= 1) return { score: 20, label: "Fragile", color: "#EF4444" };
    if (score <= 3) return { score: 55, label: "Moderate", color: "#F59E0B" };
    if (score === 4) return { score: 85, label: "Artisan Grade", color: "#C4896A" };
    return { score: 100, label: "Impenetrable", color: "#10B981" };
  }, [securityForm.newPassword]);

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      showToast.success("Signed out of your private atelier session.");
      router.push("/signin");
    } catch (err) {
      router.push("/signin");
    }
  };

  // Move wishlist item to cart
  const handleMoveToCart = (item: any) => {
    dispatch(
      addItemToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        discountedPrice: item.discountedPrice || item.price,
        quantity: 1,
        imgs: item.imgs,
      })
    );
    dispatch(removeItemFromWishlist(item.id));
    showToast.success(`Added "${item.title}" to Atelier Bag.`);
  };

  const handleRemoveWishlist = (id: number, title: string) => {
    dispatch(removeItemFromWishlist(id));
    showToast.info(`Removed "${title}" from Wishlist.`);
  };

  // Navigation Items Config
  const navItems = [
    {
      id: "dashboard",
      label: "Sanctuary Overview",
      shortLabel: "Overview",
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "orders",
      label: "Bespoke Acquisitions",
      shortLabel: "Orders",
      badge: orders.length > 0 ? `${orders.length}` : null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: "wishlist",
      label: "Curated Wishlist",
      shortLabel: "Wishlist",
      badge: wishlistItems.length > 0 ? `${wishlistItems.length}` : null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "addresses",
      label: "Private Coordinates",
      shortLabel: "Addresses",
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "details",
      label: "Patron Profile",
      shortLabel: "Profile",
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "security",
      label: "Security & Keys",
      shortLabel: "Security",
      badge: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
  ];

  // Dropdown items formatted for AtelierDropdown
  const mobileNavDropdownItems: DropdownItem[] = navItems.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    badge: item.badge,
  }));

  const countryDropdownItems: DropdownItem[] = [
    { id: "United States", label: "United States" },
    { id: "United Kingdom", label: "United Kingdom" },
    { id: "Italy", label: "Italy (Florence Atelier Hub)" },
    { id: "France", label: "France" },
    { id: "Switzerland", label: "Switzerland" },
    { id: "United Arab Emirates", label: "United Arab Emirates" },
    { id: "Australia", label: "Australia" },
    { id: "Canada", label: "Canada" },
  ];

  const currencyDropdownItems: DropdownItem[] = [
    { id: "USD ($)", label: "USD ($) - US Dollar" },
    { id: "EUR (€)", label: "EUR (€) - Euro" },
    { id: "GBP (£)", label: "GBP (£) - British Pound" },
  ];

  return (
    <section className="min-h-screen py-8 lg:py-16 bg-[#FFFAF5] text-[#3D2B1F] antialiased">
      <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Atelier Patron Header Banner (Email removed, buttons shown with high responsiveness) */}
        <div className="mb-8 bg-gradient-to-r from-[#FFFFFF] via-[#FFFDFB] to-[#FAF4EC] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_10px_35px_-5px_rgba(61,43,31,0.06)] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
          {/* Ambient decorative watermark */}
          <div
            className="absolute -right-10 -bottom-10 pointer-events-none opacity-5 text-[180px] font-serif select-none"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            THV
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Monogram Seal */}
              <div className="relative group flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FEF5EC] to-[#F5E5D5] border-2 border-[#E3C9A8] flex items-center justify-center shadow-md">
                  <span
                    className="text-2xl sm:text-3xl font-semibold text-[#C4896A]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#3D2B1F] border-2 border-[#FFFFFF] flex items-center justify-center text-white text-[9px]">
                  ✦
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1
                    className="text-2xl sm:text-3xl font-normal text-[#2A1E17] tracking-wider"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-widest uppercase bg-[#FEF5EC] border border-[#E3C9A8]/60 text-[#C4896A]">
                    Patron Circle
                  </span>
                </div>

                {/* Email removed from header per user request */}
                <p className="text-xs sm:text-sm text-[#7A6B5D] flex items-center gap-2">
                  <span className="text-[#C4896A]">✦</span>
                  <span>{memberSince}</span>
                </p>
              </div>
            </div>

            {/* Top Quick Action Buttons: Visible on desktop and mobile */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 border-[#E3C9A8]/30 pt-4 md:pt-0">
              <Link
                href="/shop"
                className="flex-1 md:flex-initial text-center px-5 py-2.5 rounded-full border border-[#E3C9A8] text-xs font-medium tracking-wider uppercase text-[#3D2B1F] hover:bg-[#FFFAF5] hover:border-[#C4896A] transition-colors shadow-sm"
              >
                Explore Atelier
              </Link>

              <button
                onClick={handleSignOut}
                className="flex-1 md:flex-initial text-center px-5 py-2.5 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Section Selector (Powered by @headlessui/react AtelierDropdown + Desktop-style list toggle) */}
        <div className="lg:hidden mb-8 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider text-[#7A6B5D]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Account Section:
            </span>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-xs text-[#C4896A] hover:text-[#3D2B1F] font-medium transition-colors"
            >
              {isMobileMenuOpen ? "Close Full View ✕" : "View All Sections ☰"}
            </button>
          </div>

          {/* Luxury Dropdown using @headlessui/react */}
          <AtelierDropdown
            items={mobileNavDropdownItems}
            selectedId={activeTab}
            onSelect={(id) => {
              setActiveTab(id);
              setIsMobileMenuOpen(false);
            }}
            placeholder="Select Atelier Section"
            className="w-full"
            buttonClassName="py-3 px-4 rounded-2xl bg-white border-[#E3C9A8]"
          />

          {/* Full vertical navigation card on mobile if toggled */}
          {isMobileMenuOpen && (
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E3C9A8]/70 p-3 shadow-lg space-y-1.5 animate-in fade-in duration-200">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#3D2B1F] text-white shadow-sm"
                        : "text-[#3D2B1F] hover:bg-[#FFFAF5]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? "text-[#C4896A]" : "text-[#7A6B5D]"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? "bg-[#C4896A] text-white" : "bg-[#FEF5EC] text-[#C4896A]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Account Layout: Collapsible Sidebar (initially closed) + Content View */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Collapsible Sidebar (Default CLOSED/compact icon rail per user request) */}
          <aside
            className={`hidden lg:flex flex-col bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_8px_30px_rgba(61,43,31,0.05)] p-4 transition-all duration-300 relative flex-shrink-0 ${
              isSidebarCollapsed ? "w-[84px]" : "w-[300px]"
            }`}
          >
            {/* Collapse/Expand Toggle Header */}
            <div className="flex items-center justify-between px-3 py-2.5 mb-3 border-b border-[#E3C9A8]/30">
              {!isSidebarCollapsed && (
                <span
                  className="text-xs uppercase tracking-widest text-[#7A6B5D] font-medium"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Atelier Navigation
                </span>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "Click to open navigation sidebar" : "Click to collapse navigation sidebar"}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#7A6B5D] hover:text-[#3D2B1F] hover:bg-[#FFFAF5] border border-transparent hover:border-[#E3C9A8]/40 transition-colors mx-auto"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`}
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            {/* Navigation Tabs List */}
            <div className="space-y-1.5 flex-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-2xl transition-all duration-200 group relative ${
                      isSidebarCollapsed ? "justify-center p-3.5" : "justify-between px-4 py-3.5"
                    } ${
                      isActive
                        ? "bg-[#3D2B1F] text-white shadow-md shadow-[#3D2B1F]/15"
                        : "text-[#7A6B5D] hover:text-[#2A1E17] hover:bg-[#FFFAF5]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`transition-colors ${
                          isActive ? "text-[#C4896A]" : "text-[#7A6B5D] group-hover:text-[#C4896A]"
                        }`}
                      >
                        {item.icon}
                      </span>

                      {!isSidebarCollapsed && (
                        <span className="text-xs sm:text-sm font-medium tracking-wide truncate">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? "bg-[#C4896A] text-white" : "bg-[#FEF5EC] text-[#C4896A]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip in collapsed mode */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#2A1E17] text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Atelier Seal / Signout */}
            <div className="pt-4 mt-6 border-t border-[#E3C9A8]/30">
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center rounded-2xl text-xs font-medium text-[#7A6B5D] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors ${
                  isSidebarCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3"
                }`}
                title={isSidebarCollapsed ? "Sign Out" : undefined}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {!isSidebarCollapsed && <span>Sign Out</span>}
              </button>
            </div>
          </aside>

          {/* Dynamic Content Panel */}
          <main className="flex-1 w-full min-w-0">
            {/* ============================================================== */}
            {/* 1. SANCTUARY OVERVIEW (DASHBOARD) TAB                           */}
            {/* ============================================================== */}
            {activeTab === "dashboard" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Quick Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Stat 1: Total Orders */}
                  <div
                    onClick={() => setActiveTab("orders")}
                    className="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#E3C9A8]/50 shadow-[0_6px_20px_rgba(61,43,31,0.04)] hover:border-[#C4896A] transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-[#7A6B5D] font-medium">
                        Total Acquisitions
                      </span>
                      <span className="w-8 h-8 rounded-full bg-[#FEF5EC] text-[#C4896A] flex items-center justify-center group-hover:scale-110 transition-transform">
                        ✦
                      </span>
                    </div>
                    <p
                      className="text-2xl sm:text-3xl font-semibold text-[#2A1E17]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {loadingOrders ? "—" : orders.length}
                    </p>
                    <p className="text-[11px] text-[#7A6B5D] mt-1">Bespoke commissions</p>
                  </div>

                  {/* Stat 2: In-Progress */}
                  <div
                    onClick={() => setActiveTab("orders")}
                    className="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#E3C9A8]/50 shadow-[0_6px_20px_rgba(61,43,31,0.04)] hover:border-[#C4896A] transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-[#7A6B5D] font-medium">
                        In Crafting
                      </span>
                      <span className="w-8 h-8 rounded-full bg-[#FEF5EC] text-[#C4896A] flex items-center justify-center group-hover:scale-110 transition-transform">
                        ⚖
                      </span>
                    </div>
                    <p
                      className="text-2xl sm:text-3xl font-semibold text-[#C4896A]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {loadingOrders ? "—" : inProgressCount}
                    </p>
                    <p className="text-[11px] text-[#7A6B5D] mt-1">Active workshop items</p>
                  </div>

                  {/* Stat 3: Wishlist */}
                  <div
                    onClick={() => setActiveTab("wishlist")}
                    className="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#E3C9A8]/50 shadow-[0_6px_20px_rgba(61,43,31,0.04)] hover:border-[#C4896A] transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-[#7A6B5D] font-medium">
                        Curated Wishlist
                      </span>
                      <span className="w-8 h-8 rounded-full bg-[#FEF5EC] text-[#C4896A] flex items-center justify-center group-hover:scale-110 transition-transform">
                        ♥
                      </span>
                    </div>
                    <p
                      className="text-2xl sm:text-3xl font-semibold text-[#2A1E17]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {wishlistItems.length}
                    </p>
                    <p className="text-[11px] text-[#7A6B5D] mt-1">Cherished heirlooms</p>
                  </div>

                  {/* Stat 4: Membership Tier */}
                  <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-2xl border border-[#E3C9A8]/50 shadow-[0_6px_20px_rgba(61,43,31,0.04)] group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-[#7A6B5D] font-medium">
                        Patron Tier
                      </span>
                      <span className="w-8 h-8 rounded-full bg-[#FEF5EC] text-[#C4896A] flex items-center justify-center">
                        👑
                      </span>
                    </div>
                    <p
                      className="text-lg sm:text-xl font-semibold text-[#2A1E17] leading-tight"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Tier II Collector
                    </p>
                    <p className="text-[11px] text-[#C4896A] mt-1 font-medium">Complimentary Monogramming</p>
                  </div>
                </div>

                {/* Recent Acquisition Preview Banner */}
                <div className="bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_8px_30px_rgba(61,43,31,0.04)] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E3C9A8]/30">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-widest text-[#C4896A]">
                        Most Recent Acquisition
                      </span>
                      <h2
                        className="text-xl sm:text-2xl font-normal text-[#2A1E17] tracking-wider mt-1"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        Latest Bespoke Commission
                      </h2>
                    </div>

                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-semibold uppercase tracking-wider text-[#3D2B1F] hover:text-[#C4896A] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>View All Acquisitions</span>
                      <span>→</span>
                    </button>
                  </div>

                  {latestOrder ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 rounded-2xl bg-[#FFFAF5] border border-[#E3C9A8]/40">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-[#2A1E17]">
                            Order #{latestOrder.order_number}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-widest bg-[#FEF5EC] text-[#C4896A] border border-[#E3C9A8]/60">
                            {latestOrder.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#7A6B5D]">
                          Placed on {new Date(latestOrder.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • Total: ${Number(latestOrder.total_amount).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveTab("orders")}
                        className="px-6 py-2.5 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-sm"
                      >
                        Track Masterpiece
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 rounded-2xl bg-[#FFFAF5] border border-[#E3C9A8]/30">
                      <div className="w-12 h-12 rounded-full bg-[#FEF5EC] border border-[#E3C9A8] text-[#C4896A] flex items-center justify-center mx-auto mb-3">
                        ✦
                      </div>
                      <p
                        className="text-base font-normal text-[#2A1E17] tracking-wider"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        No active acquisitions placed yet
                      </p>
                      <p className="text-xs text-[#7A6B5D] max-w-md mx-auto mt-1 mb-5">
                        Browse our artisan leather bags, bespoke jewelry, and handcrafted accessories to place your inaugural commission.
                      </p>
                      <Link
                        href="/shop"
                        className="inline-flex px-6 py-2.5 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-colors"
                      >
                        Explore Creations
                      </Link>
                    </div>
                  )}
                </div>

                {/* Atelier Guarantees & Concierge Assistance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E3C9A8]/50 shadow-sm space-y-2">
                    <div className="text-[#C4896A] text-xl">🛡️</div>
                    <h4
                      className="text-sm font-semibold text-[#2A1E17] uppercase tracking-wider"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Artisan Provenance
                    </h4>
                    <p className="text-xs text-[#7A6B5D] leading-relaxed">
                      Every piece is hallmarked with authenticity credentials, meticulously assembled in Florence ateliers.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E3C9A8]/50 shadow-sm space-y-2">
                    <div className="text-[#C4896A] text-xl">🕊️</div>
                    <h4
                      className="text-sm font-semibold text-[#2A1E17] uppercase tracking-wider"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      White-Glove Delivery
                    </h4>
                    <p className="text-xs text-[#7A6B5D] leading-relaxed">
                      Insured private transit with tamper-evident wax seal security packaging straight to your residence.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E3C9A8]/50 shadow-sm space-y-2">
                    <div className="text-[#C4896A] text-xl">✦</div>
                    <h4
                      className="text-sm font-semibold text-[#2A1E17] uppercase tracking-wider"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Private Concierge
                    </h4>
                    <p className="text-xs text-[#7A6B5D] leading-relaxed">
                      Direct assistance for custom bespoke dimensions, personalized initials, and bridal curations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 2. ORDERS & ACQUISITIONS TAB (POWERED BY ATELIER TABLE)         */}
            {/* ============================================================== */}
            {activeTab === "orders" && (
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_8px_30px_rgba(61,43,31,0.04)] p-6 sm:p-10 animate-in fade-in duration-300">
                <div className="mb-8 pb-6 border-b border-[#E3C9A8]/30">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-[#C4896A]">
                    Provenance Archive
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-normal text-[#2A1E17] tracking-wider mt-1"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Bespoke Acquisitions
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6B5D] mt-1.5">
                    Monitor ongoing workshop crafting, dispatch logs, and historical acquisition records.
                  </p>
                </div>

                <Orders />
              </div>
            )}

            {/* ============================================================== */}
            {/* 3. CURATED WISHLIST TAB (PAGINATED)                            */}
            {/* ============================================================== */}
            {activeTab === "wishlist" && (
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_8px_30px_rgba(61,43,31,0.04)] p-6 sm:p-10 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E3C9A8]/30">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-widest text-[#C4896A]">
                      Saved Masterpieces
                    </span>
                    <h2
                      className="text-2xl sm:text-3xl font-normal text-[#2A1E17] tracking-wider mt-1"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Curated Wishlist ({wishlistItems.length})
                    </h2>
                  </div>

                  {wishlistItems.length > 0 && (
                    <Link
                      href="/cart"
                      className="text-xs font-semibold uppercase tracking-wider text-[#3D2B1F] hover:text-[#C4896A] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Atelier Bag</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="text-center py-16 px-6 bg-[#FFFAF5] rounded-2xl border border-[#E3C9A8]/40">
                    <div className="w-16 h-16 rounded-full bg-[#FEF5EC] border border-[#E3C9A8] text-[#C4896A] flex items-center justify-center mx-auto mb-4 text-2xl">
                      ♥
                    </div>
                    <h3
                      className="text-lg font-normal text-[#2A1E17] tracking-wider mb-2"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Your Curated Wishlist is Empty
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-md mx-auto mb-6">
                      Explore our handcrafted gallery and save heirlooms for future bespoke commissions.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex px-7 py-3 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-md"
                    >
                      Browse Creations
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentWishlistItems.map((item) => {
                        const previewImage =
                          item.imgs?.previews?.[0] || item.imgs?.thumbnails?.[0] || "/images/products/product-1-bg-1.png";

                        return (
                          <div
                            key={item.id}
                            className="group bg-[#FFFAF5] rounded-2xl border border-[#E3C9A8]/50 p-4 flex flex-col justify-between hover:border-[#C4896A] hover:shadow-lg transition-all duration-300"
                          >
                            <div>
                              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#E3C9A8]/30 mb-4">
                                <Image
                                  src={previewImage}
                                  alt={item.title}
                                  fill
                                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                />
                                <button
                                  onClick={() => handleRemoveWishlist(item.id, item.title)}
                                  title="Remove from wishlist"
                                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#E3C9A8]/60 text-[#7A6B5D] hover:text-[#B91C1C] flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              </div>

                              <h4 className="text-sm font-medium text-[#2A1E17] line-clamp-1 mb-1">
                                {item.title}
                              </h4>

                              <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-semibold text-[#C4896A]">
                                  ${(item.discountedPrice || item.price).toFixed(2)}
                                </span>
                                {item.discountedPrice && item.discountedPrice < item.price && (
                                  <span className="text-xs text-[#A8988B] line-through">
                                    ${item.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleMoveToCart(item)}
                              className="w-full py-2.5 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              <span>Move to Bag</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalWishlistPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-[#E3C9A8]/30">
                        <button
                          onClick={() => setWishlistPage((p) => Math.max(1, p - 1))}
                          disabled={wishlistPage === 1}
                          className="w-9 h-9 rounded-full border border-[#E3C9A8] text-[#3D2B1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFFAF5] flex items-center justify-center transition-colors text-xs font-medium"
                        >
                          ‹
                        </button>

                        {Array.from({ length: totalWishlistPages }).map((_, idx) => {
                          const pageNumber = idx + 1;
                          const isCurrent = pageNumber === wishlistPage;
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setWishlistPage(pageNumber)}
                              className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${
                                isCurrent
                                  ? "bg-[#3D2B1F] text-white shadow-sm"
                                  : "border border-[#E3C9A8] text-[#3D2B1F] hover:bg-[#FFFAF5]"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setWishlistPage((p) => Math.min(totalWishlistPages, p + 1))}
                          disabled={wishlistPage === totalWishlistPages}
                          className="w-9 h-9 rounded-full border border-[#E3C9A8] text-[#3D2B1F] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FFFAF5] flex items-center justify-center transition-colors text-xs font-medium"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* 4. PRIVATE COORDINATES (ADDRESSES) TAB                          */}
            {/* ============================================================== */}
            {activeTab === "addresses" && (
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_8px_30px_rgba(61,43,31,0.04)] p-6 sm:p-10 animate-in fade-in duration-300">
                <div className="mb-8 pb-6 border-b border-[#E3C9A8]/30">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-[#C4896A]">
                    Delivery Book
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-normal text-[#2A1E17] tracking-wider mt-1"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Private Coordinates
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6B5D] mt-1.5">
                    Maintain your primary residence, atelier shipping destinations, and billing records.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Address Card */}
                  <div className="bg-[#FFFAF5] rounded-2xl border border-[#E3C9A8]/60 p-6 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#FEF5EC] border border-[#E3C9A8]/60 text-[#C4896A]">
                          Default Delivery
                        </span>

                        <button
                          onClick={() => {
                            setAddressModalType("shipping");
                            setAddressModalOpen(true);
                          }}
                          className="text-xs font-medium text-[#3D2B1F] hover:text-[#C4896A] underline transition-colors"
                        >
                          Edit
                        </button>
                      </div>

                      <h4
                        className="text-base font-semibold text-[#2A1E17] mb-2"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        Shipping Destination
                      </h4>

                      <div className="space-y-1.5 text-xs text-[#7A6B5D] leading-relaxed">
                        <p className="font-medium text-[#2A1E17]">{shippingAddress.name}</p>
                        <p>{shippingAddress.street}</p>
                        <p>
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                        </p>
                        <p>{shippingAddress.country}</p>
                        <p className="pt-2 text-[#C4896A]">Phone: {shippingAddress.phone}</p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#E3C9A8]/30">
                      <button
                        onClick={() => {
                          setAddressModalType("shipping");
                          setAddressModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-full border border-[#E3C9A8] text-xs font-medium tracking-wider uppercase text-[#3D2B1F] hover:bg-white transition-colors"
                      >
                        Modify Shipping Address
                      </button>
                    </div>
                  </div>

                  {/* Billing Address Card */}
                  <div className="bg-[#FFFAF5] rounded-2xl border border-[#E3C9A8]/60 p-6 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#FEF5EC] border border-[#E3C9A8]/60 text-[#C4896A]">
                          Billing Coordinates
                        </span>

                        <button
                          onClick={() => {
                            setAddressModalType("billing");
                            setAddressModalOpen(true);
                          }}
                          className="text-xs font-medium text-[#3D2B1F] hover:text-[#C4896A] underline transition-colors"
                        >
                          Edit
                        </button>
                      </div>

                      <h4
                        className="text-base font-semibold text-[#2A1E17] mb-2"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        Invoice & Statement Coordinates
                      </h4>

                      <div className="space-y-1.5 text-xs text-[#7A6B5D] leading-relaxed">
                        <p className="font-medium text-[#2A1E17]">{billingAddress.name}</p>
                        <p>{billingAddress.street}</p>
                        <p>
                          {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                        </p>
                        <p>{billingAddress.country}</p>
                        <p className="pt-2 text-[#C4896A]">Phone: {billingAddress.phone}</p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#E3C9A8]/30">
                      <button
                        onClick={() => {
                          setAddressModalType("billing");
                          setAddressModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-full border border-[#E3C9A8] text-xs font-medium tracking-wider uppercase text-[#3D2B1F] hover:bg-white transition-colors"
                      >
                        Modify Billing Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 5. PATRON PROFILE & PREFERENCES TAB (USING ATELIER DROPDOWNS)   */}
            {/* ============================================================== */}
            {activeTab === "details" && (
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_8px_30px_rgba(61,43,31,0.04)] p-6 sm:p-10 animate-in fade-in duration-300">
                <div className="mb-8 pb-6 border-b border-[#E3C9A8]/30">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-[#C4896A]">
                    Personal Ledger
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-normal text-[#2A1E17] tracking-wider mt-1"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Patron Profile & Atelier Preferences
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6B5D] mt-1.5">
                    Personalize how your moniker is recorded on bespoke certificates of authenticity and receipts.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        placeholder="Your First Name"
                        className="w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        placeholder="Your Last Name"
                        className="w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="client@atelier.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] focus:ring-1 focus:ring-[#C4896A]/40 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                        Country / Region
                      </label>
                      <AtelierDropdown
                        items={countryDropdownItems}
                        selectedId={profileForm.country}
                        onSelect={(id) => setProfileForm({ ...profileForm, country: id })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                        Preferred Currency
                      </label>
                      <AtelierDropdown
                        items={currencyDropdownItems}
                        selectedId={profileForm.preferredCurrency}
                        onSelect={(id) => setProfileForm({ ...profileForm, preferredCurrency: id })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                        Monogram Initials
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={profileForm.monogramInitials}
                        onChange={(e) => setProfileForm({ ...profileForm, monogramInitials: e.target.value.toUpperCase() })}
                        placeholder="e.g. JS"
                        className="w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] transition-colors uppercase font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end border-t border-[#E3C9A8]/30">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-8 py-3 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-md disabled:opacity-60 flex items-center gap-2"
                    >
                      {savingProfile ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Save Ledger Details</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* 6. SECURITY & KEYS TAB                                          */}
            {/* ============================================================== */}
            {activeTab === "security" && (
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_8px_30px_rgba(61,43,31,0.04)] p-6 sm:p-10 animate-in fade-in duration-300">
                <div className="mb-8 pb-6 border-b border-[#E3C9A8]/30">
                  <span className="text-[11px] font-medium uppercase tracking-widest text-[#C4896A]">
                    Cryptographic Vault
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-normal text-[#2A1E17] tracking-wider mt-1"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Security & Passkey Credentials
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6B5D] mt-1.5">
                    Protect your bespoke order archive with end-to-end encrypted session credentials.
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                      Current Master Password
                    </label>
                    <input
                      type="password"
                      value={securityForm.oldPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, oldPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                      New Security Key
                    </label>
                    <input
                      type="password"
                      required
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] transition-colors"
                    />

                    {/* Password Strength Indicator */}
                    {securityForm.newPassword && (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#7A6B5D]">Security Strength:</span>
                          <span className="font-semibold" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300 rounded-full"
                            style={{ width: `${passwordStrength.score}%`, backgroundColor: passwordStrength.color }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#7A6B5D] mb-2 font-medium">
                      Confirm New Security Key
                    </label>
                    <input
                      type="password"
                      required
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/60 text-sm text-[#2A1E17] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C4896A] transition-colors"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#E3C9A8]/30">
                    <div className="flex items-center gap-2 text-xs text-[#7A6B5D]">
                      <span className="text-[#10B981]">●</span>
                      <span>256-bit AES Session Encryption Active</span>
                    </div>

                    <button
                      type="submit"
                      disabled={updatingPassword}
                      className="px-7 py-3 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-md disabled:opacity-60 flex items-center gap-2"
                    >
                      {updatingPassword ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Update Security Key</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>

        {/* Mobile View Bottom Action Bar (Dual access per user request) */}
        <div className="mt-12 pt-6 border-t border-[#E3C9A8]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#7A6B5D]">
            <span className="text-[#C4896A]">✦</span>
            <span>The Handmade Vendor Atelier • Private Patron Area</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/shop"
              className="flex-1 sm:flex-initial text-center px-6 py-2.5 rounded-full border border-[#E3C9A8] text-xs font-medium tracking-wider uppercase text-[#3D2B1F] hover:bg-white hover:border-[#C4896A] transition-colors shadow-sm"
            >
              Explore Atelier
            </Link>

            <button
              onClick={handleSignOut}
              className="flex-1 sm:flex-initial text-center px-6 py-2.5 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Address Edit Modal */}
      <AddressModal
        isOpen={addressModalOpen}
        closeModal={() => setAddressModalOpen(false)}
        addressType={addressModalType}
        initialData={addressModalType === "shipping" ? shippingAddress : billingAddress}
        onSave={handleAddressSave}
      />
    </section>
  );
}
