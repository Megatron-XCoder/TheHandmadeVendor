import React, { Suspense } from "react";
import Shop from "@/components/Shop";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Artisanal Heirlooms & Bespoke Creations | The Handmade Vendor",
  description:
    "Explore masterfully handcrafted leather goods, 18k fine jewelry, Horology mechanical timepieces, and heritage textiles from generational artisans worldwide.",
  openGraph: {
    title: "Shop Artisanal Heirlooms | The Handmade Vendor",
    description:
      "Handcrafted treasures, master-burnished leather satchels, fine jewelry, and bespoke timepieces from generational artisans.",
  },
};

const ShopPage = () => {
  return (
    <main>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#FFFAF5]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#C4896A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-widest text-[#7A6B5D] font-medium">
                Curating Atelier Heirlooms...
              </p>
            </div>
          </div>
        }
      >
        <Shop />
      </Suspense>
    </main>
  );
};

export default ShopPage;
