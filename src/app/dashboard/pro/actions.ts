"use server";

import { stackServerApp } from "@/stack";
import db from "@/db";
import { bookings, services, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cacheInvalidate, CACHE_KEYS } from "@/cache";

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
