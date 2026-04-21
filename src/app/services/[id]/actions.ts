"use server";

import { stackServerApp } from "@/stack";
import db from "@/db";
import { bookings, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { syncCurrentUser } from "@/lib/sync-user";
import { cacheSet, CACHE_KEYS, TTL } from "@/cache";

export type BookingFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function requestBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const stackUser = await stackServerApp.getUser();

  if (!stackUser) {
    return {
      success: false,
      error: "You must be signed in to request a booking.",
    };
  }

  // Ensure the customer exists in our database before adding a booking
  // (Prevents foreign key constraint errors if they signed in without hitting the homepage)
  await syncCurrentUser();

  const serviceIdStr = formData.get("serviceId") as string;
  const scheduledDateStr = formData.get("scheduledDate") as string;
  const phoneStr = formData.get("phone") as string;
  const locationLatStr = formData.get("locationLat") as string | null;
  const locationLngStr = formData.get("locationLng") as string | null;
  const notes = formData.get("notes") as string | null;

  const serviceId = parseInt(serviceIdStr, 10);

  const fieldErrors: Record<string, string> = {};

  if (!serviceId || isNaN(serviceId)) {
    return { success: false, error: "Invalid service ID." };
  }

  if (!phoneStr || phoneStr.trim().length < 6) {
    fieldErrors.phone = "Please provide a valid phone number.";
  }

  if (!scheduledDateStr) {
    fieldErrors.scheduledDate = "Please select a date and time.";
  } else {
    const parsedDate = new Date(scheduledDateStr);
    if (isNaN(parsedDate.getTime())) {
      fieldErrors.scheduledDate = "Invalid date and time.";
    } else if (parsedDate < new Date()) {
      fieldErrors.scheduledDate = "Booking date cannot be in the past.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors,
    };
  }

  try {
    // Check if the service exists in the actual DB
    // This is important because the frontend falls back to mock services when the DB is empty
    const existingService = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (existingService.length === 0) {
      return {
        success: false,
        error:
          "This is a mock service that doesn't securely exist in the database. Please create a real Pro Profile and book yourself!",
      };
    }

    const scheduledDate = new Date(scheduledDateStr);
    // Parse location if available
    let locationLat: string | undefined = undefined;
    let locationLng: string | undefined = undefined;
    if (locationLatStr && locationLngStr) {
      locationLat = locationLatStr;
      locationLng = locationLngStr;
    }

    await db.insert(bookings).values({
      serviceId,
      customerId: stackUser.id,
      customerPhone: phoneStr ? phoneStr.trim() : null,
      locationLat,
      locationLng,
      scheduledDate,
      notes: notes?.trim(),
      status: "pending",
    });

    // Cache the customer's phone and location data for future bookings!
    await cacheSet(
      CACHE_KEYS.customerProfile(stackUser.id),
      {
        phone: phoneStr.trim(),
        location: locationLatStr && locationLngStr ? { lat: parseFloat(locationLatStr), lng: parseFloat(locationLngStr) } : null,
      },
      TTL.customerProfile
    );

    return { success: true };
  } catch (err) {
    console.error("[Booking Action Failed]:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
