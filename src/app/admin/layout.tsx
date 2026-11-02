import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier Administration | The Handmade Vendor",
  description: "Curator Sanctuary & Administrative Management Console",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFFAF5] text-[#3D2B1F] antialiased selection:bg-[#E3C9A8]/40 selection:text-[#3D2B1F]">
      {children}
    </div>
  );
}

