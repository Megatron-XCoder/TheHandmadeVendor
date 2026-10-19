"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { showToast } from "@/utils/toast";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read email and 6-digit recovery code from URL query params (if opened via email button)
  const queryEmail = searchParams.get("email") || "";
  const queryCode = searchParams.get("code") || "";

  const [email, setEmail] = useState(queryEmail);
  const [code, setCode] = useState(queryCode);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isMatching = rePassword ? password === rePassword : null;

  useEffect(() => {
    // 1. If email and 6-digit code are present in URL from email button, consider valid immediately
    if (queryEmail && queryCode && queryCode.length === 6) {
      setHasValidSession(true);
      setIsCheckingSession(false);
      return;
    }

    // 2. Otherwise check Supabase session
    const supabase = createClient();
    async function verifyRecoverySession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setHasValidSession(true);
          setEmail(session.user.email || "");
          setIsCheckingSession(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setHasValidSession(true);
          setEmail(user.email || "");
          setIsCheckingSession(false);
          return;
        }

        // Listen for session auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (
            (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") &&
            newSession?.user
          ) {
            setHasValidSession(true);
            setEmail(newSession.user.email || "");
            setIsCheckingSession(false);
          }
        });

        setTimeout(() => {
          setIsCheckingSession(false);
        }, 1200);

        return () => subscription.unsubscribe();
      } catch (err) {
        setIsCheckingSession(false);
      }
    }

    verifyRecoverySession();
  }, [queryEmail, queryCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      showToast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== rePassword) {
      showToast.error("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsLoading(true);

    try {
      // If we have queryCode / OTP code, update via reset-password API
      if (email && code) {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            code: code.trim(),
            newPassword: password,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update password.");
        }

        showToast.success(
          "Password updated successfully! Welcome back to the Atelier."
        );

        // Sign in user
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          router.push("/my-account");
          router.refresh();
        } catch (signInErr) {
          router.push("/signin");
        }
        return;
      }

      // Fallback to client-side session update
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        showToast.error(error.message || "Failed to update password.");
        setIsLoading(false);
        return;
      }

      showToast.success(
        "Password updated successfully! Welcome back to the Atelier."
      );
      router.push("/my-account");
      router.refresh();
    } catch (err: any) {
      showToast.error(
        err.message || "An unexpected error occurred while updating password."
      );
      setIsLoading(false);
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
                Set New Credentials
              </h1>
              <p className="text-xs sm:text-sm leading-relaxed text-[#D2C5B8]">
                Select a strong, private password to protect your acquisitions,
                wishlists, and bespoke client records.
              </p>
            </div>

            <div className="relative z-10 space-y-4 mb-8 sm:mb-12 border-t border-b border-[#E3C9A8]/20 py-6">
              <div className="flex items-start gap-3">
                <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                <p className="text-xs text-[#E9DFD5] leading-relaxed">
                  <strong className="text-white block font-medium">
                    256-Bit Cryptographic Vault
                  </strong>
                  Passwords are encrypted with industry-standard bcrypt hashing
                  and never stored in plaintext.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C4896A] mt-0.5 text-sm">✦</span>
                <p className="text-xs text-[#E9DFD5] leading-relaxed">
                  <strong className="text-white block font-medium">
                    Immediate Multi-Device Sync
                  </strong>
                  Your new credentials take effect immediately across all
                  authenticated sessions.
                </p>
              </div>
            </div>

            <div className="relative z-10 text-[11px] text-[#A8988B] tracking-wider uppercase">
              Artisan Mastery • Since 2018
            </div>
          </div>

          {/* ── RIGHT COLUMN: Reset Form or Invalid Link State ──────────── */}
          <div className="lg:w-[55%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#FFFFFF]">
            {isCheckingSession ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 mx-auto border-2 border-[#C4896A] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs tracking-wider uppercase text-[#7A6B5D]">
                  Authenticating Recovery Session...
                </p>
              </div>
            ) : hasValidSession ? (
              <>
                <div className="mb-7">
                  <h2
                    className="text-xl sm:text-2xl font-semibold tracking-[0.1em] uppercase mb-2"
                    style={{ fontFamily: "'Cinzel', serif", color: "#3D2B1F" }}
                  >
                    Reset Password
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6B5D]">
                    {email
                      ? `Setting new password for ${email}.`
                      : "Please enter your new password below."}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold tracking-wider text-[#3D2B1F] uppercase mb-1.5"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 shadow-md hover:shadow-xl mt-3 flex items-center justify-center gap-2 disabled:opacity-60"
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
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password & Enter Atelier</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Invalid or expired session state */
              <div className="py-6 text-center space-y-4">
                <div
                  className="w-14 h-14 mx-auto rounded-full flex items-center justify-center border text-[#C4896A]"
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>

                <h2
                  className="text-xl sm:text-2xl font-semibold tracking-[0.08em] uppercase text-[#3D2B1F]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Session Expired or Invalid
                </h2>
                <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-sm mx-auto leading-relaxed">
                  This recovery session is either expired, already used, or invalid.
                  For your security, recovery codes are active for 10 minutes.
                </p>

                <div className="pt-2">
                  <Link
                    href="/forgot-password"
                    className="inline-block py-3 px-6 rounded-full text-xs font-semibold tracking-[0.12em] uppercase text-white shadow-md hover:shadow-lg transition-all"
                    style={{
                      background: "#3D2B1F",
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    Request New Recovery Code
                  </Link>
                </div>

                <div className="pt-4">
                  <Link
                    href="/signin"
                    className="text-xs text-[#7A6B5D] hover:text-[#3D2B1F] transition-colors"
                  >
                    ← Return to Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
