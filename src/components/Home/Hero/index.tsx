"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const slides = [
  {
    image: "/images/brand/hero-main.jpg",
    tag: "New Collection",
    title1: "Handcrafted",
    title2: "With Love",
    desc: "Discover our curated collection of artisanal leather bags and accessories — each piece tells a story of timeless craftsmanship."
  },
  {
    image: "/images/brand/hero-2.jpg",
    tag: "Urban Elegance",
    title1: "The Modern",
    title2: "Classic",
    desc: "Elevate your everyday style with our premium leather totes, designed for the sophisticated city lifestyle."
  },
  {
    image: "/images/brand/hero-3.jpg",
    tag: "Essential Luxury",
    title1: "Timeless",
    title2: "Accessories",
    desc: "Explore our collection of meticulously crafted wallets, sunglasses, and leather goods that redefine everyday luxury."
  }
];

const Hero = () => {
  return (
    <section
      className="overflow-hidden pt-32 sm:pt-36 lg:pt-28 xl:pt-32 pb-10 lg:pb-16"
      style={{ background: "#FFFAF5" }}
    >
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        
        {/* ── Main hero banner Carousel ───────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden mb-6" style={{ minHeight: "420px" }}>
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={true}
            className="h-full hero-main-carousel"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div
                  className="flex flex-col lg:flex-row items-center h-full"
                  style={{ background: "linear-gradient(135deg, #FFFAF5 0%, #F5E6D3 50%, #E3C9A8 100%)" }}
                >
                  {/* Text */}
                  <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 xl:p-20 z-10">
                    <span
                      className="inline-block text-xs uppercase tracking-[0.2em] font-medium mb-4 px-4 py-1.5 rounded-full"
                      style={{ background: "#FEF5EC", color: "#C4896A", border: "1px solid #E3C9A8" }}
                    >
                      {slide.tag}
                    </span>

                    <h1
                      className="font-bold text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] leading-tight mb-5"
                      style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
                    >
                      {slide.title1} <br />
                      <span style={{ color: "#C4896A" }}>{slide.title2}</span>
                    </h1>

                    <p className="text-base sm:text-lg mb-8 max-w-[400px]" style={{ color: "#7A6B5D" }}>
                      {slide.desc}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="/shop-with-sidebar"
                        className="inline-flex items-center gap-2 font-medium text-sm text-white px-8 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg"
                        style={{ background: "#C4896A" }}
                        onMouseEnter={(e: any) => (e.currentTarget.style.background = "#B37A5E")}
                        onMouseLeave={(e: any) => (e.currentTarget.style.background = "#C4896A")}
                      >
                        Shop Collection
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                      <Link
                        href="/shop-without-sidebar"
                        className="inline-flex items-center font-medium text-sm px-8 py-3.5 rounded-full transition-all duration-300"
                        style={{ color: "#C4896A", border: "1.5px solid #C4896A", background: "rgba(255,250,245,0.8)" }}
                        onMouseEnter={(e: any) => {
                          e.currentTarget.style.background = "#C4896A";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e: any) => {
                          e.currentTarget.style.background = "rgba(255,250,245,0.8)";
                          e.currentTarget.style.color = "#C4896A";
                        }}
                      >
                        View All
                      </Link>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="w-full lg:w-1/2 relative min-h-[300px] lg:min-h-[420px] h-full">
                    <Image
                      src={slide.image}
                      alt={slide.title1}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* ── Two smaller cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 — Accessories */}
          <div
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
            style={{ background: "#F5E6D3", minHeight: "260px" }}
          >
            <div className="flex items-center h-full">
              <div className="w-1/2 p-6 sm:p-8 lg:p-10 z-10">
                <span className="block text-xs uppercase tracking-[0.15em] font-medium mb-2" style={{ color: "#C4896A" }}>
                  Artisan Selection
                </span>
                <h2 className="font-bold text-xl sm:text-2xl mb-4" style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}>
                  Accessories
                </h2>
                <p className="text-sm mb-5" style={{ color: "#7A6B5D" }}>
                  Scarves, jewelry & more — handpicked to complement your style.
                </p>
                <Link
                  href="/shop-with-sidebar"
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                  style={{ color: "#C4896A" }}
                >
                  Explore
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <div className="w-1/2 relative h-full min-h-[260px]">
                <Image
                  src="/images/brand/hero-accessories.jpg"
                  alt="Premium accessories"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2 — Clutches */}
          <div
            className="relative rounded-2xl overflow-hidden group cursor-pointer"
            style={{ background: "#EDD9C5", minHeight: "260px" }}
          >
            <div className="flex items-center h-full">
              <div className="w-1/2 p-6 sm:p-8 lg:p-10 z-10">
                <span className="block text-xs uppercase tracking-[0.15em] font-medium mb-2" style={{ color: "#C4896A" }}>
                  Limited Edition
                </span>
                <h2 className="font-bold text-xl sm:text-2xl mb-4" style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}>
                  Evening Clutches
                </h2>
                <p className="text-sm mb-5" style={{ color: "#7A6B5D" }}>
                  Elegant handcrafted clutches for your special occasions.
                </p>
                <Link
                  href="/shop-with-sidebar"
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                  style={{ color: "#C4896A" }}
                >
                  Discover
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <div className="w-1/2 relative h-full min-h-[260px]">
                <Image
                  src="/images/brand/promo-clutch.jpg"
                  alt="Evening clutch"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust badges ────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 rounded-2xl py-8 px-6"
          style={{ background: "#FEF5EC", border: "1px solid #E3C9A8" }}
        >
          {/* Badge 1 */}
          <div className="flex flex-col items-center text-center px-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
              <rect x="3" y="8" width="18" height="12" rx="2" />
              <path d="M12 8v12" />
              <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            <h3 className="font-semibold text-sm mb-1 uppercase tracking-wider" style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}>
              Gift Wrapping
            </h3>
            <p className="text-xs" style={{ color: "#7A6B5D" }}>
              Complimentary on all orders
            </p>
          </div>
          {/* Badge 2 */}
          <div className="flex flex-col items-center text-center px-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <h3 className="font-semibold text-sm mb-1 uppercase tracking-wider" style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}>
              Free Shipping
            </h3>
            <p className="text-xs" style={{ color: "#7A6B5D" }}>
              On orders above ₹1,999
            </p>
          </div>
          {/* Badge 3 */}
          <div className="flex flex-col items-center text-center px-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <h3 className="font-semibold text-sm mb-1 uppercase tracking-wider" style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}>
              Easy Returns
            </h3>
            <p className="text-xs" style={{ color: "#7A6B5D" }}>
              15-day return policy
            </p>
          </div>
          {/* Badge 4 */}
          <div className="flex flex-col items-center text-center px-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
              <path d="M12 2l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z" />
            </svg>
            <h3 className="font-semibold text-sm mb-1 uppercase tracking-wider" style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}>
              Handcrafted
            </h3>
            <p className="text-xs" style={{ color: "#7A6B5D" }}>
              Artisan-made with care
            </p>
          </div>
        </div>
      </div>
      {/* Add some custom styles for the Swiper pagination & navigation to match brand colors */}
      <style>{`
        .hero-main-carousel .swiper-pagination-bullet {
          background: #3D2B1F;
          opacity: 0.5;
        }
        .hero-main-carousel .swiper-pagination-bullet-active {
          background: #C4896A;
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default Hero;
