import { NextResponse } from "next/server";
import { passwordResetStore } from "@/utils/verificationStore";
import { sendPasswordResetEmail } from "@/utils/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Please enter your registered email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 1. Generate secure 6-digit recovery code and record in passwordResetStore (10-minute lifetime)
    const { code, expiresAt } = passwordResetStore.createReset(normalizedEmail);

    // 2. Build direct 1-click recovery URL (pre-authorized with code and email)
    const resetUrl = `${siteUrl}/reset-password?email=${encodeURIComponent(
      normalizedEmail
    )}&code=${code}`;

    // 3. Dispatch luxury Atelier recovery email via Nodemailer SMTP
    const emailResult = await sendPasswordResetEmail({
      email: normalizedEmail,
      resetUrl,
      code,
    });

    return NextResponse.json({
      success: true,
      message: "Recovery code and instructions dispatched to your email address.",
      expiresAt,
    });
  } catch (error: any) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch recovery code." },
      { status: 400 }
    );
  }
}
