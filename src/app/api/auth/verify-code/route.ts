import { NextResponse } from "next/server";
import { verificationStore } from "@/utils/verificationStore";
import { createClient } from "@/utils/supabase/server";
import { sendWelcomeEmail } from "@/utils/email";

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

    let createdUser: any = null;

    // If SUPABASE_SERVICE_ROLE_KEY is provided, create pre-confirmed user directly
    // to bypass Supabase's built-in confirmation email entirely
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createClient: createAdminClient } = await import(
          "@supabase/supabase-js"
        );
        const adminSupabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          serviceRoleKey,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: adminUserData, error: adminError } =
          await adminSupabase.auth.admin.createUser({
            email,
            password: userData.password,
            email_confirm: true,
            user_metadata: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              phone: userData.phone,
              full_name: `${userData.firstName} ${userData.lastName}`.trim(),
            },
          });

        if (adminError) {
          console.error("Admin user creation error:", adminError);
          // If error is user already exists or other, fallback or throw
          throw adminError;
        }

        createdUser = adminUserData?.user;
      } catch (adminErr: any) {
        console.warn("Falling back to standard supabase.auth.signUp:", adminErr.message);
      }
    }

    // Standard client fallback if admin key was not used or failed
    if (!createdUser) {
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

      createdUser = signUpData.user;
    }

    // Establish active session cookies immediately
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password: userData.password,
      });

    // Dispatch luxury Atelier Welcome Email to the verified client
    try {
      await sendWelcomeEmail({
        email,
        firstName: userData.firstName,
      });
    } catch (welcomeError) {
      console.error("Could not send welcome email:", welcomeError);
      // Non-fatal: do not block registration response
    }

    return NextResponse.json({
      success: true,
      message: "Account verified and welcome email dispatched successfully.",
      user: createdUser || signInData?.user,
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
