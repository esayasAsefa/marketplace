import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { cacheGet, cacheInvalidate, CACHE_KEYS } from "@/cache";

/**
 * POST /api/email/verify-otp
 *
 * Verifies a user-submitted OTP code against the one stored in Redis.
 *
 * Body:
 *   { "code": "123456", "email": "user@example.com" (optional) }
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

    const body = await req.json().catch(() => ({}));
    const submittedCode: string | undefined = body.code;
    const targetEmail: string = body.email || user.primaryEmail;

    if (!submittedCode || submittedCode.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit code." },
        { status: 400 }
      );
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: "No email address found." },
        { status: 400 }
      );
    }

    // Retrieve the stored OTP from Redis
    const cacheKey = CACHE_KEYS.otpCode(user.id, targetEmail);
    const storedCode = await cacheGet<string>(cacheKey);

    if (!storedCode) {
      return NextResponse.json(
        { error: "Code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    if (storedCode !== submittedCode) {
      return NextResponse.json(
        { error: "Incorrect code. Please try again." },
        { status: 400 }
      );
    }

    // Code matches — delete it so it can't be reused
    await cacheInvalidate(cacheKey);

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Email verified successfully!",
    });
  } catch (err) {
    console.error("[verify-otp] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
