import nodemailer from "nodemailer";

/**
 * Gmail SMTP transporter via Nodemailer.
 *
 * Sends emails from your Gmail account to ANY recipient — no domain verification needed.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in .env
 */
const gmailUser = process.env.GMAIL_USER?.trim();
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

export const gmailFromAddress = gmailUser;
export default transporter;