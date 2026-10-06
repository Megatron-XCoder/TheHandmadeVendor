"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-16 lg:py-24" style={{ background: "#FFFAF5" }}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        
        {/* Main large promo card */}
        <div className="relative overflow-hidden rounded-2xl mb-8 group h-[400px] md:h-[500px] shadow-lg">
          <Image
            src="/images/brand/promo-1-new.jpg"
            alt="The Artisan Tote"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Elegant dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 z-10 w-full md:w-2/3 lg:w-1/2">
            <span
              className="block font-semibold text-xs md:text-sm mb-4 tracking-[0.2em] uppercase"
              style={{ color: "#E3C9A8", textShadow: "0 1px 1px rgba(0,0,0,0.8)" }}
            >
              Exclusive Collection
            </span>

            <h2
              className="font-semibold text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight text-white"
              style={{ fontFamily: "'Cinzel', serif", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              The Artisan Tote
            </h2>

            <p className="mb-10 text-sm md:text-base text-white leading-relaxed font-medium" >
              Experience the perfect blend of elegance and functionality. Handcrafted from premium full-grain leather, designed for the modern woman.
            </p>

            <div className="flex">
              <Link
                href="/shop-with-sidebar"
                className="inline-flex items-center justify-center font-medium text-sm px-8 py-3.5 rounded-full transition-all duration-300 shadow-xl"
                style={{ background: "#C4896A", color: "#fff" }}
                onMouseEnter={(e: any) => (e.currentTarget.style.background = "#B37A5E")}
                onMouseLeave={(e: any) => (e.currentTarget.style.background = "#C4896A")}
              >
                Shop The Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Two smaller promo cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Small card 1 */}
          <div className="relative overflow-hidden rounded-2xl group h-[300px] md:h-[350px] shadow-md">
             <Image
                src="/images/brand/promo-2-new.jpg"
                alt="Classic Wallets"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500"></div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                <span className="block text-xs mb-2 tracking-[0.2em] uppercase font-semibold" style={{ color: "#E3C9A8", textShadow: "0 1px 2px #000000ff" }}>
                  Essentials
                </span>
                <h2 className="font-semibold text-2xl lg:text-3xl mb-4 text-white" style={{ fontFamily: "'Cinzel', serif", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                  Classic Wallets
                </h2>
                <Link
                  href="/shop-with-sidebar"
                  className="inline-flex items-center font-bold text-sm transition-colors duration-200"
                  style={{ color: "#E3C9A8", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "#E3C9A8")}
                >
                  Discover More
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
          </div>

          {/* Small card 2 */}
          <div className="relative overflow-hidden rounded-2xl group h-[300px] md:h-[350px] shadow-md">
             <Image
                src="/images/brand/promo-3-new.jpg"
                alt="Dusty Rose Clutch"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500"></div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                <span className="block text-xs mb-2 tracking-[0.2em] uppercase font-semibold" style={{ color: "#E3C9A8", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                  Evening Wear
                </span>
                <h2 className="font-semibold text-2xl lg:text-3xl mb-4 text-white" style={{ fontFamily: "'Cinzel', serif", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                  Dusty Rose Clutch
                </h2>
                <Link
                  href="/shop-with-sidebar"
                  className="inline-flex items-center font-bold text-sm transition-colors duration-200"
                  style={{ color: "#E3C9A8", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "#E3C9A8")}
                >
                  Shop Now
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
