"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { useCallback, useRef, useEffect } from "react";
import data from "./categoryData";
import Image from "next/image";

import "swiper/css/navigation";
import "swiper/css";
import SingleItem from "./SingleItem";

const Categories = () => {
  const sliderRef = useRef(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    (sliderRef.current as any).swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    (sliderRef.current as any).swiper.slideNext();
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      (sliderRef.current as any).swiper.init();
    }
  }, []);

  return (
    <section className="overflow-hidden pt-16 lg:pt-20" style={{ background: "#FFFAF5" }}>
      <div
        className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-16"
        style={{ borderBottom: "1px solid #E3C9A8" }}
      >
        <div className="swiper categories-carousel common-carousel">
          {/* Section title */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span
                className="flex items-center gap-2.5 font-medium mb-1.5 text-sm"
                style={{ color: "#C4896A" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7L12 3L4 7M20 7V17L12 21M20 7L12 11M12 21L4 17V7M12 21V11M4 7L12 11" stroke="#C4896A" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                Shop by Category
              </span>
              <h2
                className="font-semibold text-xl xl:text-2xl"
                style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
              >
                Browse Our Collections
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrev}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                style={{ border: "1px solid #E3C9A8", color: "#C4896A", background: "#fff" }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.background = "#C4896A";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "#C4896A";
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#C4896A";
                  e.currentTarget.style.borderColor = "#E3C9A8";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                style={{ border: "1px solid #E3C9A8", color: "#C4896A", background: "#fff" }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.background = "#C4896A";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "#C4896A";
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#C4896A";
                  e.currentTarget.style.borderColor = "#E3C9A8";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={6}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay, Navigation]}
            breakpoints={{
              0: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              1000: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
            }}
          >
            {data.map((item, key) => (
              <SwiperSlide key={key}>
                <SingleItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Categories;
