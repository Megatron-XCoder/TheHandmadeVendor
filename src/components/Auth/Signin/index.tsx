"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { showToast } from "@/utils/toast";

const Signin = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        showToast.error(error.message);
        setIsLoading(false);
        return;
      }

      showToast.success("Welcome back to the Atelier!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      showToast.error(err.message || "Failed to sign in.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        showToast.error(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      showToast.error(err.message || "Failed to initialize Google login.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <section className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 min-h-[calc(100vh-80px)] flex items-center justify-center" style={{ background: "#FFFAF5" }}>
        <div className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          {/* Two-Column Card Container */}
          <div
            className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border flex flex-col lg:flex-row"
            style={{
              borderColor: "#E3C9A8",
              background: "#FFFFFF",
              boxShadow: "0 8px 30px rgba(61,43,31,0.06), 0 1px 3px rgba(61,43,31,0.03)",
            }}
          >
            {/* ── LEFT COLUMN: Brand Story & Luxury Panel ────────────────── */}
            <div
              className="lg:w-[45%] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white"
              style={{
                background: "linear-gradient(155deg, #1F150E 0%, #35241A 45%, #4A3324 100%)",
              }}
            >
              {/* Subtle background ambient tone */}
              <div
                className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none opacity-[0.2]"
                style={{ background: "radial-gradient(circle, #C4896A 0%, transparent 70%)" }}
              />
              <div
                className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none opacity-[0.2]"
                style={{ background: "radial-gradient(circle, #E3C9A8 0%, transparent 70%)" }}
              />

              {/* Brand Header */}
              <div className="relative z-10 mb-8 sm:mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 border p-0.5 bg-white shadow-sm"
                    style={{ borderColor: "#E3C9A8" }}
                  >
                    <Image
                      src="/images/logo/logo.png"
                      alt="The Handmade Vendor"
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight">
                    <span
                      className="text-sm sm:text-base font-semibold tracking-[0.12em] uppercase text-white whitespace-nowrap"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      The Handmade
                    </span>
                    <span
                      className="text-xs sm:text-base font-semibold tracking-[0.12em] uppercase whitespace-nowrap"
                      style={{ fontFamily: "'Cinzel', serif", color: "#C4896A" }}
                    >
                      Vendor
                    </span>
                  </div>
                </div>

                <h1
                  className="text-2xl sm:text-3xl font-medium tracking-wide leading-tight mb-4 text-[#FFFAF5]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Welcome Back to the Atelier
                </h1>
                <p className="text-xs sm:text-sm leading-relaxed text-[#D2C5B8]">
                  Step back into your private collection. Explore our latest mastercraft creations, monitor your bespoke orders, and enjoy tailored concierge privileges.
                </p>
              </div>

              {/* Luxury Privileges */}
              <div className="relative z-10 space-y-4 mb-8 sm:mb-12 border-t border-b border-[#E3C9A8]/20 py-6">
                <div className="flex items-start gap-3">
                  <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                  <p className="text-xs text-[#E9DFD5] leading-relaxed">
                    <strong className="text-white block font-medium">Bespoke Concierge</strong>
                    Dedicated artisan care and tailored assistance for your collection.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                  <p className="text-xs text-[#E9DFD5] leading-relaxed">
                    <strong className="text-white block font-medium">Private Capsule Access</strong>
                    Early reservations for rare, numbered edition handcrafted releases.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                  <p className="text-xs text-[#E9DFD5] leading-relaxed">
                    <strong className="text-white block font-medium">Complimentary Care</strong>
                    Lifetime maintenance consultation on all artisan leatherworks.
                  </p>
                </div>
              </div>

              {/* Footer Quote */}
              <div className="relative z-10 text-[11px] text-[#A8988B] tracking-wider uppercase">
                Artisan Mastery  •  Since 2018
              </div>
            </div>

            {/* ── RIGHT COLUMN: Sign In Form ─────────────────────────────── */}
            <div className="lg:w-[55%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#FFFFFF]">
              <div className="mb-8">
                <h2
                  className="text-xl sm:text-2xl font-semibold tracking-[0.1em] uppercase mb-2"
                  style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
                >
                  Sign In
                </h2>
                <p className="text-xs sm:text-sm text-[#7A6B5D]">
                  Please enter your credentials below to access your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border px-4 py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        background: "#FFFAF5",
                        borderColor: "#E3C9A8",
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase"
                    >
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs text-[#C4896A] hover:underline transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border px-4 py-3 pr-11 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        background: "#FFFAF5",
                        borderColor: "#E3C9A8",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A09082] hover:text-[#C4896A] transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-[#7A6B5D]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E3C9A8] text-[#C4896A] focus:ring-[#C4896A]/20 accent-[#C4896A]"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{
                    background: "#3D2B1F",
                    fontFamily: "'Cinzel', serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) (e.currentTarget as HTMLElement).style.background = "#C4896A";
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) (e.currentTarget as HTMLElement).style.background = "#3D2B1F";
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In to Account</span>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E3C9A8]/50" />
                  </div>
                  <span className="relative px-4 text-[11px] font-medium tracking-wider uppercase text-[#A09082] bg-white">
                    Or Sign In With
                  </span>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full border text-xs sm:text-sm font-medium tracking-wide text-[#3D2B1F] hover:bg-[#FEF5EC] transition-all duration-300 disabled:opacity-60"
                  style={{ borderColor: "#E3C9A8" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.12C3.26 21.44 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.56 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
                </button>
              </form>

              {/* Footer Switch to Sign Up */}
              <div className="mt-8 text-center text-xs sm:text-sm text-[#7A6B5D]">
                <span>Don&apos;t have an account yet? </span>
                <Link
                  href="/signup"
                  className="font-semibold text-[#C4896A] hover:underline ml-1"
                >
                  Create an Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
