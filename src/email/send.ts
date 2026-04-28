import transporter, { gmailFromAddress } from "@/email";
import {
  welcomeEmailHtml,
  otpEmailHtml,
  proSignupConfirmationHtml,
  bookingRequestEmailHtml,
} from "@/email/templates";

/* ─── Generic send helper with error handling ─── */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!gmailFromAddress) {
      return {
        success: false,
        error: "GMAIL_USER is missing. Set the Gmail sender address in .env.",
      };
    }

    const info = await transporter.sendMail({
      from: `ProNear <${gmailFromAddress}>`,
      to,
      subject,
      html,
    });

    console.log("[sendEmail] Sent successfully, messageId:", info.messageId);
    return { success: true };
  } catch (err) {
    console.error("[sendEmail] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

/* ═══════════════════════════════════════════
   Public API — Send specific email types
   ═══════════════════════════════════════════ */

/** Send a welcome email after a new user signs up */
export async function sendWelcomeEmail(to: string, userName: string) {
  return sendEmail({
    to,
    subject: "Welcome to ProNear! 🎉 Let's get started",
    html: welcomeEmailHtml(userName),
  });
}

/** Send an OTP / verification code email */
export async function sendOtpEmail(
  to: string,
  code: string,
  userName?: string
) {
  return sendEmail({
    to,
    subject: `${code} is your ProNear verification code`,
    html: otpEmailHtml(code, userName),
  });
}

/** Send a confirmation email after a user becomes a Pro */
export async function sendProSignupEmail(
  to: string,
  userName: string,
  serviceTitle: string,
  categoryLabel: string
) {
  return sendEmail({
    to,
    subject: "You're officially a Pro on ProNear! 🚀",
    html: proSignupConfirmationHtml(userName, serviceTitle, categoryLabel),
  });
}

/** Send a booking request email to the Pro who owns the service */
export async function sendBookingRequestEmail(
  to: string,
  customerName: string,
  serviceTitle: string,
  scheduledDate: string,
  notes?: string | null
) {
  return sendEmail({
    to,
    subject: `New booking request for ${serviceTitle}`,
    html: bookingRequestEmailHtml(customerName, serviceTitle, scheduledDate, notes),
  });
}
