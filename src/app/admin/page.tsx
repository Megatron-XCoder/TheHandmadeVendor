import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_ENTRY_COOKIE,
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
  verifyEntryToken,
} from "@/utils/adminAuth";
import AdminDashboard from "@/components/Admin/Dashboard";

export const metadata = {
  title: "Atelier Console | The Handmade Vendor",
  description: "Administrative sanctuary for The Handmade Vendor",
};

export default async function AdminPage() {
  const cookieStore = await cookies();

  // 1. Verify admin session
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const { valid: isSessionValid, username } = await verifyAdminSession(sessionCookie);

  if (!isSessionValid) {
    // If not authenticated, check if entry gate was unlocked via footer store icon
    const entryCookie = cookieStore.get(ADMIN_ENTRY_COOKIE)?.value;
    const isEntryValid = await verifyEntryToken(entryCookie);

    if (isEntryValid) {
      redirect("/admin/login");
    } else {
      // Direct unauthorized access without store icon activation redirects to storefront
      redirect("/");
    }
  }

  return <AdminDashboard adminEmail={username || "admin@vendor.com"} />;
}

