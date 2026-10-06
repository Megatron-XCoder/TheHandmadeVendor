"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const Error = () => {
  return (
    <>
      <section className="overflow-hidden py-24 sm:py-32" style={{ background: "#FFFAF5", minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div 
            className="rounded-3xl px-6 py-14 sm:py-20 lg:py-24 text-center max-w-[750px] mx-auto relative overflow-hidden"
            style={{ background: "#FEF5EC", border: "1px solid #E3C9A8", boxShadow: "0px 10px 40px rgba(227,201,168,0.3)" }}
          >
            {/* Decorative BG element */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/images/brand/newsletter-bg.jpg')", backgroundSize: "cover" }}></div>

            <div className="relative z-10 text-center">
              <h1 
                className="font-bold text-[80px] sm:text-[120px] leading-none mb-4" 
                style={{ color: "#C4896A", fontFamily: "'Cinzel', serif", textShadow: "4px 4px 0px rgba(227,201,168,0.5)" }}
              >
                404
              </h1>

              <h2 className="font-bold text-2xl sm:text-3xl mb-4 tracking-wide uppercase" style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}>
                Page Not Found
              </h2>

              <p className="max-w-[480px] w-full mx-auto mb-10 text-sm sm:text-base" style={{ color: "#7A6B5D" }}>
                We're sorry, but the page you are looking for has either been moved, deleted, or never existed in our collection.
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 font-medium text-sm text-white px-8 py-3.5 rounded-full transition-all duration-300 shadow-sm mx-auto"
                style={{ background: "#C4896A" }}
                onMouseEnter={(e: any) => (e.currentTarget.style.background = "#B37A5E")}
                onMouseLeave={(e: any) => (e.currentTarget.style.background = "#C4896A")}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15.8333 10H4.16667M4.16667 10L10 15.8333M4.16667 10L10 4.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Error;
