import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ENTRY_COOKIE, ADMIN_SESSION_COOKIE } from "@/utils/adminAuth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    redirectUrl: "/",
  });

  response.cookies.delete(ADMIN_SESSION_COOKIE);
  response.cookies.delete(ADMIN_ENTRY_COOKIE);

  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  response.cookies.delete(ADMIN_ENTRY_COOKIE);
  return response;
}

