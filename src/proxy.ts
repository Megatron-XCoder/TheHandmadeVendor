import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import {
  ADMIN_ENTRY_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
  verifyEntryToken,
} from "@/utils/adminAuth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Protected Admin Route Layer ──────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const { valid: isSessionValid } = await verifyAdminSession(sessionCookie);

    if (pathname === "/admin/login") {
      // If already logged in, redirect directly to admin dashboard
      if (isSessionValid) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // Check if entry was unlocked via footer store icon
      const entryCookie = request.cookies.get(ADMIN_ENTRY_COOKIE)?.value;
      const isEntryValid = await verifyEntryToken(entryCookie);

      if (!isEntryValid) {
        // Direct address-bar access prohibited - redirect to public storefront
        return NextResponse.redirect(new URL("/", request.url));
      }
    } else {
      // Any other /admin sub-route requires full admin session authentication
      if (!isSessionValid) {
        const entryCookie = request.cookies.get(ADMIN_ENTRY_COOKIE)?.value;
        const isEntryValid = await verifyEntryToken(entryCookie);
        if (isEntryValid) {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - images (public images)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
