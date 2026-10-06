import { Category } from "@/types/category";
import React from "react";
import Image from "next/image";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <a href="#" className="group flex flex-col items-center">
      <div 
        className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] rounded-full flex items-center justify-center mb-5 relative transition-all duration-500 group-hover:shadow-[0_10px_40px_rgba(196,137,106,0.25)] overflow-hidden"
        style={{ border: "2px solid #E3C9A8", background: "#FFFAF5" }}
      >
        <div className="absolute inset-2 rounded-full border-2 border-dashed z-20 opacity-80 transition-all duration-700 group-hover:rotate-[45deg] pointer-events-none" style={{ borderColor: "#C4896A" }}></div>
        <div className="w-full h-full relative rounded-full z-10 transition-transform duration-700">
          <Image src={item.img} alt={item.title} fill className="object-cover" />
        </div>
      </div>

      <div className="flex justify-center">
        <h3 
          className="inline-block font-medium text-center transition-colors duration-300 uppercase tracking-[0.15em] text-xs"
          style={{ color: "#3D2B1F" }}
        >
          <span className="relative pb-1 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[1px] after:bg-[#C4896A] after:transition-all after:duration-500 group-hover:after:w-full group-hover:text-[#C4896A]">
            {item.title}
          </span>
        </h3>
      </div>
    </a>
  );
};

export default SingleItem;
