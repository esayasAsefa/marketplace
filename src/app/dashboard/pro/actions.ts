"use server";

import { stackServerApp } from "@/stack";
import db from "@/db";
import { bookings, services, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cacheInvalidate, CACHE_KEYS } from "@/cache";
// Note: We don't import resend/generateBookingAcceptedEmailHtml here anymore. 
// We will use nodemailer directly or abstract it. 
import transporter, { gmailFromAddress } from "@/email";
import { generateBookingAcceptedEmailHtml } from "@/email/celebration-email";

export type ActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Update a booking status (accept / decline / complete).
 * Only the Pro who owns the service can do this.
 */
export async function updateBookingStatus(
  bookingId: number,
  newStatus: "accepted" | "declined" | "completed"
): Promise<ActionResult> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    // Verify the pro owns the service tied to this booking
    const booking = await db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        serviceProId: services.proId,
        serviceTitle: services.title,
        scheduledDate: bookings.scheduledDate,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (booking.length === 0) {
      return { success: false, error: "Booking not found." };
    }

    if (booking[0].serviceProId !== stackUser.id) {
      return { success: false, error: "You are not authorized to manage this booking." };
    }

    await db
      .update(bookings)
      .set({ status: newStatus })
      .where(eq(bookings.id, bookingId));

    if (newStatus === "accepted") {
      try {
        if (!gmailFromAddress) {
          throw new Error("GMAIL_USER is missing. Set the Gmail sender address in .env.");
        }

        const customerRecords = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, booking[0].customerId))
          .limit(1);

        if (customerRecords.length > 0 && customerRecords[0].email) {
           const customerDbProfile = customerRecords[0];
           const html = await generateBookingAcceptedEmailHtml(
             customerDbProfile.name || "Valued Customer",
             stackUser.displayName || "Your Professional",
             booking[0].serviceTitle,
             booking[0].scheduledDate.toISOString()
           );
           
           await transporter.sendMail({
             from: `ProNear <${gmailFromAddress}>`,
             to: customerDbProfile.email,
             subject: `Booking Confirmed: ${booking[0].serviceTitle}`,
             html,
           });
        }
      } catch (e) {
        console.warn("Failed to send AI celebration email", e);
      }
    }

    // Invalidate caches for both sides
    await cacheInvalidate(
      CACHE_KEYS.proBookings(stackUser.id),
      CACHE_KEYS.customerBookings(booking[0].customerId)
    );

    revalidatePath("/dashboard/pro");
    revalidatePath("/dashboard/customer");

    return { success: true };
  } catch (err) {
    console.error("[updateBookingStatus] Error:", err);
    return { success: false, error: "Something went wrong." };
  }
}

/**
 * Delete a service listing. Only the Pro who owns it can delete it.
 */
export async function deleteService(serviceId: number): Promise<ActionResult> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    // Verify ownership
    const service = await db
      .select({ id: services.id, proId: services.proId })
      .from(services)
      .where(and(eq(services.id, serviceId), eq(services.proId, stackUser.id)))
      .limit(1);

    if (service.length === 0) {
      return { success: false, error: "Service not found or you are not the owner." };
    }

    await db.delete(services).where(eq(services.id, serviceId));

    // Invalidate relevant caches
    await cacheInvalidate(
      CACHE_KEYS.proServices(stackUser.id),
      CACHE_KEYS.proBookings(stackUser.id),
      CACHE_KEYS.featuredPros,
      CACHE_KEYS.categoryCounts
    );

    revalidatePath("/dashboard/pro");
    revalidatePath("/services");

    return { success: true };
  } catch (err) {
    console.error("[deleteService] Error:", err);
    return { success: false, error: "Something went wrong." };
  }
}
