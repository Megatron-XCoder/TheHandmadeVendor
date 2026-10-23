"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { removeStoredItem } from "@/utils/indexedDB";
import { showToast } from "@/utils/toast";
import { createClient } from "@/utils/supabase/client";
import {
  getSavedAddresses,
  saveAddress,
  SavedAddress,
  AddressTag,
  MAX_SAVED_ADDRESSES,
} from "@/utils/addressSync";
import AddressModal from "@/components/MyAccount/AddressModal";
import { Country, State, City } from "country-state-city";
import AtelierDropdown, { DropdownItem } from "@/components/Common/AtelierDropdown";

type AuthMode = "signin" | "register";
type PaymentMethodType = "card" | "wire" | "cash";

const Checkout: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux Cart state
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const subtotal = useAppSelector(selectTotalPrice);

  // Authentication & Patron State
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patronProfile, setPatronProfile] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    monogram: string;
  } | null>(null);

  // Unauthenticated Patron Mode (Case 1 vs Case 3)
  const [unauthMode, setUnauthMode] = useState<AuthMode>("signin");

  // Inline Signin form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Delivery Destinations (Delivery Book)
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Alternate / Different Address Mode
  const [isDifferentAddress, setIsDifferentAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState<SavedAddress>({
    id: "custom_diff_addr",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    countryCode: "",
    stateCode: "",
    tag: "Others",
    isDefault: false,
  });
  const [saveCustomToBook, setSaveCustomToBook] = useState(false);

  // Address Modal State ("New Atelier Destination - Add Delivery Address")
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  // Order Details
  const [atelierNotes, setAtelierNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile Order Summary Accordion
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // ── 1. Check Authentication on Mount & Subscribe ─────────────────────────────
  const loadPatronData = useCallback(async (user: any) => {
    try {
      const supabase = createClient();
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const userMeta = user.user_metadata || {};
      const fName = profileRow?.first_name || userMeta.first_name || "";
      const lName = profileRow?.last_name || userMeta.last_name || "";
      const email = profileRow?.email || user.email || "";
      const phone = profileRow?.phone || userMeta.phone || "";
      const monogram = (
        profileRow?.monogram_initials ||
        userMeta.monogram_initials ||
        `${fName[0] || ""}${lName[0] || ""}`
      )
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .slice(0, 2) || "HV";

      setPatronProfile({
        firstName: fName,
        lastName: lName,
        email,
        phone,
        monogram,
      });

      // Load Delivery Book (addresses from Supabase/localStorage)
      setLoadingAddresses(true);
      const savedList = await getSavedAddresses(user.id);
      setAddresses(savedList);

      // Pre-select default address if available, or first address
      if (savedList.length > 0) {
        const defaultAddr = savedList.find((a) => a.tag === "Default" || a.isDefault);
        const selected = defaultAddr ? defaultAddr.id : savedList[0].id;
        setSelectedAddressId(selected);
        setIsDifferentAddress(false);
      } else {
        setSelectedAddressId("");
      }
    } catch (err: any) {
      console.warn("Patron data load notice:", err?.message || err);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) {
          if (data?.user) {
            setCurrentUser(data.user);
            await loadPatronData(data.user);
          } else {
            setCurrentUser(null);
            setPatronProfile(null);
            setAddresses([]);
          }
        }
      } catch (e) {
        if (mounted) setCurrentUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setCurrentUser(session.user);
        await loadPatronData(session.user);
      } else {
        setCurrentUser(null);
        setPatronProfile(null);
        setAddresses([]);
      }
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadPatronData]);

  // ── 2. Inline Login Handler (Case 1) ──────────────────────────────────────────
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      showToast.error("Please provide both email and master password.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        showToast.error(error.message);
        return;
      }

      if (data?.user) {
        setCurrentUser(data.user);
        showToast.success("Welcome back! Loading saved destinations...");
        await loadPatronData(data.user);
        setLoginPassword("");
      }
    } catch (err: any) {
      showToast.error(err?.message || "Failed to sign in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/checkout")}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
      if (error) {
        showToast.error(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      showToast.error(err.message || "Failed to initialize Google login.");
      setIsGoogleLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setCurrentUser(null);
      setPatronProfile(null);
      setAddresses([]);
      setSelectedAddressId("");
      showToast.success("Signed out successfully.");
    } catch (err: any) {
      showToast.error("Error signing out.");
    }
  };

  // ── 3. Address Modal Handlers (Case 4 & Delivery Book) ────────────────────────
  const handleAddressSaved = async (addressData: SavedAddress) => {
    try {
      const updated = await saveAddress(addressData, currentUser?.id);
      setAddresses(updated);

      const newlySaved = updated.find((a) => a.id === addressData.id) || updated[updated.length - 1];
      if (newlySaved) {
        setSelectedAddressId(newlySaved.id);
        setIsDifferentAddress(false);
      }
      showToast.success(editingAddress ? "Destination updated" : "Destination added & selected for delivery");
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err: any) {
      showToast.error(err.message || "Failed to save address.");
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (addr: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  // ── 4. Country / State / City helpers for Alternate Address Form ──────────────
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const countryDropdownItems: DropdownItem[] = useMemo(() => {
    return allCountries.map((c) => ({
      id: c.isoCode,
      label: `${c.flag ? c.flag + " " : ""}${c.name}`,
    }));
  }, [allCountries]);

  const statesForCustomCountry = useMemo(() => {
    if (!customAddress.countryCode) return [];
    return State.getStatesOfCountry(customAddress.countryCode);
  }, [customAddress.countryCode]);

  const stateDropdownItems: DropdownItem[] = useMemo(() => {
    return statesForCustomCountry.map((s) => ({
      id: s.isoCode,
      label: s.name,
    }));
  }, [statesForCustomCountry]);

  const citiesForCustomState = useMemo(() => {
    if (!customAddress.countryCode || !customAddress.stateCode) return [];
    return City.getCitiesOfState(customAddress.countryCode, customAddress.stateCode);
  }, [customAddress.countryCode, customAddress.stateCode]);

  const cityDropdownItems: DropdownItem[] = useMemo(() => {
    return citiesForCustomState.map((c) => ({
      id: c.name,
      label: c.name,
    }));
  }, [citiesForCustomState]);

  // ── 5. Pricing Calculation (Complimentary White-Glove Shipping) ─────────────
  const shippingFee = subtotal > 200 || subtotal === 0 ? 0 : 25;
  const totalAmount = subtotal + shippingFee;

  // ── 6. Final Order Submission ─────────────────────────────────────────────────
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast.error("Your shopping bag is empty.");
      return;
    }

    if (!currentUser) {
      showToast.error("Please sign in or create an account to place your order.");
      const authCard = document.getElementById("patron-auth-card");
      if (authCard) {
        authCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    let finalAddress: SavedAddress | null = null;

    if (!isDifferentAddress) {
      const matched = addresses.find((a) => a.id === selectedAddressId);
      if (!matched) {
        showToast.error("Please select a delivery address.");
        return;
      }
      finalAddress = matched;
    } else {
      if (!customAddress.firstName.trim() || !customAddress.lastName.trim()) {
        showToast.error("Please enter the recipient's name.");
        return;
      }
      if (!customAddress.street.trim()) {
        showToast.error("Please enter the street address.");
        return;
      }
      if (!customAddress.country.trim()) {
        showToast.error("Please select a country.");
        return;
      }
      if (!customAddress.city.trim()) {
        showToast.error("Please select a city.");
        return;
      }
      if (!customAddress.postalCode.trim()) {
        showToast.error("Please enter the postal / ZIP code.");
        return;
      }
      if (!customAddress.phone.trim()) {
        showToast.error("Please enter a contact phone number.");
        return;
      }

      finalAddress = {
        ...customAddress,
        id: `custom_${Date.now()}`,
        email: customAddress.email.trim() || currentUser.email || "",
      };

      if (saveCustomToBook && addresses.length < MAX_SAVED_ADDRESSES) {
        try {
          await saveAddress(finalAddress, currentUser.id);
        } catch (e) {
          console.warn("Could not save address to book:", e);
        }
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${finalAddress.firstName} ${finalAddress.lastName}`.trim(),
          customerEmail: finalAddress.email || currentUser.email,
          customerPhone: finalAddress.phone || "",
          items: cartItems.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.discountedPrice || item.price,
            quantity: item.quantity,
            image: item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0] || null,
          })),
          subtotal,
          totalAmount,
          atelierNotes: atelierNotes.trim() || null,
          shippingAddress: {
            ...finalAddress,
            paymentMethod,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm order.");
      }

      dispatch(removeAllItemsFromCart());
      await removeStoredItem("cart");

      showToast.success(`Bespoke Order #${data.order.order_number} confirmed!`);
      router.push("/my-account");
    } catch (err: any) {
      showToast.error(err.message || "Failed to confirm order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── ATELIER CHECKOUT HEADER ────────────────────────────────────────── */}
      <section className="pt-24 pb-6 sm:pt-28 sm:pb-8 bg-[#FFFAF5] border-b border-[#E3C9A8]/40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Atelier Crest Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] bg-[#FEF5EC] text-[#C4896A] border border-[#E3C9A8]/70 mb-2.5 shadow-2xs">
            <span>✦</span>
            <span>Secure Checkout</span>
            <span>✦</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-normal text-[#2A1E17] tracking-tight leading-tight mb-2"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Review & Complete Commission
          </h1>

          {/* Filigree Divider */}
          <div className="flex items-center justify-center gap-2.5 my-2">
            <span className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#C4896A]" />
            <span className="text-[#C4896A] text-xs">✦</span>
            <span className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#C4896A]" />
          </div>

          <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-lg mx-auto leading-relaxed">
            Verify your delivery destination, choose a payment method, and confirm your bespoke commission.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <section className="py-6 sm:py-8 lg:py-10 bg-[#FFFDF9]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handlePlaceOrder}>
            {/* ── MOBILE ACCORDION: ORDER SUMMARY BAR (Mobile Only) ─────────── */}
            <div className="lg:hidden mb-5 bg-[#FFFFFF] rounded-xl border border-[#E3C9A8]/70 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowMobileSummary(!showMobileSummary)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs text-[#2A1E17] bg-[#FFFAF5]/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#C4896A]">✦</span>
                  <span className="font-semibold text-[#3D2B1F]">
                    {showMobileSummary ? "Hide Order Summary" : "Show Order Summary"}
                  </span>
                  <span className="text-[#A09082]">
                    ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform duration-200 text-[#C4896A] ${
                      showMobileSummary ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <span
                  className="text-sm font-bold text-[#C4896A]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  ${totalAmount.toFixed(2)}
                </span>
              </button>

              {showMobileSummary && (
                <div className="p-4 border-t border-[#E3C9A8]/30 space-y-3 bg-[#FFFFFF] animate-in fade-in duration-200">
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#EDD9B8] bg-[#FEF5EC] flex-shrink-0">
                            <Image
                              src={
                                (item.imgs?.thumbnails && item.imgs.thumbnails[0]) ||
                                (item.imgs?.previews && item.imgs.previews[0]) ||
                                (item.id && Number(item.id) >= 1 && Number(item.id) <= 8
                                  ? `/images/products/product-${item.id}-sm-1.png`
                                  : "/images/products/product-1-sm-1.png")
                              }
                              alt={item.title}
                              fill
                              className="object-contain p-0.5"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#3D2B1F] truncate">{item.title}</p>
                            <span className="text-[10px] text-[#A09082]">Qty {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-[#3D2B1F] flex-shrink-0">
                          ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#E3C9A8]/30 space-y-1.5 text-xs text-[#7A6B5D]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#3D2B1F]">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium text-[#3D2B1F]">
                        {shippingFee === 0 ? "Included" : `$${shippingFee.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* ────────────────────────────────────────────────────────────── */}
              {/* LEFT COLUMN: Identity, Addresses, Payment, Notes (7 Cols)      */}
              {/* ────────────────────────────────────────────────────────────── */}
              <div className="lg:col-span-7 space-y-5">
                {/* ── CASE 1 & 3: UNAUTHENTICATED PATRON GATEWAY ────────────── */}
                {!currentUser && !authLoading && (
                  <div
                    id="patron-auth-card"
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E3C9A8] shadow-[0_4px_20px_rgba(61,43,31,0.03)] overflow-hidden"
                  >
                    {/* Step Header */}
                    <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-[#FFFAF5] border-b border-[#E3C9A8]/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#3D2B1F] text-[#E3C9A8] flex items-center justify-center font-serif text-xs font-bold shadow-2xs">
                          ✦
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4896A] block">
                            Identification
                          </span>
                          <h2
                            className="text-sm sm:text-base font-semibold text-[#2A1E17]"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            Patron Account
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Dual Mode Tab Selector */}
                    <div className="grid grid-cols-2 p-1 bg-[#FEF5EC]/70 border-b border-[#E3C9A8]/40">
                      <button
                        type="button"
                        onClick={() => setUnauthMode("signin")}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                          unauthMode === "signin"
                            ? "bg-[#3D2B1F] text-white shadow-2xs"
                            : "text-[#7A6B5D] hover:text-[#3D2B1F]"
                        }`}
                      >
                        Sign In
                      </button>

                      <button
                        type="button"
                        onClick={() => setUnauthMode("register")}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
                          unauthMode === "register"
                            ? "bg-[#3D2B1F] text-white shadow-2xs"
                            : "text-[#7A6B5D] hover:text-[#3D2B1F]"
                        }`}
                      >
                        Create Account
                      </button>
                    </div>

                    {/* Tab 1: Inline Sign In */}
                    {unauthMode === "signin" && (
                      <div className="p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-xs font-medium text-[#3D2B1F] mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="patron@domain.com"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3C9A8] bg-[#FFFAF5] text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C4896A]"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-[#3D2B1F]">
                              Password
                            </label>
                            <Link
                              href="/forgot-password"
                              target="_blank"
                              className="text-[11px] text-[#C4896A] hover:underline"
                            >
                              Forgot Key?
                            </Link>
                          </div>
                          <div className="relative">
                            <input
                              type={showLoginPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full px-3.5 py-2.5 pr-11 rounded-lg border border-[#E3C9A8] bg-[#FFFAF5] text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C4896A]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A09082] hover:text-[#C4896A] transition-colors p-1"
                              aria-label={showLoginPassword ? "Hide password" : "Show password"}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                {showLoginPassword ? (
                                  <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                ) : (
                                  <>
                                    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </>
                                )}
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleInlineLogin}
                            disabled={isLoggingIn}
                            className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shadow-2xs"
                          >
                            {isLoggingIn ? "Signing In..." : "Sign In & Continue"}
                          </button>

                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="py-2.5 px-4 rounded-lg border border-[#E3C9A8] hover:border-[#C4896A] text-xs font-medium text-[#3D2B1F] bg-white hover:bg-[#FFFAF5] transition-colors flex items-center justify-center gap-2"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Google</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: New Patron Prompt */}
                    {unauthMode === "register" && (
                      <div className="p-4 sm:p-5 text-center space-y-3 animate-in fade-in duration-200">
                        <p className="text-xs text-[#7A6B5D] max-w-sm mx-auto leading-relaxed">
                          Create an account to save your delivery destinations and track white-glove dispatch.
                        </p>

                        <a
                          href="/signup?redirect=/checkout"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-2xs"
                        >
                          <span>Create Account</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>

                        <p className="text-[11px] text-[#A09082]">
                          Your bag is saved. After registering, return to <strong>Sign In</strong> to complete checkout.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── CASE 2: LOGGED IN PATRON STRIP ────────────────────────── */}
                {currentUser && (
                  <div className="bg-[#FFFFFF] rounded-xl border border-[#E3C9A8]/60 p-3.5 sm:p-4 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#3D2B1F] text-[#E3C9A8] border border-[#E3C9A8] flex items-center justify-center font-serif text-xs font-bold flex-shrink-0 shadow-2xs">
                        {patronProfile?.monogram || "HV"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs sm:text-sm font-semibold text-[#2A1E17] truncate">
                            {patronProfile?.firstName || patronProfile?.lastName
                              ? `${patronProfile.firstName} ${patronProfile.lastName}`.trim()
                              : "Esteemed Patron"}
                          </span>
                          <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FEF5EC] text-[#C4896A] border border-[#E3C9A8]/50">
                            Verified Patron
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#7A6B5D] truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="text-xs text-[#8C7E72] hover:text-[#C4896A] font-medium whitespace-nowrap transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}

                {/* ── DELIVERY DESTINATION (SAVED ADDRESSES) ────────────────── */}
                {currentUser && (
                  <div className="bg-[#FFFFFF] rounded-2xl border border-[#E3C9A8]/70 shadow-[0_4px_20px_rgba(61,43,31,0.03)] p-4 sm:p-5 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#E3C9A8]/40">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#3D2B1F] text-[#E3C9A8] flex items-center justify-center font-serif text-xs font-bold flex-shrink-0 shadow-2xs">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4896A] block">
                            Shipping Destination
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2
                              className="text-sm sm:text-base font-semibold text-[#2A1E17] uppercase tracking-wider"
                              style={{ fontFamily: "'Cinzel', serif" }}
                            >
                              Delivery Destination
                            </h2>
                            {addresses.length > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF5EC] text-[#8C5D3B] border border-[#E3C9A8]/70 flex-shrink-0">
                                {addresses.length}/3 Saved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {addresses.length < MAX_SAVED_ADDRESSES && (
                        <button
                          type="button"
                          onClick={handleOpenAddAddress}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D2B1F] hover:bg-[#C4896A] text-[#E3C9A8] hover:text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-2xs flex-shrink-0 cursor-pointer"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span className="hidden xs:inline">Add Address</span>
                          <span className="xs:hidden">Add</span>
                        </button>
                      )}
                    </div>

                    {/* Loading indicator */}
                    {loadingAddresses && (
                      <div className="py-7 text-center text-xs text-[#7A6B5D]">
                        <div className="w-5 h-5 border-2 border-[#C4896A]/30 border-t-[#C4896A] rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading saved destinations...</span>
                      </div>
                    )}

                    {/* Case 4: No Saved Addresses */}
                    {!loadingAddresses && addresses.length === 0 && (
                      <div className="text-center py-7 px-4 bg-[#FFFAF5]/70 rounded-xl border border-dashed border-[#E3C9A8] space-y-3">
                        <div className="w-10 h-10 rounded-full bg-[#FEF5EC] border border-[#E3C9A8] mx-auto flex items-center justify-center text-[#C4896A]">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-[#2A1E17]">
                            No Saved Delivery Destinations
                          </p>
                          <p className="text-[11px] sm:text-xs text-[#7A6B5D] max-w-sm mx-auto mt-0.5">
                            Add your primary residence or delivery address to proceed with white-glove courier shipping.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleOpenAddAddress}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span>Add Delivery Address</span>
                        </button>
                      </div>
                    )}

                    {/* Saved Addresses List */}
                    {!loadingAddresses && addresses.length > 0 && (
                      <div className="space-y-3">
                        {/* Address Cards Grid/List */}
                        <div className="space-y-2.5">
                          {addresses.map((addr) => {
                            const isSelected = !isDifferentAddress && selectedAddressId === addr.id;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => {
                                  setSelectedAddressId(addr.id);
                                  setIsDifferentAddress(false);
                                }}
                                className={`group rounded-xl p-3.5 sm:p-4 border transition-all duration-200 cursor-pointer ${
                                  isSelected
                                    ? "bg-[#FEF5EC]/80 border-[#C4896A] ring-1 ring-[#C4896A]/40 shadow-xs"
                                    : "bg-white/90 border-[#E3C9A8]/60 hover:border-[#C4896A]/60 hover:bg-[#FFFAF5]/50 hover:shadow-2xs"
                                }`}
                              >
                                {/* Header inside card: Radio + Name + Badge on left, Edit CTA on right */}
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                    {/* Custom radio button */}
                                    <div
                                      className={`w-4 h-4 rounded-full flex items-center justify-center border flex-shrink-0 transition-all ${
                                        isSelected
                                          ? "border-[#C4896A] bg-[#C4896A] text-white shadow-2xs"
                                          : "border-[#D4B999] bg-white group-hover:border-[#C4896A]"
                                      }`}
                                    >
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>

                                    {/* Recipient Name & Tag */}
                                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                      <span className="text-xs sm:text-sm font-semibold text-[#2A1E17] leading-tight">
                                        {addr.firstName} {addr.lastName}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${
                                          addr.tag === "Default"
                                            ? "bg-[#3D2B1F] text-[#E3C9A8] shadow-2xs"
                                            : "bg-[#FEF5EC] text-[#7A583A] border border-[#E3C9A8]/80"
                                        }`}
                                      >
                                        {addr.tag}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => handleEditAddress(addr, e)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#7A583A] bg-[#FFFAF5] hover:bg-[#3D2B1F] hover:text-[#E3C9A8] border border-[#E3C9A8]/70 transition-all duration-200 flex-shrink-0 cursor-pointer shadow-2xs"
                                    title="Edit address"
                                  >
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                    </svg>
                                    <span>Edit</span>
                                  </button>
                                </div>

                                {/* Body inside card: Full address cleanly indented under the name */}
                                <div className="pl-6.5 sm:pl-7 pt-2 space-y-1">
                                  <p className="text-xs sm:text-sm text-[#4A3B32] leading-relaxed break-words font-normal">
                                    {addr.street}
                                  </p>
                                  <p className="text-xs sm:text-sm text-[#5C4D42] leading-relaxed break-words font-normal">
                                    {addr.city}, {addr.state ? `${addr.state} ` : ""}{addr.postalCode}, {addr.country}
                                  </p>
                                  <div className="flex items-center gap-1.5 pt-0.5 text-xs text-[#7A6B5D]">
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="text-[#C4896A] flex-shrink-0"
                                    >
                                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <span className="font-mono tracking-tight text-[11px] sm:text-xs text-[#7A6B5D]">
                                      {addr.phone}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Ship to Alternate Destination Option */}
                        <div className="pt-1">
                          <div
                            onClick={() => setIsDifferentAddress(true)}
                            className={`rounded-xl p-3.5 sm:p-4 border transition-all duration-200 cursor-pointer ${
                              isDifferentAddress
                                ? "bg-[#FEF5EC]/80 border-[#C4896A] ring-1 ring-[#C4896A]/40 shadow-xs"
                                : "bg-white/90 border-[#E3C9A8]/60 hover:border-[#C4896A]/60 hover:bg-[#FFFAF5]/50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center border flex-shrink-0 transition-all ${
                                    isDifferentAddress
                                      ? "border-[#C4896A] bg-[#C4896A] text-white shadow-2xs"
                                      : "border-[#D4B999] bg-white"
                                  }`}
                                >
                                  {isDifferentAddress && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs sm:text-sm font-semibold text-[#2A1E17]">
                                      Ship to an Alternate Address
                                    </span>
                                  </div>
                                  <p className="text-[11px] sm:text-xs text-[#7A6B5D] mt-0.5 leading-snug">
                                    Specify an alternate delivery location or send directly as a bespoke gift
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-md transition-colors flex-shrink-0 ${
                                  isDifferentAddress
                                    ? "bg-[#3D2B1F] text-[#E3C9A8]"
                                    : "bg-[#FFFAF5] text-[#8C5D3B] border border-[#E3C9A8]/60"
                                }`}
                              >
                                {isDifferentAddress ? "Active" : "Select"}
                              </span>
                            </div>
                          </div>

                          {/* Expanded Alternate Address Form */}
                          {isDifferentAddress && (
                            <div className="mt-3 p-4 sm:p-5 rounded-xl bg-[#FFFAF5]/90 border border-[#E3C9A8] space-y-4 shadow-2xs animate-in fade-in duration-200">
                              <div className="flex items-center justify-between pb-3 border-b border-[#E3C9A8]/50">
                                <div className="flex items-center gap-2">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-[#C4896A]"
                                  >
                                    <polyline points="20 12 20 22 4 22 4 12" />
                                    <rect x="2" y="7" width="20" height="5" />
                                    <line x1="12" y1="22" x2="12" y2="7" />
                                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                                  </svg>
                                  <span
                                    className="text-xs font-semibold text-[#2A1E17] uppercase tracking-wider"
                                    style={{ fontFamily: "'Cinzel', serif" }}
                                  >
                                    Alternate Recipient Details
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#8C7E72] font-medium">* Required</span>
                              </div>

                              {/* Names */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                    First Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={customAddress.firstName}
                                    onChange={(e) => setCustomAddress({ ...customAddress, firstName: e.target.value })}
                                    placeholder="Recipient first name"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3C9A8] bg-white text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:outline-none focus:ring-1 focus:ring-[#C4896A] focus:border-[#C4896A] transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                    Last Name *
                                  </label>
                                  <input
                                    type="text"
                                    value={customAddress.lastName}
                                    onChange={(e) => setCustomAddress({ ...customAddress, lastName: e.target.value })}
                                    placeholder="Recipient family name"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3C9A8] bg-white text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:outline-none focus:ring-1 focus:ring-[#C4896A] focus:border-[#C4896A] transition-all"
                                  />
                                </div>
                              </div>

                              {/* Phone & Email */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                    Phone Number *
                                  </label>
                                  <input
                                    type="tel"
                                    value={customAddress.phone}
                                    onChange={(e) => setCustomAddress({ ...customAddress, phone: e.target.value })}
                                    placeholder="Mobile number for courier updates"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3C9A8] bg-white text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:outline-none focus:ring-1 focus:ring-[#C4896A] focus:border-[#C4896A] transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                    Email (Optional)
                                  </label>
                                  <input
                                    type="email"
                                    value={customAddress.email}
                                    onChange={(e) => setCustomAddress({ ...customAddress, email: e.target.value })}
                                    placeholder="For electronic dispatch notes"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3C9A8] bg-white text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:outline-none focus:ring-1 focus:ring-[#C4896A] focus:border-[#C4896A] transition-all"
                                  />
                                </div>
                              </div>

                              {/* Street Address */}
                              <div>
                                <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                  Street Address *
                                </label>
                                <input
                                  type="text"
                                  value={customAddress.street}
                                  onChange={(e) => setCustomAddress({ ...customAddress, street: e.target.value })}
                                  placeholder="House/flat number, street name, apartment or suite"
                                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E3C9A8] bg-white text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:outline-none focus:ring-1 focus:ring-[#C4896A] focus:border-[#C4896A] transition-all"
                                />
                              </div>

                              {/* Country, State, City */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
                                <div>
                                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                    Country *
                                  </label>
                                  <AtelierDropdown
                                    items={countryDropdownItems}
                                    selectedId={customAddress.countryCode}
                                    onSelect={(iso) => {
                                      const c = allCountries.find((item) => item.isoCode === iso);
                                      setCustomAddress({
                                        ...customAddress,
                                        countryCode: iso,
                                        country: c?.name || "",
                                        stateCode: "",
                                        state: "",
                                        city: "",
                                      });
                                    }}
                                    placeholder="Select Country"
                                    searchable={true}
                                    className="w-full"
                                    buttonClassName="!py-2.5 !text-xs sm:!text-sm !rounded-lg !border-[#E3C9A8] !bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                    State / Province *
                                  </label>
                                  <AtelierDropdown
                                    items={stateDropdownItems}
                                    selectedId={customAddress.stateCode}
                                    onSelect={(sIso) => {
                                      const s = statesForCustomCountry.find((item) => item.isoCode === sIso);
                                      setCustomAddress({
                                        ...customAddress,
                                        stateCode: sIso,
                                        state: s?.name || "",
                                        city: "",
                                      });
                                    }}
                                    placeholder="Select State"
                                    searchable={true}
                                    disabled={!customAddress.countryCode}
                                    className="w-full"
                                    buttonClassName="!py-2.5 !text-xs sm:!text-sm !rounded-lg !border-[#E3C9A8] !bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                    City / District *
                                  </label>
                                  <AtelierDropdown
                                    items={cityDropdownItems}
                                    selectedId={customAddress.city}
                                    onSelect={(cityName) => {
                                      setCustomAddress({
                                        ...customAddress,
                                        city: cityName,
                                      });
                                    }}
                                    placeholder="Select City"
                                    searchable={true}
                                    disabled={!customAddress.stateCode}
                                    className="w-full"
                                    buttonClassName="!py-2.5 !text-xs sm:!text-sm !rounded-lg !border-[#E3C9A8] !bg-white"
                                  />
                                </div>
                              </div>

                              {/* Postal Code */}
                              <div>
                                <label className="block text-xs font-medium text-[#3D2B1F] mb-1.5">
                                  Postal / ZIP Code *
                                </label>
                                <input
                                  type="text"
                                  value={customAddress.postalCode}
                                  onChange={(e) => setCustomAddress({ ...customAddress, postalCode: e.target.value })}
                                  placeholder="e.g. 10001 or SW1A 1AA"
                                  className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-lg border border-[#E3C9A8] bg-white text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:outline-none focus:ring-1 focus:ring-[#C4896A] focus:border-[#C4896A] transition-all"
                                />
                              </div>

                              {/* Save to book */}
                              {addresses.length < MAX_SAVED_ADDRESSES && (
                                <div className="pt-2 border-t border-[#E3C9A8]/40">
                                  <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs text-[#5C4D42] hover:text-[#2A1E17] select-none transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={saveCustomToBook}
                                      onChange={(e) => setSaveCustomToBook(e.target.checked)}
                                      className="w-4 h-4 rounded border-[#E3C9A8] text-[#3D2B1F] focus:ring-[#C4896A] cursor-pointer"
                                    />
                                    <span>Save this destination to my address book for future orders</span>
                                  </label>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PAYMENT METHOD SECTION ───────────────────────────────── */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E3C9A8]/70 shadow-[0_4px_20px_rgba(61,43,31,0.03)] p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E3C9A8]/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#3D2B1F] text-[#E3C9A8] flex items-center justify-center font-serif text-xs font-bold shadow-2xs">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4896A] block">
                          Payment
                        </span>
                        <h3
                          className="text-sm sm:text-base font-semibold text-[#2A1E17] uppercase tracking-wider"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          Payment Method
                        </h3>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3FAF5] border border-[#22AD5C]/30 text-[11px] text-[#1A8245] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22AD5C]" />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* Option 1: Credit / Debit Card */}
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${
                        paymentMethod === "card"
                          ? "bg-[#FEF5EC]/70 border-[#C4896A] ring-1 ring-[#C4896A]/30 shadow-2xs"
                          : "bg-[#FFFAF5]/40 border-[#E3C9A8]/50 hover:border-[#C4896A]/60"
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Radio indicator */}
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border flex-shrink-0 transition-all ${
                              paymentMethod === "card"
                                ? "bg-[#C4896A] border-[#C4896A] text-white"
                                : "border-[#E3C9A8] bg-white"
                            }`}
                          >
                            {paymentMethod === "card" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Icon Container */}
                          <div className="w-9 h-9 rounded-lg bg-[#FFFAF5] border border-[#E3C9A8]/70 flex items-center justify-center text-[#3D2B1F] flex-shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="5" width="20" height="14" rx="2" />
                              <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-[#2A1E17] block">
                              Credit or Debit Card
                            </span>
                            <span className="text-[11px] sm:text-xs text-[#7A6B5D] block truncate">
                              Instant payment via secure encrypted gateway
                            </span>
                          </div>
                        </div>

                        {/* Card brand badges */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider text-[#1A1F71] bg-white border border-[#E3C9A8]/60 shadow-2xs">
                            VISA
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider text-[#EB001B] bg-white border border-[#E3C9A8]/60 shadow-2xs">
                            MC
                          </span>
                          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider text-[#006FCF] bg-white border border-[#E3C9A8]/60 shadow-2xs">
                            AMEX
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Direct Bank Transfer */}
                    <div
                      onClick={() => setPaymentMethod("wire")}
                      className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${
                        paymentMethod === "wire"
                          ? "bg-[#FEF5EC]/70 border-[#C4896A] ring-1 ring-[#C4896A]/30 shadow-2xs"
                          : "bg-[#FFFAF5]/40 border-[#E3C9A8]/50 hover:border-[#C4896A]/60"
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Radio indicator */}
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border flex-shrink-0 transition-all ${
                              paymentMethod === "wire"
                                ? "bg-[#C4896A] border-[#C4896A] text-white"
                                : "border-[#E3C9A8] bg-white"
                            }`}
                          >
                            {paymentMethod === "wire" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Icon Container */}
                          <div className="w-9 h-9 rounded-lg bg-[#FFFAF5] border border-[#E3C9A8]/70 flex items-center justify-center text-[#3D2B1F] flex-shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 3l9 7H3l9-7z" />
                            </svg>
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-[#2A1E17] block">
                              Direct Bank Transfer
                            </span>
                            <span className="text-[11px] sm:text-xs text-[#7A6B5D] block truncate">
                              Atelier escrow wire / NEFT / IBAN
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-medium text-[#7A6B5D] bg-white border border-[#E3C9A8]/70 flex-shrink-0">
                          Official Invoice
                        </span>
                      </div>
                    </div>

                    {/* Option 3: Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod("cash")}
                      className={`rounded-xl border transition-all cursor-pointer overflow-hidden ${
                        paymentMethod === "cash"
                          ? "bg-[#FEF5EC]/70 border-[#C4896A] ring-1 ring-[#C4896A]/30 shadow-2xs"
                          : "bg-[#FFFAF5]/40 border-[#E3C9A8]/50 hover:border-[#C4896A]/60"
                      }`}
                    >
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Radio indicator */}
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center border flex-shrink-0 transition-all ${
                              paymentMethod === "cash"
                                ? "bg-[#C4896A] border-[#C4896A] text-white"
                                : "border-[#E3C9A8] bg-white"
                            }`}
                          >
                            {paymentMethod === "cash" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Icon Container */}
                          <div className="w-9 h-9 rounded-lg bg-[#FFFAF5] border border-[#E3C9A8]/70 flex items-center justify-center text-[#3D2B1F] flex-shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="6" width="20" height="12" rx="2" />
                              <circle cx="12" cy="12" r="2.5" />
                              <path d="M6 12h.01M18 12h.01" />
                            </svg>
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-[#2A1E17] block">
                              Cash on Delivery
                            </span>
                            <span className="text-[11px] sm:text-xs text-[#7A6B5D] block truncate">
                              Settlement upon handover & physical parcel inspection
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-medium text-[#7A6B5D] bg-white border border-[#E3C9A8]/70 flex-shrink-0">
                          Pay on Arrival
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── ORDER NOTES (COMPACT & OPTIONAL) ─────────────────────── */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E3C9A8]/60 shadow-[0_4px_20px_rgba(61,43,31,0.03)] p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#C4896A] text-xs">✦</span>
                    <label
                      htmlFor="atelierNotes"
                      className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#3D2B1F]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      Order Notes & Inscriptions (Optional)
                    </label>
                  </div>
                  <textarea
                    id="atelierNotes"
                    rows={2}
                    value={atelierNotes}
                    onChange={(e) => setAtelierNotes(e.target.value)}
                    placeholder="Monogram initials, gift inscription, or delivery instructions..."
                    className="w-full p-3 rounded-xl border border-[#E3C9A8] bg-[#FFFAF5] text-xs sm:text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C4896A] transition-all resize-none"
                  />
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────────── */}
              {/* RIGHT COLUMN: Order Summary & Place Order CTA (5 Cols)         */}
              {/* ────────────────────────────────────────────────────────────── */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                {/* ── DESKTOP ORDER SUMMARY ─────────────────────────────────── */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E3C9A8] shadow-[0_6px_25px_rgba(61,43,31,0.04)] p-4 sm:p-5 lg:p-6 space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E3C9A8]/40">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C4896A] block">
                        Summary
                      </span>
                      <h3
                        className="text-sm sm:text-base font-semibold text-[#2A1E17] uppercase tracking-wider"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        Your Order
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-[#C4896A] bg-[#FEF5EC] px-2.5 py-0.5 rounded-full border border-[#E3C9A8]/60">
                      {cartItems.reduce((acc, i) => acc + i.quantity, 0)} {cartItems.reduce((acc, i) => acc + i.quantity, 0) === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="max-h-[240px] overflow-y-auto space-y-2 pr-0.5">
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FFFAF5]/70 border border-[#E3C9A8]/40 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-[#EDD9B8] bg-[#FEF5EC] flex-shrink-0">
                              <Image
                                src={
                                  (item.imgs?.thumbnails && item.imgs.thumbnails[0]) ||
                                  (item.imgs?.previews && item.imgs.previews[0]) ||
                                  (item.id && Number(item.id) >= 1 && Number(item.id) <= 8
                                    ? `/images/products/product-${item.id}-sm-1.png`
                                    : "/images/products/product-1-sm-1.png")
                                }
                                alt={item.title}
                                fill
                                className="object-contain p-0.5"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#3D2B1F] truncate text-xs sm:text-sm">
                                {item.title}
                              </p>
                              <span className="text-[11px] text-[#A09082]">
                                Qty {item.quantity} × ${(item.discountedPrice || item.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 font-bold text-[#3D2B1F] text-xs sm:text-sm">
                            ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-5 text-center text-xs text-[#7A6B5D] bg-[#FFFAF5] rounded-xl border border-dashed border-[#E3C9A8]">
                        Your shopping bag is empty.
                        <div className="mt-1">
                          <Link href="/shop" className="text-[#C4896A] font-medium underline">
                            Explore creations →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-[#E3C9A8]/40 space-y-2 text-xs sm:text-sm text-[#7A6B5D]">
                    <div className="flex justify-between">
                      <span>Order Subtotal</span>
                      <span className="font-medium text-[#3D2B1F]">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping Charges</span>
                      <span className="font-medium text-[#3D2B1F]">
                        {shippingFee === 0 ? "Included" : `$${shippingFee.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-3 border-t border-[#E3C9A8]/60 flex items-center justify-between">
                    <div>
                      <span
                        className="text-xs sm:text-sm font-semibold text-[#2A1E17] uppercase tracking-wider block"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        Total Amount
                      </span>
                      <span className="text-[11px] text-[#A09082]">
                        Taxes & insured courier included
                      </span>
                    </div>
                    <span
                      className="text-xl sm:text-2xl font-bold text-[#C4896A]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Primary Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting || cartItems.length === 0}
                    className="w-full py-3 sm:py-3.5 px-5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider uppercase text-white transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 mt-1 cursor-pointer"
                    style={{ background: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "#C4896A";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = "#3D2B1F";
                    }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Confirming Commission...</span>
                      </span>
                    ) : !currentUser ? (
                      <span>Sign In to Place Order</span>
                    ) : (
                      <span>Place Order • ${totalAmount.toFixed(2)}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ── ADDRESS MODAL ("New Atelier Destination - Add Delivery Address") ── */}
      <AddressModal
        isOpen={isAddressModalOpen}
        closeModal={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSave={handleAddressSaved}
        isFirstAddress={addresses.length === 0}
        usedTags={addresses.map((a) => a.tag)}
      />
    </>
  );
};

export default Checkout;
