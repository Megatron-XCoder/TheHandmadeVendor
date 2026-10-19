import ResetPassword from "@/components/Auth/ResetPassword";
import React, { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | The Handmade Vendor",
  description: "Set new password for your Atelier patron account",
};

const ResetPasswordPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#FFFAF5]" />}>
        <ResetPassword />
      </Suspense>
    </main>
  );
};

export default ResetPasswordPage;
