import { NextResponse } from "next/server";
import { verificationStore } from "@/utils/verificationStore";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    // Verify code against 5-minute store
    const verificationResult = verificationStore.verify(email, code);
    if (!verificationResult.success || !verificationResult.userData) {
      return NextResponse.json(
        { error: verificationResult.error || "Verification failed." },
        { status: 400 }
      );
    }

    const { userData } = verificationResult;
    const supabase = await createClient();

    // Register user in Supabase
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          full_name: `${userData.firstName} ${userData.lastName}`.trim(),
        },
      },
    });

    if (signUpError) {
      console.error("Supabase signUp error:", signUpError);
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    // Attempt sign in to create active session cookies immediately
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: userData.password,
      });

    return NextResponse.json({
      success: true,
      message: "Account verified and created successfully.",
      user: signUpData.user || signInData?.user,
      session: signInData?.session || null,
    });
  } catch (error: any) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
