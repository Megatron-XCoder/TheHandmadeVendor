"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const CounDown = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const deadline = "December, 31, 2026";

  const getTime = () => {
    const time = Date.parse(deadline) - Date.now();

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="overflow-hidden py-16 lg:py-20" style={{ background: "#FFFAF5" }}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div
          className="relative overflow-hidden z-1 rounded-2xl p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between"
          style={{ background: "linear-gradient(135deg, #F5E6D3 0%, #E3C9A8 100%)", border: "1px solid #E3C9A8" }}
        >
          <div className="w-full md:w-1/2 z-10">
            <span
              className="block font-medium text-sm mb-3 tracking-widest uppercase"
              style={{ color: "#3D2B1F" }}
            >
              Limited Time Offer
            </span>

            <h2
              className="font-bold text-2xl lg:text-3xl xl:text-4xl mb-4"
              style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
            >
              Holiday Collection Preview
            </h2>

            <p className="mb-8" style={{ color: "#5A4A3D", maxWidth: "400px" }}>
              Be the first to access our exclusive holiday releases. Early access ends soon.
            </p>

            {/* Countdown timer */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 mb-8">
              {[
                { label: "Days", value: days },
                { label: "Hours", value: hours },
                { label: "Minutes", value: minutes },
                { label: "Seconds", value: seconds },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span
                    className="w-14 h-14 sm:w-16 sm:h-16 font-semibold text-xl sm:text-2xl rounded-xl flex items-center justify-center mb-2 shadow-sm"
                    style={{ background: "#FFFAF5", color: "#3D2B1F", border: "1px solid #E3C9A8" }}
                  >
                    {item.value < 10 ? "0" + item.value : item.value}
                  </span>
                  <span className="text-xs uppercase tracking-wider" style={{ color: "#5A4A3D" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/shop-with-sidebar"
              className="inline-flex items-center gap-2 font-medium text-sm text-white px-8 py-3.5 rounded-full transition-all duration-300 shadow-sm"
              style={{ background: "#3D2B1F" }}
              onMouseEnter={(e: any) => (e.currentTarget.style.background = "#2A1D15")}
              onMouseLeave={(e: any) => (e.currentTarget.style.background = "#3D2B1F")}
            >
              Preview Collection
            </Link>
          </div>

          <div className="w-full md:w-1/2 mt-10 md:mt-0 relative h-[300px] md:h-[400px] z-0 hidden sm:block">
            <Image
              src="/images/brand/promo-clutch.jpg"
              alt="Holiday Collection"
              fill
              className="object-cover rounded-xl shadow-lg"
              style={{ transform: "rotate(2deg)" }}
            />
            <div className="absolute inset-0 bg-white/20 rounded-xl" style={{ transform: "rotate(-4deg)", zIndex: -1 }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounDown;
