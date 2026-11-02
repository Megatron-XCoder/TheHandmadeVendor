"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";
import AdminNavbar from "@/components/Admin/AdminNavbar";

const AdminLogin: React.FC = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Please provide both username and password.");
      showToast.error("Missing credentials.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.requiresStoreEntry) {
          showToast.error("Direct access denied. Please enter via the store portal.");
          setTimeout(() => {
            router.push("/");
          }, 1500);
          return;
        }
        const errorText = data.error || "Invalid curator credentials. Access denied.";
        setErrorMessage(errorText);
        showToast.error(errorText);
        return;
      }

      showToast.success("Atelier Curator Authenticated.");
      window.location.href = data.redirectUrl || "/admin";
    } catch (err: any) {
      const msg = err.message || "Failed to communicate with authentication gate.";
      setErrorMessage(msg);
      showToast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
      {/* ── Top Navbar (identical to homepage navbar + Return to Storefront) ── */}
      <AdminNavbar isLoggedIn={false} />

      {/* ── Sleek Minimalist Login Canvas (No Footer) ── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[390px]">
          <div className="rounded-2xl border border-[#E3C9A8]/70 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(61,43,31,0.05)] space-y-5">
            {/* Minimalist Header */}
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-[#3D2B1F] text-[#E3C9A8] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                  <path d="M2 7h20" />
                  <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
                </svg>
              </div>
              <h1
                className="text-lg sm:text-xl font-semibold text-[#2A1E17] tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Curator Sign In
              </h1>
              <p className="text-xs text-[#7A6B5D]">
                Enter master credentials to access atelier console.
              </p>
            </div>

            {/* Error Pill */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5]/60 text-[#B91C1C] text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Username Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[#7A6B5D] uppercase tracking-[0.12em] mb-1">
                  Curator Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A09082]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@vendor.com"
                    autoComplete="username"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E3C9A8]/80 bg-[#FFFAF5]/40 focus:bg-white text-xs sm:text-sm text-[#2A1E17] placeholder:text-[#A09082]/70 focus:outline-none focus:ring-1 focus:ring-[#C4896A] focus:border-[#C4896A] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[11px] font-semibold text-[#7A6B5D] uppercase tracking-[0.12em] mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A09082]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-[#E3C9A8]/80 bg-[#FFFAF5]/40 focus:bg-white text-xs sm:text-sm text-[#2A1E17] placeholder:text-[#A09082]/70 focus:outline-none focus:ring-1 focus:ring-[#C4896A] focus:border-[#C4896A] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A09082] hover:text-[#3D2B1F] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-1 rounded-lg bg-[#3D2B1F] hover:bg-[#C4896A] text-white text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-200 shadow-2xs hover:shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Discreet Security Note */}
            <div className="pt-2 text-center text-[10px] text-[#A09082] flex items-center justify-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>256-Bit Encrypted • Atelier Gate</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;