import { NextResponse } from "next/server";
import { sendPasswordResetSuccessEmail } from "@/utils/email";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Try to get user's first name from profiles if available
    let firstName = "";
    try {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (profile?.first_name) {
        firstName = profile.first_name;
      }
    } catch (e) {
      // Non-fatal
    }

    await sendPasswordResetSuccessEmail({
      email: email.trim().toLowerCase(),
      firstName,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Password reset notification error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
