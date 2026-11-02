import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ENTRY_COOKIE,
  ADMIN_SESSION_COOKIE,
  ENTRY_TOKEN_MAX_AGE,
  generateEntryToken,
  verifyAdminSession,
} from "@/utils/adminAuth";

export async function POST(request: NextRequest) {
  try {
    // Check if admin is already logged in
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const { valid } = await verifyAdminSession(sessionCookie);

    if (valid) {
      return NextResponse.json({
        success: true,
        redirectUrl: "/admin",
        alreadyLoggedIn: true,
      });
    }

    // Generate entry pass
    const entryToken = await generateEntryToken();
    const response = NextResponse.json({
      success: true,
      redirectUrl: "/admin/login",
    });

    response.cookies.set({
      name: ADMIN_ENTRY_COOKIE,
      value: entryToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ENTRY_TOKEN_MAX_AGE,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to authorize portal entry." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const { valid } = await verifyAdminSession(sessionCookie);

    const targetUrl = new URL(valid ? "/admin" : "/admin/login", request.url);
    const response = NextResponse.redirect(targetUrl);

    if (!valid) {
      const entryToken = await generateEntryToken();
      response.cookies.set({
        name: ADMIN_ENTRY_COOKIE,
        value: entryToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ENTRY_TOKEN_MAX_AGE,
      });
    }

    return response;
  } catch (err) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

