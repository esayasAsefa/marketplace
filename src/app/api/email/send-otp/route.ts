import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { cacheSet, CACHE_KEYS } from "@/cache";
import { sendOtpEmail } from "@/email/send";

/**
 * POST /api/email/send-otp
 *
 * Generates a 6-digit OTP, stores it in Redis with a 10-minute TTL,
 * and sends it to the authenticated user's email via Resend.
 *
 * Body (optional):
 *   { "email": "override@example.com" }   ← defaults to the user's primary email
 */
export async function POST(req: Request) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    // Allow an optional email override (e.g. when verifying a new email)
    const body = await req.json().catch(() => ({}));
    const targetEmail: string = body.email || user.primaryEmail;

    if (!targetEmail) {
      return NextResponse.json(
        { error: "No email address found for this account." },
        { status: 400 }
      );
    }

    // Generate a cryptographically random 6-digit code
    const code = Array.from(crypto.getRandomValues(new Uint8Array(3)))
      .map((b) => (b % 10).toString())
      .join("")
      .padStart(6, "0");

    // Store in Redis with 10-minute TTL
    const cacheKey = CACHE_KEYS.otpCode(user.id, targetEmail);
    await cacheSet(cacheKey, code, 600); // 10 minutes

    // Send the OTP email via Resend
    const result = await sendOtpEmail(
      targetEmail,
      code,
      user.displayName || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send verification email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (err) {
    console.error("[send-otp] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
