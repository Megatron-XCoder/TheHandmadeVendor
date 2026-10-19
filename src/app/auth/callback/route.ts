import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    } catch (e) {
      console.warn("Session code exchange notice:", e);
    }
  }

  // If this was a password reset attempt that failed or expired, guide user back to forgot-password
  if (next.includes("reset-password") || errorParam === "access_denied") {
    const msg = errorDescription || "Recovery link expired or invalid. Please request a fresh 6-digit code.";
    return NextResponse.redirect(
      `${origin}/forgot-password?error=${encodeURIComponent(msg)}`
    );
  }

  // Return the user to an error page with instructions if exchange fails
  return NextResponse.redirect(`${origin}/signin?error=Could+not+authenticate+user`);
}
