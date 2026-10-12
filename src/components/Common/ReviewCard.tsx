"use client";
import React from "react";
import Image from "next/image";

export interface ReviewCardData {
  id?: number | string;
  author: string;
  role?: string;
  location?: string;
  place?: string;
  rating?: number;
  date?: string;
  comment?: string;
  review?: string;
  verified?: boolean;
  authorImg?: string;
}

interface ReviewCardProps {
  review: ReviewCardData;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, className = "" }) => {
  const authorName = review.author || "Anonymous Patron";
  const initials = authorName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "VP";

  const ratingCount = review.rating ?? 5;
  const reviewText = review.comment || review.review || "";
  const subtitle = review.place || review.location || review.role || "Verified Patron";
  const isVerified = review.verified !== false;

  return (
    <div
      className={`bg-white/95 rounded-2xl p-6 sm:p-7 border border-[#E3C9A8]/50 hover:border-[#C4896A]/80 shadow-[0_4px_20px_rgba(61,43,31,0.04)] hover:shadow-[0_8px_30px_rgba(196,137,106,0.12)] transition-all duration-300 flex flex-col justify-between h-full group ${className}`}
    >
      <div>
        {/* Top row: stars + date */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-0.5">
            {[...Array(ratingCount)].map((_, i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#C4896A">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          {review.date && (
            <span className="text-[10px] uppercase tracking-wider text-[#A8988A] font-medium">
              {review.date}
            </span>
          )}
        </div>

        {/* Review body */}
        <p className="text-[13px] sm:text-[13.5px] leading-[1.75] text-[#4A3B30] font-light mb-6 italic">
          &ldquo;{reviewText}&rdquo;
        </p>
      </div>

      {/* Author footer */}
      <div className="pt-4 border-t border-[#EDE4D8]/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {review.authorImg ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E3C9A8]/60 shrink-0">
              <Image src={review.authorImg} alt={authorName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#FEF5EC] border border-[#E3C9A8]/60 flex items-center justify-center text-[10px] font-bold text-[#C4896A] shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <span
              className="text-xs sm:text-[13px] font-semibold text-[#2A1E17] block truncate leading-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {authorName}
            </span>
            <span className="text-[10px] text-[#8C7B6D] font-light block truncate">
              {subtitle}
            </span>
          </div>
        </div>

        {isVerified && (
          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-[#C4896A] bg-[#FDF0E6] px-2.5 py-1 rounded-full shrink-0">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#C4896A" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Verified
          </span>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
