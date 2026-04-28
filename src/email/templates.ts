/**
 * ProNear Email Templates
 *
 * All templates use inline CSS for maximum email client compatibility.
 * Designed for Resend free plan (sent from onboarding@resend.dev).
 */

/* ─── Shared layout wrapper ─── */
function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="580" cellpadding="0" cellspacing="0"
             style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Brand Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d9488 0%,#0891b2 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              Pro<span style="color:#a7f3d0;">Near</span>
            </h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:0.5px;">
              Trusted Local Professionals
            </p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:36px 40px 40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #e4e4e7;text-align:center;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">
              © ${new Date().getFullYear()} ProNear. All rights reserved.
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:#d4d4d8;">
              You received this email because you have an account on ProNear.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ═══════════════════════════════════════════
   1. Welcome / Signup Email
   ═══════════════════════════════════════════ */
export function welcomeEmailHtml(userName: string): string {
  const displayName = userName || "there";
  return layout(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;
                  background:linear-gradient(135deg,#0d9488,#0891b2);font-size:32px;text-align:center;">
        🎉
      </div>
    </div>
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
      Welcome to ProNear!
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#52525b;text-align:center;line-height:1.6;">
      Hi <strong>${displayName}</strong>, we're thrilled to have you on board. ProNear connects you
      with trusted local professionals — from electricians to tutors — right in your neighborhood.
    </p>

    <!-- Feature Cards -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:16px;background:#f0fdfa;border-radius:12px;border:1px solid #ccfbf1;vertical-align:top;" width="33%">
          <p style="margin:0 0 4px;font-size:20px;">🔍</p>
          <p style="margin:0;font-size:13px;font-weight:600;color:#0f766e;">Discover</p>
          <p style="margin:4px 0 0;font-size:12px;color:#5eead4;">Browse top-rated local pros</p>
        </td>
        <td width="12"></td>
        <td style="padding:16px;background:#f0fdfa;border-radius:12px;border:1px solid #ccfbf1;vertical-align:top;" width="33%">
          <p style="margin:0 0 4px;font-size:20px;">📅</p>
          <p style="margin:0;font-size:13px;font-weight:600;color:#0f766e;">Book</p>
          <p style="margin:4px 0 0;font-size:12px;color:#5eead4;">Schedule services easily</p>
        </td>
        <td width="12"></td>
        <td style="padding:16px;background:#f0fdfa;border-radius:12px;border:1px solid #ccfbf1;vertical-align:top;" width="33%">
          <p style="margin:0 0 4px;font-size:20px;">⭐</p>
          <p style="margin:0;font-size:13px;font-weight:600;color:#0f766e;">Review</p>
          <p style="margin:4px 0 0;font-size:12px;color:#5eead4;">Share your experience</p>
        </td>
      </tr>
    </table>

    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/services"
         style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#0d9488,#0891b2);
                color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;
                box-shadow:0 4px 14px rgba(13,148,136,0.3);">
        Browse Services →
      </a>
    </div>

    <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;text-align:center;">
      Want to offer your own services?
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/become-pro"
         style="color:#0d9488;text-decoration:underline;">Become a Pro</a>
    </p>
  `);
}

/* ═══════════════════════════════════════════
   2. OTP / Verification Code Email
   ═══════════════════════════════════════════ */
export function otpEmailHtml(code: string, userName?: string): string {
  const displayName = userName || "there";
  return layout(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;
                  background:linear-gradient(135deg,#0d9488,#0891b2);font-size:32px;text-align:center;">
        🔐
      </div>
    </div>
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
      Your Verification Code
    </h2>
    <p style="margin:0 0 28px;font-size:15px;color:#52525b;text-align:center;line-height:1.6;">
      Hi <strong>${displayName}</strong>, use the code below to verify your email address.
    </p>

    <!-- OTP Code Box -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;padding:20px 48px;background:linear-gradient(135deg,#f0fdfa,#ecfdf5);
                  border:2px dashed #0d9488;border-radius:16px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#0f766e;font-family:'Courier New',monospace;">
          ${code}
        </span>
      </div>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="margin-bottom:28px;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;padding:0;">
      <tr>
        <td style="padding:14px 20px;">
          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
            ⏱️ This code expires in <strong>10 minutes</strong>. If you didn't request this,
            you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>

    <div style="text-align:center;">
      <p style="margin:0;font-size:13px;color:#a1a1aa;">
        For security, never share this code with anyone.
      </p>
    </div>
  `);
}

/* ═══════════════════════════════════════════
   3. Pro Registration Confirmation Email
   ═══════════════════════════════════════════ */
export function proSignupConfirmationHtml(
  userName: string,
  serviceTitle: string,
  categoryLabel: string
): string {
  const displayName = userName || "Professional";
  return layout(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;
                  background:linear-gradient(135deg,#0d9488,#0891b2);font-size:32px;text-align:center;">
        🚀
      </div>
    </div>
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
      You're Now a Pro! 🎉
    </h2>
    <p style="margin:0 0 28px;font-size:15px;color:#52525b;text-align:center;line-height:1.6;">
      Congratulations <strong>${displayName}</strong>, your professional profile is live on ProNear!
      Customers in your area can now find and book you.
    </p>

    <!-- Service Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="margin-bottom:28px;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;background:linear-gradient(135deg,#f0fdfa,#ecfdf5);">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#0d9488;">
            YOUR LISTING
          </p>
          <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#18181b;">
            ${serviceTitle}
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 14px;background:#0d9488;border-radius:20px;">
                <span style="font-size:12px;font-weight:600;color:#ffffff;">
                  ${categoryLabel}
                </span>
              </td>
              <td width="10"></td>
              <td>
                <span style="font-size:13px;color:#52525b;">✅ Active</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Next Steps -->
    <h3 style="margin:0 0 14px;font-size:16px;font-weight:600;color:#18181b;">
      What's Next?
    </h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:12px 16px;background:#fafafa;border-radius:8px;margin-bottom:8px;">
          <p style="margin:0;font-size:14px;color:#3f3f46;">
            <strong style="color:#0d9488;">1.</strong> Complete your profile with a great photo
          </p>
        </td>
      </tr>
      <tr><td height="8"></td></tr>
      <tr>
        <td style="padding:12px 16px;background:#fafafa;border-radius:8px;">
          <p style="margin:0;font-size:14px;color:#3f3f46;">
            <strong style="color:#0d9488;">2.</strong> Respond quickly to booking requests
          </p>
        </td>
      </tr>
      <tr><td height="8"></td></tr>
      <tr>
        <td style="padding:12px 16px;background:#fafafa;border-radius:8px;">
          <p style="margin:0;font-size:14px;color:#3f3f46;">
            <strong style="color:#0d9488;">3.</strong> Collect reviews to boost your visibility
          </p>
        </td>
      </tr>
    </table>

    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/pro"
         style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#0d9488,#0891b2);
                color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;
                box-shadow:0 4px 14px rgba(13,148,136,0.3);">
        Go to Pro Dashboard →
      </a>
    </div>
  `);
}

/* ═══════════════════════════════════════════
   4. Booking Request Notification Email
   ═══════════════════════════════════════════ */
export function bookingRequestEmailHtml(
  customerName: string,
  serviceTitle: string,
  scheduledDate: string,
  notes?: string | null
): string {
  const displayName = customerName || "there";
  const noteBlock = notes?.trim()
    ? `
      <div style="margin:18px 0 0;padding:16px;border-radius:12px;background:#fafafa;border:1px solid #e4e4e7;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0d9488;">Customer Notes</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46;">${notes}</p>
      </div>`
    : "";

  return layout(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;
                  background:linear-gradient(135deg,#0d9488,#0891b2);font-size:32px;text-align:center;">
        📩
      </div>
    </div>
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
      New Booking Request
    </h2>
    <p style="margin:0 0 24px;font-size:15px;color:#52525b;text-align:center;line-height:1.6;">
      Hi, you have a new booking request from <strong>${displayName}</strong> for <strong>${serviceTitle}</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="margin-bottom:28px;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
      <tr>
        <td style="padding:18px 22px;background:#f8fafc;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0d9488;">
            Scheduled For
          </p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#18181b;">
            ${new Date(scheduledDate).toLocaleString()}
          </p>
          ${noteBlock}
        </td>
      </tr>
    </table>

    <div style="text-align:center;">
      <p style="margin:0;font-size:13px;color:#a1a1aa;">
        Open your Pro dashboard to accept or decline this request.
      </p>
    </div>
  `);
}
