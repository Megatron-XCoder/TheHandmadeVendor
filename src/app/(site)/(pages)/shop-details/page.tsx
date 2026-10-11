import React, { Suspense } from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier Heirlooms & Bespoke Details | The Handmade Vendor",
  description:
    "Explore individual craftsmanship, rare materials, master artisan techniques, and collector reviews for bespoke heirlooms from The Handmade Vendor.",
};

const ShopDetailsPage = () => {
  return (
    <main>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#FFFAF5]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#C4896A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-widest text-[#7A6B5D] font-medium">
                Unveiling Atelier Creation...
              </p>
            </div>
          </div>
        }
      >
        <ShopDetails />
      </Suspense>
    </main>
  );
};

export default ShopDetailsPage;
