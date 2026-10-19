import ForgotPassword from "@/components/Auth/ForgotPassword";
import React, { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | The Handmade Vendor",
  description: "Recover access to your Atelier patron account",
};

const ForgotPasswordPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#FFFAF5]" />}>
        <ForgotPassword />
      </Suspense>
    </main>
  );
};

export default ForgotPasswordPage;
