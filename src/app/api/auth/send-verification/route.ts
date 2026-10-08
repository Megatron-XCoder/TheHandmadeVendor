import { NextResponse } from "next/server";
import { verificationStore } from "@/utils/verificationStore";
import { sendVerificationEmail } from "@/utils/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, email, password } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: "First name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Generate code and save registration details in store
    const { code, expiresAt } = verificationStore.createVerification(email, {
      firstName,
      lastName: lastName || "",
      phone: phone || "",
      password,
    });

    // Dispatch luxury personalized email
    const emailResult = await sendVerificationEmail({
      email,
      firstName,
      code,
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email address.",
      expiresAt,
      // For local development convenience if SMTP is not configured
      devCode: emailResult.simulated ? code : undefined,
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch verification code." },
      { status: 400 }
    );
  }
}
