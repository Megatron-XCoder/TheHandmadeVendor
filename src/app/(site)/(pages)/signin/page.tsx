import Signin from "@/components/Auth/Signin";
import React, { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | The Handmade Vendor",
  description: "Sign in to your patron account",
};

const SigninPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#FFFAF5]" />}>
        <Signin />
      </Suspense>
    </main>
  );
};

export default SigninPage;
