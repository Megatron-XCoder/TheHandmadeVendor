"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { showToast } from "@/utils/toast";

const ForgotPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [view, setView] = useState<"REQUEST" | "SENT" | "RESET">("REQUEST");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 6-digit recovery OTP code
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Password reset fields
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const isMatching = rePassword ? newPassword === rePassword : null;

  // Check for error in query params
  useEffect(() => {
    const errorFromUrl = searchParams.get("error");
    if (errorFromUrl) {
      showToast.error(errorFromUrl);
    }
  }, [searchParams]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast.error("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch recovery code.");
      }

      showToast.success("6-digit recovery code dispatched to your email!");
      setView("SENT");
      setResendCooldown(60);
    } catch (err: any) {
      showToast.error(
        err.message || "Failed to dispatch password recovery instructions."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      showToast.error("Please enter the complete 6-digit recovery code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid recovery code.");
      }

      showToast.success("Recovery code verified! Enter your new password.");
      setView("RESET");
    } catch (err: any) {
      showToast.error(err.message || "Invalid or expired recovery code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast.error("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== rePassword) {
      showToast.error("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      showToast.success("Password updated successfully! Welcome back.");

      // Attempt immediate sign-in with newly configured password
      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: newPassword,
        });
        router.push("/my-account");
        router.refresh();
      } catch (signInErr) {
        // Fallback to signin page
        router.push("/signin");
      }
    } catch (err: any) {
      showToast.error(err.message || "An unexpected error occurred.");
      setIsUpdatingPassword(false);
    }
  };

  return (
    <section
      className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 min-h-[calc(100vh-80px)] flex items-center justify-center"
      style={{ background: "#FFFAF5" }}
    >
      <div className="max-w-[1080px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        <div
          className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border flex flex-col lg:flex-row"
          style={{
            borderColor: "#E3C9A8",
            background: "#FFFFFF",
            boxShadow:
              "0 8px 30px rgba(61,43,31,0.06), 0 1px 3px rgba(61,43,31,0.03)",
          }}
        >
          {/* ── LEFT COLUMN: Brand Story & Luxury Panel ────────────────── */}
          <div
            className="lg:w-[45%] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white"
            style={{
              background:
                "linear-gradient(155deg, #1F150E 0%, #35241A 45%, #4A3324 100%)",
            }}
          >
            <div
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none opacity-[0.2]"
              style={{
                background: "radial-gradient(circle, #C4896A 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none opacity-[0.2]"
              style={{
                background: "radial-gradient(circle, #E3C9A8 0%, transparent 70%)",
              }}
            />

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
                Patron Credential Recovery
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed text-[#D2C5B8]">
                Safeguard and restore seamless access to your personal Atelier
                collection, active bespoke commissions, and concierge privileges.
              </p>
            </div>

            <div className="relative z-10 space-y-4 mb-8 sm:mb-12 border-t border-b border-[#E3C9A8]/20 py-6">
              <div className="flex items-start gap-3">
                <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                <p className="text-xs text-[#E9DFD5] leading-relaxed">
                  <strong className="text-white block font-medium">
                    Cryptographic 6-Digit OTP Protection
                  </strong>
                  Secure single-use verification codes guarantee direct patron
                  authentication.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                <p className="text-xs text-[#E9DFD5] leading-relaxed">
                  <strong className="text-white block font-medium">
                    Preserved Curation & Vault
                  </strong>
                  Your saved masterpieces, custom commissions, and saved addresses
                  remain completely intact.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                <p className="text-xs text-[#E9DFD5] leading-relaxed">
                  <strong className="text-white block font-medium">
                    Priority Concierge Assistance
                  </strong>
                  Our dedicated artisan team is at your disposal if you require
                  personalized recovery support.
                </p>
              </div>
            </div>

            <div className="relative z-10 text-[11px] text-[#A8988B] tracking-wider uppercase">
              Artisan Mastery • Since 2018
            </div>
          </div>

          {/* ── RIGHT COLUMN: Interactive Recovery Panel ───────────────── */}
          <div className="lg:w-[55%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#FFFFFF]">
            {view === "REQUEST" && (
              <>
                <div className="mb-8">
                  <h2
                    className="text-xl sm:text-2xl font-semibold tracking-[0.1em] uppercase mb-2"
                    style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
                  >
                    Forgot Password
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6B5D]">
                    Enter your registered email address below. We will dispatch a
                    private 6-digit recovery code to verify your identity.
                  </p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                    >
                      Registered Email Address
                    </label>
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{
                      background: "#3D2B1F",
                      fontFamily: "'Cinzel', serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading)
                        (e.currentTarget as HTMLElement).style.background =
                          "#C4896A";
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading)
                        (e.currentTarget as HTMLElement).style.background =
                          "#3D2B1F";
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Dispatching Recovery Code...</span>
                      </>
                    ) : (
                      <span>Send 6-Digit Recovery Code</span>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#E3C9A8]/40 flex items-center justify-between text-xs sm:text-sm">
                  <Link
                    href="/signin"
                    className="text-[#7A6B5D] hover:text-[#3D2B1F] transition-colors flex items-center gap-1.5"
                  >
                    <span>←</span>
                    <span>Return to Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="font-medium text-[#C4896A] hover:underline"
                  >
                    Create New Account
                  </Link>
                </div>
              </>
            )}

            {view === "SENT" && (
              <div className="py-2">
                <div className="text-center mb-6">
                  <div
                    className="w-14 h-14 mx-auto rounded-full flex items-center justify-center border mb-4 text-[#C4896A]"
                    style={{ background: "#FEF5EC", borderColor: "#E3C9A8" }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>

                  <h2
                    className="text-xl sm:text-2xl font-semibold tracking-[0.08em] uppercase mb-2"
                    style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
                  >
                    Recovery Code Dispatched
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-sm mx-auto leading-relaxed">
                    We have dispatched a private 6-digit recovery code to:
                    <br />
                    <strong className="text-[#3D2B1F] font-semibold">
                      {email}
                    </strong>
                  </p>
                </div>

                {/* Direct 6-Digit OTP Form */}
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label
                      htmlFor="otpCode"
                      className="block text-center text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-2"
                    >
                      Enter 6-Digit Recovery Code
                    </label>
                    <input
                      type="text"
                      id="otpCode"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="••••••"
                      className="w-full text-center font-mono text-2xl tracking-[0.4em] font-bold py-3.5 px-4 rounded-xl border text-[#3D2B1F] placeholder:text-[#D2C5B8] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        background: "#FFFAF5",
                        borderColor: "#E3C9A8",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpCode.length < 6}
                    className="w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: "#3D2B1F",
                      fontFamily: "'Cinzel', serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!isVerifyingOtp)
                        (e.currentTarget as HTMLElement).style.background =
                          "#C4896A";
                    }}
                    onMouseLeave={(e) => {
                      if (!isVerifyingOtp)
                        (e.currentTarget as HTMLElement).style.background =
                          "#3D2B1F";
                    }}
                  >
                    {isVerifyingOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <span>Verify Code & Reset Password</span>
                    )}
                  </button>
                </form>

                {/* Resend & Back controls */}
                <div className="flex items-center justify-between text-xs pt-5 mt-5 border-t border-[#E3C9A8]/40">
                  <button
                    type="button"
                    onClick={() => setView("REQUEST")}
                    className="text-[#7A6B5D] hover:text-[#3D2B1F] transition-colors"
                  >
                    ← Try another email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleRequestReset}
                    className="text-[#C4896A] hover:underline disabled:text-[#A09082] disabled:no-underline font-medium transition-colors"
                  >
                    {resendCooldown > 0
                      ? `Resend Code in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>
              </div>
            )}

            {view === "RESET" && (
              <>
                <div className="mb-7">
                  <h2
                    className="text-xl sm:text-2xl font-semibold tracking-[0.1em] uppercase mb-2"
                    style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
                  >
                    Set New Password
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6B5D]">
                    Choose a strong, memorable password for{" "}
                    <strong className="text-[#3D2B1F]">{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
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
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {showPassword ? (
                            <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          ) : (
                            <>
                              <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showRePassword ? "text" : "password"}
                        id="rePassword"
                        name="rePassword"
                        required
                        value={rePassword}
                        onChange={(e) => setRePassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full rounded-xl border px-4 py-3 pr-11 text-sm text-[#3D2B1F] placeholder:text-[#A09082] focus:bg-white focus:outline-none focus:ring-2 transition-all duration-300"
                        style={{
                          background: "#FFFAF5",
                          borderColor: "#E3C9A8",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRePassword(!showRePassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A09082] hover:text-[#C4896A] transition-colors"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {showRePassword ? (
                            <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          ) : (
                            <>
                              <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>

                    {/* Real-time Match Indicator */}
                    {rePassword ? (
                      <div className="mt-2 flex items-center gap-1.5 text-xs animate-in fade-in duration-200">
                        {isMatching ? (
                          <>
                            <span className="w-4 h-4 rounded-full bg-[#EBF5EC] text-[#4E8752] flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                            <span className="text-[#4E8752] font-medium">
                              Passwords match
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="w-4 h-4 rounded-full bg-[#FEF2F2] text-red-500 flex items-center justify-center text-[10px] font-bold">
                              ✕
                            </span>
                            <span className="text-red-500 font-medium">
                              Passwords do not match yet
                            </span>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl mt-3 flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{
                      background: "#3D2B1F",
                      fontFamily: "'Cinzel', serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpdatingPassword)
                        (e.currentTarget as HTMLElement).style.background =
                          "#C4896A";
                    }}
                    onMouseLeave={(e) => {
                      if (!isUpdatingPassword)
                        (e.currentTarget as HTMLElement).style.background =
                          "#3D2B1F";
                    }}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password & Enter Atelier</span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
