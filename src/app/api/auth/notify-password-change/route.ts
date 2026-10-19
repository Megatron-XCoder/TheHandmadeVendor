import { NextResponse } from "next/server";
import { sendPasswordResetSuccessEmail } from "@/utils/email";

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    await sendPasswordResetSuccessEmail({
      email: email.trim().toLowerCase(),
      firstName,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in notify-password-change API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch password notification." },
      { status: 500 }
    );
  }
}
