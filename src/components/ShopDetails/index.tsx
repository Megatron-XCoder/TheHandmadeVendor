"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { showToast } from "@/utils/toast";
import shopData from "@/components/Shop/shopData";
import { Product } from "@/types/product";
import RecentlyViewdItems from "./RecentlyViewd";

// ─────────────────────────────────────────────────────────────────────────────
// Smooth Zoom on Hover
// ─────────────────────────────────────────────────────────────────────────────
const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      className="relative w-full h-full cursor-crosshair overflow-hidden bg-[#FBF5ED]/40"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-contain select-none p-8 sm:p-14"
        style={{
          transformOrigin: `${position.x}% ${position.y}%`,
          transform: showZoom ? "scale(1.8)" : "scale(1)",
          transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
        sizes="(max-width: 1024px) 100vw, 650px"
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-triggered fade-in hook
// ─────────────────────────────────────────────────────────────────────────────
const useRevealOnScroll = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// ─────────────────────────────────────────────────────────────────────────────
// Review Data
// ─────────────────────────────────────────────────────────────────────────────
interface CollectorReview {
  id: number;
  author: string;
  role: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const COLLECTOR_REVIEWS: CollectorReview[] = [
  {
    id: 1,
    author: "Davis Dorwart",
    role: "Collector & Architect",
    location: "Milan, Italy",
    rating: 5,
    date: "Sep 2026",
    comment:
      "The hand-burnished patina and solid brass fittings are of a caliber rarely seen today. Arrived in an exquisite presentation box with a signed certificate.",
    verified: true,
  },
  {
    id: 2,
    author: "Elena Rostova",
    role: "Jewelry Historian",
    location: "Geneva, Switzerland",
    rating: 5,
    date: "Aug 2026",
    comment:
      "Sensational balance and tactile weight. The vegetable-tanned beeswax aroma is unmistakable. It has already earned daily rotation in my private curation.",
    verified: true,
  },
  {
    id: 3,
    author: "Marcus Vance",
    role: "Horology Enthusiast",
    location: "London, UK",
    rating: 5,
    date: "Jul 2026",
    comment:
      "Uncompromising attention to detail. Every bevel and stitch line shows generational mastery. The monogramming was executed with surgical precision.",
    verified: true,
  },
  {
    id: 4,
    author: "Sophia Laurent",
    role: "Interior Curator",
    location: "Paris, France",
    rating: 5,
    date: "Jun 2026",
    comment:
      "A magnificent heirloom piece. The weight, structural symmetry, and organic grain texture embody true quiet luxury.",
    verified: true,
  },
  {
    id: 5,
    author: "Kenji Takahashi",
    role: "Design Director",
    location: "Kyoto, Japan",
    rating: 5,
    date: "May 2026",
    comment:
      "Respectful of tradition and utterly modern in ergonomics. The white-glove courier packaging was seamless.",
    verified: true,
  },
  {
    id: 6,
    author: "Charlotte Beauchamp",
    role: "Private Collector",
    location: "New York, USA",
    rating: 5,
    date: "Apr 2026",
    comment:
      "The leather softens and acquires an individual amber glow with each passing month. Outstanding customer care.",
    verified: true,
  },
];

const FINISH_OPTIONS = [
  { name: "Vintage Cognac", hex: "#9E5B32" },
  { name: "Tuscan Ochre", hex: "#C4896A" },
  { name: "Espresso", hex: "#3D2B1F" },
  { name: "Bone Ivory", hex: "#E8DED2" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ShopDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { openPreviewModal } = usePreviewSlider();

  // Resolve product
  const paramId = Number(searchParams.get("id"));
  const productFromRedux = useAppSelector((state) => state.productDetailsReducer.value);

  const product: Product = useMemo(() => {
    if (paramId) {
      const match = shopData.find((item) => item.id === paramId);
      if (match) return match;
    }
    if (productFromRedux && productFromRedux.id) return productFromRedux;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("productDetails");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    return shopData[0];
  }, [paramId, productFromRedux]);

  // Gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Config
  const [selectedFinish, setSelectedFinish] = useState(FINISH_OPTIONS[0].name);
  const [quantity, setQuantity] = useState(1);

  // Accordions (first accordion open by default)
  const [openAccordion, setOpenAccordion] = useState<string | null>("details");
  const toggleAccordion = (id: string) => setOpenAccordion((prev) => (prev === id ? null : id));

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wishlist
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isInWishlist = wishlistItems.some((w) => w.id === product.id);

  // Media
  const previews = product.imgs?.previews?.length
    ? product.imgs.previews
    : [product.imgs?.thumbnails?.[0] || "/images/products/product-1-bg-1.png"];
  const currentDisplayImage = previews[activeImageIndex] || previews[0];

  // Entrance animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reveal hooks
  const reviewsReveal = useRevealOnScroll(0.1);
  const recommendReveal = useRevealOnScroll(0.1);

  // Actions
  const handleAddToCart = () => {
    dispatch(addItemToCart({ ...product, quantity }));
    showToast.success("Added to bag");
  };

  const handleAcquireNow = () => {
    dispatch(addItemToCart({ ...product, quantity }));
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeItemFromWishlist(product.id));
      showToast.info("Removed from wishlist");
    } else {
      dispatch(addItemToWishlist({ ...product, status: "available", quantity: 1 }));
      showToast.success("Saved to wishlist");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast.success("Link copied");
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newComment.trim()) {
      showToast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReviewModalOpen(false);
      setNewComment("");
      setNewName("");
      setNewEmail("");
      showToast.success("Review submitted for verification");
    }, 500);
  };

  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const scrollToReviews = () => {
    if (reviewsSectionRef.current) {
      const topOffset = reviewsSectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  // Discount percentage
  const discountPercent =
    product.price > product.discountedPrice
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;

  return (
    <div className="min-h-screen relative bg-[#FFFAF5] text-[#3D2B1F] antialiased">
      {/* ── BREADCRUMB ─────────────────────────────────────────────── */}
      <div
        className="pt-24 sm:pt-28 pb-2"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-[#9B8D80]">
            <Link href="/" className="hover:text-[#C4896A] transition-colors duration-200">
              Home
            </Link>
            <span className="opacity-30">/</span>
            <Link href="/shop" className="hover:text-[#C4896A] transition-colors duration-200">
              Shop
            </Link>
            <span className="opacity-30">/</span>
            <span className="text-[#5D4E42] truncate max-w-[180px] sm:max-w-none">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ── MAIN PRODUCT SECTION ─────────────────────────────────── */}
      <section className="py-6 sm:py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

            {/* ── LEFT: GALLERY ──────────────────────────────────── */}
            <div
              className="flex flex-col gap-3"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
              }}
            >
              {/* Main Image */}
              <div className="relative w-full aspect-[1/1.05] rounded-2xl overflow-hidden bg-white border border-[#EDE4D8]/60 group">
                {/* Floating action icons */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
                  <button
                    onClick={handleShare}
                    aria-label="Share Link"
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#5D4E42] hover:text-[#C4896A] transition-all duration-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer shadow-sm"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    aria-label="Wishlist"
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
                      isInWishlist
                        ? "bg-[#3D2B1F] text-[#C4896A]"
                        : "bg-white/90 backdrop-blur-sm text-[#5D4E42] hover:text-[#C4896A] opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                  <button
                    onClick={openPreviewModal}
                    aria-label="Expand"
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#5D4E42] hover:text-[#C4896A] transition-all duration-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer shadow-sm"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>

                {/* Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className="text-[9px] font-bold tracking-[0.15em] uppercase bg-[#3D2B1F] text-[#FAF6F0] px-2 py-1 rounded-sm">
                      −{discountPercent}%
                    </span>
                  </div>
                )}

                <ZoomableImage src={currentDisplayImage} alt={product.title} />
              </div>

              {/* Thumbnails */}
              {previews.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  {previews.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all duration-200 bg-white ${
                        activeImageIndex === idx
                          ? "border-[#C4896A] shadow-[0_0_0_1px_rgba(196,137,106,0.3)]"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`View ${idx + 1}`} fill className="object-contain p-1.5" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: PRODUCT INFO ────────────────────────────── */}
            <div
              className="flex flex-col lg:sticky lg:top-24"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s",
              }}
            >
              {/* Category tag */}
              <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#C4896A] mb-2">
                {product.category || "The Handmade Vendor"}
              </span>

              {/* Title */}
              <h1
                className="text-2xl sm:text-3xl lg:text-[2.2rem] font-normal text-[#2A1E17] leading-[1.15] mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {product.title}
              </h1>

              {/* Price + Rating row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-light text-[#2A1E17]">
                    ${product.discountedPrice.toFixed(2)}
                  </span>
                  {product.price > product.discountedPrice && (
                    <span className="text-sm line-through text-[#B5A99A]">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="w-px h-4 bg-[#E3C9A8]/50" />
                <button
                  onClick={scrollToReviews}
                  className="flex items-center gap-1 text-[11px] text-[#8C7A6B] hover:text-[#C4896A] transition-colors cursor-pointer"
                >
                  <div className="flex gap-px">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#C4896A">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="underline underline-offset-2 decoration-[#C4896A]/40">{COLLECTOR_REVIEWS.length}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-[#E3C9A8]/50 via-[#E3C9A8]/20 to-transparent mb-5" />

              {/* Description */}
              <p className="text-[13px] text-[#6E5D4F] font-light leading-[1.7] mb-6">
                {product.description ||
                  "Individually hand-cut from organic vegetable-tanned leather, burnished with raw beeswax, and fitted with solid brass hardware."}
              </p>

              {/* Finish Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#7A6B5D]">
                    Finish
                  </span>
                  <span className="text-[11px] text-[#5D4E42] font-medium">{selectedFinish}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {FINISH_OPTIONS.map((finish) => (
                    <button
                      key={finish.name}
                      onClick={() => setSelectedFinish(finish.name)}
                      aria-label={finish.name}
                      className={`relative w-7 h-7 rounded-full transition-all duration-200 cursor-pointer ${
                        selectedFinish === finish.name
                          ? "ring-[1.5px] ring-[#C4896A] ring-offset-2 ring-offset-[#FFFAF5] scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: finish.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* ── Purchase Controls ──────────────────────────── */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper (from Product Preview) */}
                  <div className="flex items-center border border-[#E3C9A8] rounded-full overflow-hidden bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-[#C4896A] hover:bg-[#FDF0E6] transition-colors text-sm cursor-pointer select-none"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-8 sm:w-9 text-center text-sm font-semibold text-gray-800 select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-[#C4896A] hover:bg-[#FDF0E6] transition-colors text-sm cursor-pointer select-none"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-9 sm:h-10 rounded-full bg-[#3D2B1F] text-white hover:bg-[#C4896A] text-xs font-semibold uppercase tracking-wider transition-colors duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    Add to Bag
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAcquireNow}
                  className="w-full h-10 rounded-full border border-[#3D2B1F] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors duration-300 active:scale-[0.98] cursor-pointer"
                >
                  Buy Now
                </button>
              </div>

              {/* ── Accordions ────────────────────────────────── */}
              <div className="border-t border-[#EDE4D8]/60">
                {[
                  {
                    id: "details",
                    title: "Details & Provenance",
                    content: (
                      <div className="space-y-2 text-[12px] text-[#6E5D4F] font-light leading-[1.7]">
                        <p>
                          Handcrafted by master artisans utilizing centuries-old saddle-stitching techniques. Tanned naturally in Tuscan river vats with vegetable extracts of chestnut and mimosa bark.
                        </p>
                        <p className="text-[#9B8D80]">
                          Each creation features hand-burnished edges sealed with organic beeswax and stamped with a unique atelier edition serial.
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: "specs",
                    title: "Specifications & Care",
                    content: (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                        {[
                          { label: "Material", value: "Full-Grain Vegetable Leather" },
                          { label: "Hardware", value: "Solid Cast Antiqued Brass" },
                          { label: "Dimensions", value: "32 × 24 × 9 cm" },
                          { label: "Care", value: "Condition biannually" },
                        ].map((spec) => (
                          <div key={spec.label}>
                            <span className="block text-[10px] uppercase tracking-[0.1em] text-[#9B8D80] font-medium mb-0.5">
                              {spec.label}
                            </span>
                            <span className="text-[#5D4E42] font-light">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    id: "shipping",
                    title: "Shipping & Returns",
                    content: (
                      <div className="space-y-1.5 text-[12px] text-[#6E5D4F] font-light leading-[1.7]">
                        <p>• Complimentary insured global delivery in archival gift sleeve.</p>
                        <p>• Lifetime repair and stitching maintenance warranty.</p>
                        <p>• 30-day effortless exchange policy.</p>
                      </div>
                    ),
                  },
                ].map((section) => (
                  <div key={section.id} className="border-b border-[#EDE4D8]/60">
                    <button
                      onClick={() => toggleAccordion(section.id)}
                      className="w-full py-4 flex items-center justify-between text-left cursor-pointer group/acc"
                    >
                      <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#3D2B1F] group-hover/acc:text-[#C4896A] transition-colors">
                        {section.title}
                      </span>
                      <span
                        className="text-[#C4896A] text-xs transition-transform duration-300"
                        style={{
                          transform: openAccordion === section.id ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: openAccordion === section.id ? "300px" : "0px",
                        opacity: openAccordion === section.id ? 1 : 0,
                        paddingBottom: openAccordion === section.id ? "16px" : "0px",
                      }}
                    >
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS SECTION ──────────────────────────────────────── */}
      <section
        ref={(el: HTMLDivElement | null) => {
          (reviewsSectionRef as any).current = el;
          (reviewsReveal.ref as any).current = el;
        }}
        className="py-16 sm:py-24 bg-[#FAF6F0]/90 border-t border-[#E3C9A8]/40 relative"
        style={{
          opacity: reviewsReveal.isVisible ? 1 : 0,
          transform: reviewsReveal.isVisible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Overall Rating Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12 pb-6 sm:pb-8 border-b border-[#E3C9A8]/30">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-[#C4896A] block mb-2">
                Authentic Patronage
              </span>
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#2A1E17] tracking-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Client Reflections
              </h2>
              <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#C4896A">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#2A1E17]">5.0</span>
                <span className="text-xs text-[#8C7B6D]">
                  • {COLLECTOR_REVIEWS.length} Verified Patron Appraisals
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#3D2B1F] text-[#3D2B1F] bg-white hover:bg-[#3D2B1F] hover:text-[#FAF6F0] transition-all duration-300 text-xs font-semibold uppercase tracking-wider shadow-sm cursor-pointer active:scale-95"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {COLLECTOR_REVIEWS.map((rev) => {
              const initials = rev.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2);

              return (
                <div
                  key={rev.id}
                  className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-[#E3C9A8]/40 hover:border-[#C4896A]/70 shadow-[0_2px_14px_rgba(61,43,31,0.03)] hover:shadow-[0_8px_24px_rgba(196,137,106,0.1)] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top row: stars + date */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#C4896A">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-[#A8988A] font-medium">
                        {rev.date}
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-[12.5px] sm:text-[13px] leading-[1.7] text-[#4A3B30] font-light mb-5 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  {/* Author footer */}
                  <div className="pt-3.5 border-t border-[#EDE4D8]/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#FEF5EC] border border-[#E3C9A8]/60 flex items-center justify-center text-[10px] font-bold text-[#C4896A] shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <span
                          className="text-xs font-semibold text-[#2A1E17] block truncate leading-tight"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          {rev.author}
                        </span>
                        <span className="text-[10px] text-[#8C7B6D] font-light block truncate">
                          {rev.location}
                        </span>
                      </div>
                    </div>

                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-[#C4896A] bg-[#FDF0E6] px-2 py-0.5 rounded-full shrink-0">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── REVIEW MODAL ─────────────────────────────────────────── */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setIsReviewModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[#FFFAF5] border border-[#E3C9A8]/70 p-6 shadow-2xl space-y-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]/50">
              <h3
                className="text-lg font-normal text-[#2A1E17]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Share Your Experience
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#8C7A6B] hover:text-[#3D2B1F] hover:bg-white cursor-pointer transition-colors"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A6B5D] mb-1.5">
                  Rating
                </label>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={star <= newRating ? "#C4896A" : "none"}
                        stroke="#C4896A"
                        strokeWidth="1.5"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A6B5D] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#EDE4D8] focus:border-[#C4896A] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A6B5D] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#EDE4D8] focus:border-[#C4896A] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A6B5D] mb-1">
                  Your Review
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  placeholder="Share your thoughts..."
                  className="w-full p-3 text-xs rounded-lg bg-white border border-[#EDE4D8] focus:border-[#C4896A] outline-none resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-[10px] uppercase tracking-wider text-[#8C7A6B] hover:text-[#3D2B1F] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#2A1E17] text-[#FAF6F0] text-[10px] font-semibold uppercase tracking-[0.12em] hover:bg-[#1A120D] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RECOMMENDATIONS ──────────────────────────────────────── */}
      <div
        ref={recommendReveal.ref}
        style={{
          opacity: recommendReveal.isVisible ? 1 : 0,
          transform: recommendReveal.isVisible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <RecentlyViewdItems currentProductId={product.id} />
      </div>

      {/* ── Keyframes ────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
