import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ENTRY_COOKIE,
  ADMIN_SESSION_COOKIE,
  SESSION_TOKEN_MAX_AGE,
  generateAdminSession,
  verifyEntryToken,
} from "@/utils/adminAuth";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify that the request arrived through the store icon entry gate
    const entryToken = request.cookies.get(ADMIN_ENTRY_COOKIE)?.value;
    const isEntryValid = await verifyEntryToken(entryToken);

    if (!isEntryValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access: You must enter through the store portal.",
          requiresStoreEntry: true,
        },
        { status: 403 }
      );
    }

    // 2. Parse credentials
    const body = await request.json();
    const { username, password } = body;

    const trimmedUser = (username || "").trim();
    const providedPass = password || "";

    const expectedUser = process.env.ADMIN_USERNAME || "admin@vendor.com";
    const expectedPass = process.env.ADMIN_PASSWORD || "Handmade@1234";

    if (!trimmedUser || !providedPass) {
      return NextResponse.json(
        { success: false, error: "Please enter both username and password." },
        { status: 400 }
      );
    }

    // Validate credentials
    if (trimmedUser !== expectedUser || providedPass !== expectedPass) {
      return NextResponse.json(
        { success: false, error: "Invalid curator credentials. Access denied." },
        { status: 401 }
      );
    }

    // 3. Issue admin session
    const sessionToken = await generateAdminSession(trimmedUser);
    const response = NextResponse.json({
      success: true,
      message: "Atelier curator authenticated successfully.",
      redirectUrl: "/admin",
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TOKEN_MAX_AGE,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Authentication system error." },
      { status: 500 }
    );
  }
}

