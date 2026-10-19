import { NextResponse } from "next/server";
import { passwordResetStore } from "@/utils/verificationStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and recovery code are required." },
        { status: 400 }
      );
    }

    const result = passwordResetStore.verifyReset(email, code, false);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Invalid or expired recovery code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recovery code verified successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
