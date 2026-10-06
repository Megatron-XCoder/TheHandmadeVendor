"use client";
import React from "react";
import Image from "next/image";

const Newsletter = () => {
  return (
    <section className="overflow-hidden py-10" style={{ background: "#FFFAF5" }}>
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div
          className="relative z-1 overflow-hidden rounded-2xl shadow-lg"
          style={{ background: "#3D2B1F" }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
            <Image
              src="/images/brand/newsletter-bg.jpg"
              alt="Background texture"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 px-8 sm:px-12 xl:pl-16 xl:pr-20 py-16">
            <div className="max-w-[500px] w-full text-center lg:text-left">
              <span
                className="block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
                style={{ color: "#E3C9A8" }}
              >
                Join The Club
              </span>
              <h2
                className="text-white font-bold text-2xl sm:text-3xl xl:text-4xl mb-4"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Exclusive Offers & Early Access
              </h2>
              <p style={{ color: "#E3C9A8", opacity: 0.9 }}>
                Subscribe to our newsletter and receive 10% off your first purchase.
              </p>
            </div>

            <div className="max-w-[480px] w-full mx-auto lg:mx-0">
              <form>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email address"
                    className="w-full bg-white/10 border outline-none rounded-full placeholder:text-white/60 py-3.5 px-6 text-white backdrop-blur-sm transition-colors duration-300 focus:bg-white/20 focus:border-[#C4896A]"
                    style={{ borderColor: "rgba(227, 201, 168, 0.3)" }}
                  />
                  <button
                    type="submit"
                    className="inline-flex justify-center items-center py-3.5 px-8 font-medium rounded-full transition-all duration-300 shadow-md whitespace-nowrap"
                    style={{ background: "#C4896A", color: "#fff" }}
                    onMouseEnter={(e: any) => (e.currentTarget.style.background = "#B37A5E")}
                    onMouseLeave={(e: any) => (e.currentTarget.style.background = "#C4896A")}
                  >
                    Subscribe
                  </button>
                </div>
                <p className="text-xs mt-3 text-center sm:text-left" style={{ color: "rgba(227, 201, 168, 0.6)" }}>
                  By subscribing, you agree to our Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
