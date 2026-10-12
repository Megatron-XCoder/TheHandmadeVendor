"use client";
import React from "react";
import { Testimonial } from "@/types/testimonial";
import ReviewCard from "@/components/Common/ReviewCard";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <ReviewCard
      review={{
        author: testimonial.authorName,
        comment: testimonial.review,
        role: testimonial.authorRole,
        authorImg: testimonial.authorImg,
        rating: 5,
        date: "Verified Patron",
        verified: true,
      }}
      className="h-full"
    />
  );
};

export default SingleItem;
