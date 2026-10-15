import MyAccount from "@/components/MyAccount";
import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | The Handmade Vendor",
  description: "Patron Sanctuary & Account Management",
};

export default async function MyAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?redirect=/my-account");
  }

  return (
    <main>
      <MyAccount />
    </main>
  );
}
