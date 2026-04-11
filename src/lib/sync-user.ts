import "server-only";
import { stackServerApp } from "@/stack";
import db from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Syncs the currently logged-in StackAuth user to the Neon `users` table.
 * - If the user doesn't exist in the DB, inserts them.
 * - If they already exist, updates their name/email/profile image.
 * - If no user is logged in, does nothing.
 */
export async function syncCurrentUser() {
  const stackUser = await stackServerApp.getUser();

  if (!stackUser) {
    return null; // No logged-in user
  }

  const { id, primaryEmail, displayName, profileImageUrl } = stackUser;

  if (!primaryEmail) {
    console.warn("[sync-user] User has no primary email, skipping sync.");
    return null;
  }

  // Upsert: insert if not exists, update if exists
  const [synced] = await db
    .insert(users)
    .values({
      id,
      email: primaryEmail,
      name: displayName ?? null,
      profileImageUrl: profileImageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: primaryEmail,
        name: displayName ?? null,
        profileImageUrl: profileImageUrl ?? null,
      },
    })
    .returning();

  return synced;
}
