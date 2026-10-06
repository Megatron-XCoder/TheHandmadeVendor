"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useCallback, useRef } from "react";
import testimonialsData from "./testimonialsData";

import "swiper/css";
import SingleItem from "./SingleItem";

const Testimonials = () => {
  const sliderRef = useRef(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    (sliderRef.current as any).swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    (sliderRef.current as any).swiper.slideNext();
  }, []);

  return (
    <section className="overflow-hidden py-16 lg:py-24" style={{ background: "#FFFAF5" }}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col items-center text-center mb-16">
          <span
            className="block font-medium mb-3 text-sm uppercase tracking-[0.2em]"
            style={{ color: "#C4896A" }}
          >
             Stories
          </span>
          <h2
            className="font-semibold text-3xl md:text-4xl lg:text-5xl mb-10"
            style={{ color: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
          >
            Words From Our Clients
          </h2>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrev}
              className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-sm"
              style={{ border: "1px solid #3D2B1F", color: "#3D2B1F", background: "#FFFAF5" }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = "#C4896A";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#C4896A";
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = "#FFFAF5";
                e.currentTarget.style.color = "#3D2B1F";
                e.currentTarget.style.borderColor = "#3D2B1F";
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-sm"
              style={{ border: "1px solid #3D2B1F", color: "#3D2B1F", background: "#FFFAF5" }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = "#C4896A";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#C4896A";
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = "#FFFAF5";
                e.currentTarget.style.color = "#3D2B1F";
                e.currentTarget.style.borderColor = "#3D2B1F";
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="swiper testimonial-carousel">
          <Swiper
            ref={sliderRef}
            modules={[Autoplay]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            slidesPerView={3}
            spaceBetween={30}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonialsData.map((item, key) => (
              <SwiperSlide key={key} className="py-2">
                <SingleItem testimonial={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
