import React from "react";
import { Testimonial } from "@/types/testimonial";
import Image from "next/image";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div 
      className="bg-white rounded-2xl p-8 h-full flex flex-col transition-shadow duration-300 hover:shadow-lg"
      style={{ border: "1px solid rgba(227, 201, 168, 0.3)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
    >
      <div className="flex items-center gap-1.5 mb-6">
        {[...Array(5)].map((_, index) => (
          <svg key={index} width="16" height="16" viewBox="0 0 24 24" fill="#ECA221" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        ))}
      </div>

      <p className="mb-8 leading-relaxed text-base flex-grow" style={{ color: "#3D2B1F" }}>
        "{testimonial.review}"
      </p>

      <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[#C4896A]">
        <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
          <Image
            src={testimonial.authorImg}
            alt={testimonial.authorName}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h3 className="font-semibold text-lg tracking-wide" style={{ color: "#3D2B1F" }}>{testimonial.authorName}</h3>
          <p className="text-sm" style={{ color: "#7A6B5D" }}>{testimonial.authorRole}</p>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
