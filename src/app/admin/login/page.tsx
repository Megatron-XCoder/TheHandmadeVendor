import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_ENTRY_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
  verifyEntryToken,
} from "@/utils/adminAuth";
import AdminLogin from "@/components/Admin/Login";

export const metadata = {
  title: "Admin Portal Sign In | The Handmade Vendor",
  description: "Curator Sanctuary Authentication Gate",
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();

  // 1. If already authenticated as admin, redirect directly to dashboard
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const { valid: isSessionValid } = await verifyAdminSession(sessionCookie);

  if (isSessionValid) {
    redirect("/admin");
  }

  // 2. Protective route: Must have arrived by clicking the footer store icon
  const entryCookie = cookieStore.get(ADMIN_ENTRY_COOKIE)?.value;
  const isEntryValid = await verifyEntryToken(entryCookie);

  if (!isEntryValid) {
    // Direct URL typing without store icon activation redirects to public storefront
    redirect("/");
  }

  return <AdminLogin />;
}

