"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";
import db from "@/db";
import { users, profiles, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cacheInvalidate, CACHE_KEYS } from "@/cache";
import redis from "@/cache";
import { moderateContent } from "@/lib/ai-moderation";
import { sendProSignupEmail } from "@/email/send";

export type FormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const SERVICE_CATEGORIES = [
  "electrician",
  "plumber",
  "tutor",
  "developer",
  "painter",
  "carpenter",
  "it-support",
  "mover",
  "barber",
  "photographer",
  "gardener",
  "security",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  electrician: "Electrician",
  plumber: "Plumber",
  tutor: "Tutor",
  developer: "Developer",
  painter: "Painter",
  carpenter: "Carpenter",
  "it-support": "IT Support",
  mover: "Mover",
  barber: "Barber",
  photographer: "Photographer",
  gardener: "Gardener",
  security: "Security",
};

export async function getExistingProData() {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) return null;

  try {
    const profileRes = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, stackUser.id))
      .limit(1);

    if (profileRes.length === 0 || !profileRes[0].isPro) return null;

    const serviceRes = await db
      .select()
      .from(services)
      .where(eq(services.proId, stackUser.id))
      .limit(1);

    return {
      profile: profileRes[0],
      service: serviceRes.length > 0 ? serviceRes[0] : null,
    };
  } catch (err) {
    console.error("Failed to fetch existing pro data:", err);
    return null;
  }
}

export async function createProProfile(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Authenticate the user
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    return { success: false, error: "You must be signed in to become a pro." };
  }

  // 2. Extract form data
  const bio = formData.get("bio") as string | null;
  const phone = formData.get("phone") as string | null;
  const profileImage = formData.get("profileImage") as File | null;
  const categoryId = formData.get("categoryId") as string | null;
  const serviceTitle = formData.get("serviceTitle") as string | null;
  const serviceDescription = formData.get("serviceDescription") as string | null;
  const priceStr = formData.get("price") as string | null;
  const address = formData.get("address") as string | null;

  // 3. Validate required fields
  const fieldErrors: Record<string, string> = {};

  if (!bio || bio.trim().length < 20) {
    fieldErrors.bio = "Bio must be at least 20 characters.";
  }
  if (!phone || phone.trim().length < 6) {
    fieldErrors.phone = "Please enter a valid phone number.";
  }
  if (!categoryId || !SERVICE_CATEGORIES.includes(categoryId as any)) {
    fieldErrors.categoryId = "Please select a service category.";
  }
  if (!serviceTitle || serviceTitle.trim().length < 5) {
    fieldErrors.serviceTitle = "Service title must be at least 5 characters.";
  }
  if (!serviceDescription || serviceDescription.trim().length < 20) {
    fieldErrors.serviceDescription =
      "Service description must be at least 20 characters.";
  }
  if (!priceStr || isNaN(Number(priceStr)) || Number(priceStr) <= 0) {
    fieldErrors.price = "Please enter a valid price greater than 0.";
  }
  if (!address || address.trim().length < 3) {
    fieldErrors.address = "Please enter your service area / address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the errors below.", fieldErrors };
  }

  // AI Content Moderation
  const moderationText = `${bio} ${serviceTitle} ${serviceDescription}`;
  const moderationResult = await moderateContent(moderationText);
  if (!moderationResult.isSafe) {
    return {
      success: false,
      error: `Content flagged: ${moderationResult.reason || "Violates community guidelines."}`,
    };
  }

  try {
    // 4. Upload profile image to Vercel Blob (if provided)
    let profileImageUrl = stackUser.profileImageUrl;

    if (profileImage && profileImage.size > 0) {
      if (profileImage.size > 4 * 1024 * 1024) {
        return {
          success: false,
          fieldErrors: {
            profileImage: "Image must be less than 4MB.",
          },
        };
      }

      // Image upload is optional. If it fails (e.g. missing Blob token in local dev),
      // continue profile creation with the existing profile image URL.
      try {
        const blob = await put(
          `profiles/${stackUser.id}/${profileImage.name}`,
          profileImage,
          {
            access: "public",
            allowOverwrite: true,
          }
        );
        profileImageUrl = blob.url;

        // Sync the new image back to StackAuth so the UserButton updates
        try {
          await stackUser.update({ profileImageUrl });
        } catch (e) {
          console.warn("Could not update Stack profile picture:", e);
        }
      } catch (e) {
        console.warn("Profile image upload failed; continuing without new image:", e);
      }
    }

    // 5. Upsert user in the users table (in case sync hasn't run yet)
    await db
      .insert(users)
      .values({
        id: stackUser.id,
        email: stackUser.primaryEmail!,
        name: stackUser.displayName ?? null,
        profileImageUrl: profileImageUrl ?? null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          id: stackUser.id,
          email: stackUser.primaryEmail!,
          name: stackUser.displayName ?? null,
          profileImageUrl: profileImageUrl ?? null,
        },
      });

    // 6. Upsert profile (set isPro = true, save bio & phone)
    await db
      .insert(profiles)
      .values({
        userId: stackUser.id,
        isPro: true,
        bio: bio!.trim(),
        phone: phone!.trim(),
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          isPro: true,
          bio: bio!.trim(),
          phone: phone!.trim(),
        },
      });

    // 7. Upsert the service listing
    const priceInCents = Math.round(Number(priceStr) * 100);

    const existingService = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.proId, stackUser.id))
      .limit(1);

    if (existingService.length > 0) {
      // Update existing service
      await db.update(services)
        .set({
          title: serviceTitle!.trim(),
          description: serviceDescription!.trim(),
          price: priceInCents,
          address: address!.trim(),
          // Note: We intentionally do NOT update categoryId to lock it in
        })
        .where(eq(services.id, existingService[0].id));
    } else {
      // Insert new service
      await db.insert(services).values({
        proId: stackUser.id,
        categoryId: categoryId!,
        title: serviceTitle!.trim(),
        description: serviceDescription!.trim(),
        price: priceInCents,
        address: address!.trim(),
      });
    }

    // 8. Invalidate Redis caches so new data appears immediately
    await cacheInvalidate(
      CACHE_KEYS.featuredPros,
      CACHE_KEYS.categoryCounts,
    );
    // Also clear any cached services queries (pattern: services:*)
    try {
      const keys = await redis.keys("services:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (e) {
      console.warn("[become-pro] Could not clear services cache:", e);
    }

    revalidatePath("/");
    revalidatePath("/services");

    // Send pro signup confirmation email (non-blocking)
    if (stackUser.primaryEmail) {
      try {
        await sendProSignupEmail(
          stackUser.primaryEmail,
          stackUser.displayName || "Professional",
          serviceTitle!.trim(),
          CATEGORY_LABELS[categoryId!] || categoryId!
        );
      } catch (e) {
        console.warn("[become-pro] Pro confirmation email failed (non-blocking):", e);
      }
    }
  } catch (err) {
    console.error("[become-pro] Error creating pro profile:", err);
    const message = err instanceof Error ? err.message : String(err);
    
    if (message.includes("users_email_unique")) {
      return {
        success: false,
        error: "An account with this email already exists from a previous login session. Please use a different email or clean up your database.",
      };
    }
    
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }

  redirect("/");
}
