"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressModal from "./AddressModal";
import ProductItem from "../Common/ProductItem";
import Orders from "../Orders";
import { createClient } from "@/utils/supabase/client";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { showToast } from "@/utils/toast";
import AtelierDropdown, { DropdownItem } from "../Common/AtelierDropdown";
import {
  SavedAddress,
  getSavedAddresses,
  saveAddress,
  setDefaultAddress,
  deleteAddress,
  MAX_SAVED_ADDRESSES,
} from "@/utils/addressSync";

export default function MyAccount() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Tab navigation state - initial sidebar collapsed per user request
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  // Addresses state - starts EMPTY for every user initially per user request
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<SavedAddress | null>(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

  // Compute tags already used by other saved addresses
  const usedTags = useMemo(() => {
    return addresses
      .filter((a) => !editingAddress || a.id !== editingAddress.id)
      .map((a) => a.tag);
  }, [addresses, editingAddress]);

  // User & Profile State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Orders summary state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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
        } else {
          router.replace("/signin?redirect=/my-account");
        }
      } catch (err) {
        console.warn("Could not load user profile:", err);
        router.replace("/signin?redirect=/my-account");
      } finally {
        setLoadingProfile(false);
      }
    }

    loadUser();
  }, [router]);

  // Load persisted user addresses (empty initially, up to 3 max, synced to Supabase & localStorage)
  useEffect(() => {
    async function loadAddresses() {
      setLoadingAddresses(true);
      try {
        const loaded = await getSavedAddresses(currentUser?.id);
        setAddresses(loaded);
      } catch (e) {
        console.warn("Addresses load notice:", e);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [currentUser?.id]);

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

  // Handle Address Save (create or update, with max 3 enforcement and tag management)
  const handleSaveAddress = async (data: SavedAddress) => {
    try {
      const updated = await saveAddress(data, currentUser?.id);
      setAddresses(updated);
      showToast.success(editingAddress ? "Address updated successfully." : "New address added to profile.");
      setAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err: any) {
      showToast.error(err.message || "Failed to save address.");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setDeletingAddress(true);
    try {
      const updated = await deleteAddress(id, currentUser?.id);
      setAddresses(updated);
      showToast.info("Address removed from profile.");
      setAddressToDelete(null);
    } catch (err: any) {
      showToast.error("Failed to remove address.");
    } finally {
      setDeletingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (address: SavedAddress) => {
    try {
      const updated = await setDefaultAddress(address.id, currentUser?.id);
      setAddresses(updated);
      showToast.success(`"${address.firstName} ${address.lastName}" set as Default delivery address.`);
    } catch (err: any) {
      showToast.error("Failed to update default address.");
    }
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
      label: "Orders",
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
      label: "Addresses",
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

  if (loadingProfile) {
    return (
      <section className="min-h-screen pt-36 pb-24 bg-[#FFFAF5] flex flex-col items-center justify-center text-[#3D2B1F] antialiased">
        <div className="w-10 h-10 border-2 border-[#C4896A]/30 border-t-[#C4896A] rounded-full animate-spin mb-4" />
        <p
          className="text-xs uppercase tracking-widest text-[#7A6B5D]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Verifying Patron Credentials...
        </p>
      </section>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <section className="min-h-screen pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-24 bg-[#FFFAF5] text-[#3D2B1F] antialiased">
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

        {/* Mobile Section Selector (Powered by @headlessui/react AtelierDropdown) */}
        <div className="lg:hidden mb-8 space-y-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider text-[#7A6B5D] block"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Account Section:
          </span>

          {/* Luxury Dropdown using @headlessui/react */}
          <AtelierDropdown
            items={mobileNavDropdownItems}
            selectedId={activeTab}
            onSelect={(id) => setActiveTab(id)}
            placeholder="Select Section"
            className="w-full"
            buttonClassName="py-3 px-4 rounded-2xl bg-white border-[#E3C9A8]"
          />
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
                    Orders
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
                      {currentWishlistItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col h-full bg-[#FFFFFF] p-4 rounded-2xl border border-[#E3C9A8]/50 shadow-[0_4px_20px_rgba(61,43,31,0.03)] hover:border-[#C4896A] transition-all"
                        >
                          <div className="flex-1">
                            <ProductItem item={item as any} />
                          </div>
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="mt-3 w-full py-2.5 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Move to Bag</span>
                          </button>
                        </div>
                      ))}
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
            {/* 4. ADDRESSES TAB (EMPTY INITIALLY, MAX 3, TAGGED, SUPABASE DB) */}
            {/* ============================================================== */}
            {activeTab === "addresses" && (
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/50 shadow-[0_8px_30px_rgba(61,43,31,0.04)] p-6 sm:p-10 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E3C9A8]/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium uppercase tracking-widest text-[#C4896A]">
                        Delivery Book
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF5EC] text-[#C4896A] border border-[#E3C9A8]/60">
                        {addresses.length} / {MAX_SAVED_ADDRESSES} Max
                      </span>
                    </div>
                    <h2
                      className="text-2xl sm:text-3xl font-normal text-[#2A1E17] tracking-wider mt-1"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Addresses
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7A6B5D] mt-1.5">
                      Maintain up to 3 saved destinations with custom tags (Default, Home, Others) for express checkout.
                    </p>
                  </div>

                  {addresses.length < MAX_SAVED_ADDRESSES ? (
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setAddressModalOpen(true);
                      }}
                      className="px-6 py-2.5 rounded-full bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-medium tracking-wider uppercase transition-all duration-300 shadow-sm flex items-center gap-2 flex-shrink-0"
                    >
                      <span>+ Add New Address</span>
                    </button>
                  ) : (
                    <span className="px-4 py-2 rounded-full bg-[#FEF5EC] border border-[#E3C9A8]/80 text-[#C4896A] text-xs font-medium uppercase tracking-wider flex-shrink-0">
                      Limit of 3 Saved Addresses
                    </span>
                  )}
                </div>

                {loadingAddresses ? (
                  <div className="py-16 text-center text-xs text-[#7A6B5D]">
                    <div className="w-6 h-6 border-2 border-[#C4896A]/30 border-t-[#C4896A] rounded-full animate-spin mx-auto mb-2" />
                    <span>Accessing patron delivery book...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-16 px-6 bg-[#FFFAF5] rounded-2xl border border-[#E3C9A8]/40">
                    <div className="w-16 h-16 rounded-full bg-[#FEF5EC] border border-[#E3C9A8] text-[#C4896A] flex items-center justify-center mx-auto mb-4 text-2xl">
                      📍
                    </div>
                    <h3
                      className="text-lg font-normal text-[#2A1E17] tracking-wider mb-2"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      No Saved Addresses Yet
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-md mx-auto">
                      Keep up to 3 delivery destinations (Default, Home, Others) for expedited courier shipping and streamlined checkout.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {addresses.map((addr) => {
                      const isDefault = addr.tag === "Default";
                      return (
                        <div
                          key={addr.id}
                          className="bg-[#FFFAF5] rounded-2xl border border-[#E3C9A8]/60 p-6 flex flex-col justify-between shadow-sm hover:border-[#C4896A] hover:shadow-md transition-all duration-300"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                                  addr.tag === "Default"
                                    ? "bg-[#3D2B1F] text-[#E3C9A8] shadow-sm"
                                    : addr.tag === "Home"
                                    ? "bg-[#FEF5EC] border border-[#E3C9A8]/80 text-[#C4896A]"
                                    : "bg-[#FFFFFF] border border-[#E3C9A8]/70 text-[#7A6B5D]"
                                }`}
                              >
                                {addr.tag === "Default" ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                ) : addr.tag === "Home" ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                )}
                                <span>{addr.tag}</span>
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingAddress(addr);
                                    setAddressModalOpen(true);
                                  }}
                                  className="px-3.5 py-1.5 rounded-full border border-[#E3C9A8] bg-[#FFFFFF] hover:bg-[#3D2B1F] text-[#3D2B1F] hover:text-[#E3C9A8] hover:border-[#3D2B1F] text-xs font-medium tracking-wider uppercase transition-all duration-200 shadow-sm flex items-center gap-1.5"
                                  title="Update address"
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  <span>Update</span>
                                </button>
                                <button
                                  onClick={() => setAddressToDelete(addr)}
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6B5D] hover:text-[#B91C1C] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FCA5A5]/60 transition-all duration-200"
                                  title="Remove address"
                                  aria-label="Remove address"
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <h4
                              className="text-base font-semibold text-[#2A1E17] mb-2"
                              style={{ fontFamily: "'Cinzel', serif" }}
                            >
                              {addr.firstName} {addr.lastName}
                            </h4>

                            <div className="space-y-1 text-xs text-[#7A6B5D] leading-relaxed">
                              <p className="text-[#3D2B1F] font-medium">{addr.street}</p>
                              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                              <p>{addr.country}</p>
                              <p className="pt-2 text-[#C4896A] font-medium flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                <span>{addr.phone}</span>
                              </p>
                              <p className="text-[#A8988B] text-[11px] truncate flex items-center gap-1.5">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                <span>{addr.email}</span>
                              </p>
                            </div>
                          </div>

                          <div className="pt-5 mt-5 border-t border-[#E3C9A8]/30">
                            {!isDefault ? (
                              <button
                                onClick={() => handleSetDefaultAddress(addr)}
                                className="w-full py-2 rounded-xl border border-[#E3C9A8] text-[11px] font-medium tracking-wider uppercase text-[#3D2B1F] hover:bg-white hover:border-[#C4896A] transition-colors"
                              >
                                Set as Default
                              </button>
                            ) : (
                              <div className="text-[11px] font-medium text-[#C4896A] flex items-center justify-center gap-1.5 py-1">
                                <span>✦</span>
                                <span>Primary Checkout Destination</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

      </div>

      {/* Address Edit Modal */}
      <AddressModal
        isOpen={addressModalOpen}
        closeModal={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSave={handleSaveAddress}
        isFirstAddress={addresses.length === 0}
        usedTags={usedTags}
      />

      {/* Delete Address Warning Confirmation Popup */}
      {addressToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-6 bg-[#2A1E17]/65 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-3xl border border-[#E3C9A8]/70 shadow-[0_24px_60px_rgba(42,30,23,0.28)] p-6 sm:p-8 text-[#3D2B1F] animate-in fade-in zoom-in-95 duration-200">
            {/* Close button with hover circle */}
            <button
              onClick={() => setAddressToDelete(null)}
              type="button"
              aria-label="Close dialog"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#7A6B5D] hover:text-[#3D2B1F] hover:bg-[#FFFAF5] border border-transparent hover:border-[#E3C9A8]/50 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-full bg-[#FEF2F2] border border-[#FCA5A5]/60 text-[#B91C1C] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5]/60 mb-2">
                <span>Confirm Removal</span>
              </div>
              <h3
                className="text-xl sm:text-2xl font-normal text-[#2A1E17] tracking-wider mb-2"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Remove Destination?
              </h3>
              <p className="text-xs text-[#7A6B5D] leading-relaxed">
                Are you sure you want to remove the{" "}
                <span className="font-semibold text-[#3D2B1F]">"{addressToDelete.tag}"</span> destination for{" "}
                <span className="font-semibold text-[#3D2B1F]">{addressToDelete.firstName} {addressToDelete.lastName}</span>?
              </p>
              <div className="mt-3 p-3 bg-[#FFFAF5] rounded-xl border border-[#E3C9A8]/40 text-left text-xs text-[#7A6B5D]">
                <p className="text-[#3D2B1F] font-medium">{addressToDelete.street}</p>
                <p>{addressToDelete.city}, {addressToDelete.state} {addressToDelete.postalCode}</p>
                <p>{addressToDelete.country}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E3C9A8]/30">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={deletingAddress}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#E3C9A8] text-xs font-medium tracking-wider uppercase text-[#3D2B1F] hover:bg-[#FFFAF5] hover:border-[#C4896A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAddress(addressToDelete.id)}
                disabled={deletingAddress}
                className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-[#FFFFFF] text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-[#991B1B]"
              >
                {deletingAddress ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Remove Address</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
