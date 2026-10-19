import { NextResponse } from "next/server";
import { passwordResetStore } from "@/utils/verificationStore";
import { createClient } from "@/utils/supabase/server";
import { sendPasswordResetSuccessEmail } from "@/utils/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, recovery code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verify and consume the 6-digit recovery code
    const verifyResult = passwordResetStore.verifyReset(
      normalizedEmail,
      code,
      true
    );

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || "Invalid or expired recovery code." },
        { status: 400 }
      );
    }

    let passwordUpdated = false;

    // 2. Approach A: If SUPABASE_SERVICE_ROLE_KEY is present, update via Admin API
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

        const { data: userListData, error: listError } =
          await adminSupabase.auth.admin.listUsers();

        if (!listError && userListData?.users) {
          const target = (userListData.users as any[]).find(
            (u: any) => u.email?.toLowerCase() === normalizedEmail
          );

          if (target) {
            const { error: updateError } =
              await adminSupabase.auth.admin.updateUserById(target.id, {
                password: newPassword,
              });

            if (!updateError) {
              passwordUpdated = true;
            }
          }
        }
      } catch (adminErr: any) {
        console.warn("Service role password update attempt notice:", adminErr.message);
      }
    }

    // 3. Approach B: Update via PostgreSQL reset_user_password RPC function
    if (!passwordUpdated) {
      const supabase = await createClient();
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        "reset_user_password",
        {
          user_email: normalizedEmail,
          new_password: newPassword,
        }
      );

      if (!rpcError && rpcResult === true) {
        passwordUpdated = true;
      } else if (rpcError) {
        console.warn("PostgreSQL RPC reset_user_password notice:", rpcError.message);
      }
    }

    // 4. Approach C: Fallback check if user currently has an authenticated recovery session
    if (!passwordUpdated) {
      const supabase = await createClient();
      const { data: updateData, error: sessionUpdateError } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (!sessionUpdateError && updateData?.user) {
        passwordUpdated = true;
      }
    }

    if (!passwordUpdated) {
      return NextResponse.json(
        {
          error:
            "Could not update password in database. Please ensure the 'reset_user_password' database function has been executed in the Supabase SQL editor or add SUPABASE_SERVICE_ROLE_KEY to .env.",
        },
        { status: 400 }
      );
    }

    // 5. Dispatch confirmation email
    try {
      await sendPasswordResetSuccessEmail({
        email: normalizedEmail,
      });
    } catch (mailErr) {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in.",
    });
  } catch (error: any) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
