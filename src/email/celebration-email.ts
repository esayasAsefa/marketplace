import { generateText } from "ai";
import { getAiModel } from "@/lib/ai";

export async function generateBookingAcceptedEmailHtml(
  customerName: string,
  proName: string,
  serviceTitle: string,
  scheduledDate: string
) {
  try {
    const prompt = `A professional explicitly accepted a booking request on our local services marketplace.
Write a short, celebratory, and highly personalized email body to the customer.
Customer Name: ${customerName}
Professional Name: ${proName}
Service: ${serviceTitle}
Scheduled Date: ${scheduledDate}

Make it sound human, exciting, and professional. 
Format it with basic HTML (like <p>, <strong>, <br>).`;

    const { text } = await generateText({
      model: getAiModel("gemini-2.5-flash"),
      prompt,
      temperature: 0.6,
    });

    return `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Your booking is confirmed! 🎉</h2>
        ${text}
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Thank you for choosing ProNear.
        </p>
      </div>
    `;
  } catch (err) {
    // Fallback if AI fails
    return `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Your booking is confirmed! 🎉</h2>
        <p>Hi ${customerName},</p>
        <p><strong>${proName}</strong> has accepted your request for <strong>${serviceTitle}</strong>.</p>
        <p>They will see you on <strong>${new Date(scheduledDate).toLocaleString()}</strong>.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Thank you for choosing ProNear.
        </p>
      </div>
    `;
  }
}
