"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { showToast } from "@/utils/toast";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    rePassword: "",
    agreeTerms: false,
  });

  const [step, setStep] = useState<"FORM" | "VERIFY">("FORM");
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(60);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 5-minute countdown timer effect
  useEffect(() => {
    if (step !== "VERIFY") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Resend cooldown timer effect
  useEffect(() => {
    if (step !== "VERIFY" || resendCooldown <= 0) return;

    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(cooldownTimer);
  }, [step, resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "password" || name === "rePassword") {
      setPasswordError("");
    }
  };

  const handleSendCode = async () => {
    if (!formData.firstName.trim()) {
      showToast.error("Please enter your first name.");
      return;
    }
    if (!formData.email.trim()) {
      showToast.error("Please enter your email address.");
      return;
    }
    if (formData.password !== formData.rePassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (!formData.agreeTerms) {
      showToast.error("Please agree to the Terms of Service.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }

      showToast.success("Verification code dispatched to your email!");
      setTimeLeft(300); // Reset to 5 mins
      setResendCooldown(60);
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setStep("VERIFY");
    } catch (err: any) {
      showToast.error(err.message || "Could not dispatch verification code.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      showToast.error("Please enter your 6-digit verification code.");
      return;
    }
    if (timeLeft <= 0) {
      showToast.error("Verification code has expired. Please request a new code.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          code: verificationCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      showToast.success("Welcome to The Handmade Vendor Atelier!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      showToast.error(err.message || "Invalid or expired code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      showToast.error(err.message || "Failed to connect to Google.");
      setIsGoogleLoading(false);
    }
  };

  // Format mm:ss for countdown
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <section
        className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 min-h-[calc(100vh-80px)] flex items-center justify-center"
        style={{ background: "#FFFAF5" }}
      >
        <div className="max-w-[1120px] w-full mx-auto px-4 sm:px-6 xl:px-0">
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
              className="lg:w-[42%] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white"
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
                  Join the Circle of Connoisseurs
                </h1>
                <p className="text-xs sm:text-sm leading-relaxed text-[#D2C5B8]">
                  Create an account to gain bespoke access to limited-edition artisanal leather goods, fine handcrafted jewelry, and curated collector privileges.
                </p>
              </div>

              {/* Membership Privileges */}
              <div className="relative z-10 space-y-4 mb-8 sm:mb-12 border-t border-b border-[#E3C9A8]/20 py-6">
                <div className="flex items-start gap-3">
                  <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                  <p className="text-xs text-[#E9DFD5] leading-relaxed">
                    <strong className="text-white block font-medium">Bespoke Custom Embossing</strong>
                    Complimentary artisan monogramming on all signature leather acquisitions.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                  <p className="text-xs text-[#E9DFD5] leading-relaxed">
                    <strong className="text-white block font-medium">Secret Vault Drops</strong>
                    Invitations to exclusive archive releases and rare one-of-a-kind designs.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                  <p className="text-xs text-[#E9DFD5] leading-relaxed">
                    <strong className="text-white block font-medium">White-Glove Delivery</strong>
                    Priority processing with luxury presentation packaging included.
                  </p>
                </div>
              </div>

              {/* Footer Quote */}
              <div className="relative z-10 text-[11px] text-[#A8988B] tracking-wider uppercase">
                Handcrafted with Pride  •  Worldwide Heritage
              </div>
            </div>

            {/* ── RIGHT COLUMN: Registration or Verification ─────────────────── */}
            <div className="lg:w-[58%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#FFFFFF]">
              {step === "FORM" ? (
                <>
                  <div className="mb-7">
                    <h2
                      className="text-xl sm:text-2xl font-semibold tracking-[0.1em] uppercase mb-2"
                      style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
                    >
                      Create an Account
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7A6B5D]">
                      Complete your details below to begin your handcrafted luxury experience.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendCode();
                    }}
                    className="space-y-4 sm:space-y-4.5"
                  >
                    {/* Row 1: First Name & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                        >
                          First Name <span className="text-[#C4896A]">*</span>
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="e.g. Alexander"
                          className="w-full rounded-xl border px-4 py-2.5 sm:py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                          style={{ background: "#FFFAF5", borderColor: "#E3C9A8" }}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                        >
                          Last Name <span className="text-[#C4896A]">*</span>
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="e.g. Sterling"
                          className="w-full rounded-xl border px-4 py-2.5 sm:py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                          style={{ background: "#FFFAF5", borderColor: "#E3C9A8" }}
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                        >
                          Phone Number <span className="text-[#C4896A]">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 019-2834"
                          className="w-full rounded-xl border px-4 py-2.5 sm:py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                          style={{ background: "#FFFAF5", borderColor: "#E3C9A8" }}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                        >
                          Email Address <span className="text-[#C4896A]">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="alexander@domain.com"
                          className="w-full rounded-xl border px-4 py-2.5 sm:py-3 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                          style={{ background: "#FFFAF5", borderColor: "#E3C9A8" }}
                        />
                      </div>
                    </div>

                    {/* Row 3: Password & Re-Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                        >
                          Password <span className="text-[#C4896A]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 8 characters"
                            className="w-full rounded-xl border px-4 py-2.5 sm:py-3 pr-10 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                            style={{ background: "#FFFAF5", borderColor: "#E3C9A8" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09082] hover:text-[#C4896A] transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {showPassword ? (
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              ) : (
                                <>
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </>
                              )}
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="rePassword"
                          className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                        >
                          Re-Password <span className="text-[#C4896A]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRePassword ? "text" : "password"}
                            id="rePassword"
                            name="rePassword"
                            required
                            value={formData.rePassword}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                            className="w-full rounded-xl border px-4 py-2.5 sm:py-3 pr-10 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                            style={{ background: "#FFFAF5", borderColor: "#E3C9A8" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRePassword(!showRePassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09082] hover:text-[#C4896A] transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {showRePassword ? (
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              ) : (
                                <>
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </>
                              )}
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {passwordError && (
                      <p className="text-xs text-red-500 font-medium">{passwordError}</p>
                    )}

                    {/* Agree Terms */}
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="mt-0.5 w-4 h-4 rounded border-[#E3C9A8] text-[#C4896A] focus:ring-[#C4896A]/20 accent-[#C4896A]"
                      />
                      <label htmlFor="agreeTerms" className="text-xs text-[#7A6B5D] leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <Link href="#" className="text-[#C4896A] hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-[#C4896A] hover:underline">
                          Privacy Policy
                        </Link>.
                      </label>
                    </div>

                    {/* Submit CTA */}
                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl mt-3 flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
                      onMouseEnter={(e) => {
                        if (!isSending) (e.currentTarget as HTMLElement).style.background = "#C4896A";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSending) (e.currentTarget as HTMLElement).style.background = "#3D2B1F";
                      }}
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Dispatching Verification Code...</span>
                        </>
                      ) : (
                        <span>Create Your Account</span>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-5 text-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E3C9A8]/50" />
                      </div>
                      <span className="relative px-4 text-[11px] font-medium tracking-wider uppercase text-[#A09082] bg-white">
                        Or Sign Up With
                      </span>
                    </div>

                    {/* Google Sign Up */}
                    <button
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={isGoogleLoading}
                      className="w-full flex items-center justify-center gap-3 py-2.5 sm:py-3 px-6 rounded-full border text-xs sm:text-sm font-medium tracking-wide text-[#3D2B1F] hover:bg-[#FEF5EC] transition-all duration-300 disabled:opacity-60"
                      style={{ borderColor: "#E3C9A8" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.12C3.26 21.44 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.13z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.56 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                      </svg>
                      <span>{isGoogleLoading ? "Connecting to Google..." : "Sign Up with Google"}</span>
                    </button>
                  </form>

                  {/* Footer Switch to Sign In */}
                  <div className="mt-7 text-center text-xs sm:text-sm text-[#7A6B5D]">
                    <span>Already an esteemed member? </span>
                    <Link href="/signin" className="font-semibold text-[#C4896A] hover:underline ml-1">
                      Sign In
                    </Link>
                  </div>
                </>
              ) : (
                /* ── STEP 2: VERIFICATION SCREEN ───────────────────────────── */
                <div className="py-2">
                  <div className="mb-6 text-center">
                    <div
                      className="w-14 h-14 mx-auto rounded-full flex items-center justify-center border mb-4 text-[#C4896A]"
                      style={{ background: "#FEF5EC", borderColor: "#E3C9A8" }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>

                    <h2
                      className="text-xl sm:text-2xl font-semibold tracking-[0.08em] uppercase mb-2"
                      style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
                    >
                      Verify Your Email
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-sm mx-auto leading-relaxed">
                      We have dispatched a private verification code to:
                      <br />
                      <strong className="text-[#3D2B1F] font-semibold">{formData.email}</strong>
                    </p>
                  </div>

                  {/* 5-minute Live Countdown Badge */}
                  <div className="flex justify-center mb-6">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider border ${
                        timeLeft <= 60
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-[#FEF5EC] text-[#C4896A] border-[#E3C9A8]"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>
                        {timeLeft > 0 ? `Code expires in: ${formatTime(timeLeft)}` : "Code has expired"}
                      </span>
                    </div>
                  </div>

                  {/* Development mode code pill */}
                  {devCode && (
                    <div
                      onClick={() => setVerificationCode(devCode)}
                      className="mb-6 p-3 rounded-xl border border-dashed border-[#C4896A] bg-[#FFFAF5] text-center cursor-pointer transition-colors hover:bg-[#FEF5EC]"
                    >
                      <span className="text-[11px] text-[#A09082] block mb-0.5 uppercase tracking-wider">
                        Development Helper (Click to autofill)
                      </span>
                      <span className="text-base font-bold text-[#3D2B1F] tracking-[0.2em] font-mono">
                        {devCode}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyCode} className="space-y-5">
                    <div>
                      <label
                        htmlFor="verificationCode"
                        className="block text-center text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-2"
                      >
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        name="verificationCode"
                        required
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="w-full text-center text-2xl tracking-[0.4em] font-bold py-3.5 px-4 rounded-xl border text-[#3D2B1F] placeholder:text-[#D2C5B8] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300 font-mono"
                        style={{ background: "#FFFAF5", borderColor: "#E3C9A8" }}
                      />
                    </div>

                    {/* Verify CTA */}
                    <button
                      type="submit"
                      disabled={isVerifying || timeLeft <= 0}
                      className="w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: "#3D2B1F", fontFamily: "'Cinzel', serif" }}
                      onMouseEnter={(e) => {
                        if (!isVerifying && timeLeft > 0)
                          (e.currentTarget as HTMLElement).style.background = "#C4896A";
                      }}
                      onMouseLeave={(e) => {
                        if (!isVerifying && timeLeft > 0)
                          (e.currentTarget as HTMLElement).style.background = "#3D2B1F";
                      }}
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying & Creating Account...</span>
                        </>
                      ) : (
                        <span>Verify & Activate Account</span>
                      )}
                    </button>

                    {/* Resend & Back buttons */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setStep("FORM")}
                        className="text-[#7A6B5D] hover:text-[#3D2B1F] transition-colors flex items-center gap-1"
                      >
                        ← Edit Info
                      </button>

                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isSending}
                        onClick={handleSendCode}
                        className="text-[#C4896A] hover:underline disabled:text-[#A09082] disabled:no-underline font-medium transition-colors"
                      >
                        {resendCooldown > 0
                          ? `Resend Code in ${resendCooldown}s`
                          : "Resend Code"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
