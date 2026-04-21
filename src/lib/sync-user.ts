import "server-only";
import { stackServerApp } from "@/stack";
import db from "@/db";
import { users } from "@/db/schema";
import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "@/cache";

/**
 * Syncs the currently logged-in StackAuth user to the Neon `users` table.
 * - If the user doesn't exist in the DB, inserts them.
 * - If they already exist, updates their name/email/profile image.
 * - If no user is logged in, does nothing.
 *
 * Uses Redis to skip the DB upsert if the user was synced recently.
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

  // Check Redis — skip the DB write if we synced this user recently
  const cacheKey = CACHE_KEYS.userSynced(id);
  const alreadySynced = await cacheGet<boolean>(cacheKey);
  if (alreadySynced) {
    return null; // Already synced within TTL, skip DB call
  }

  try {
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
          id,
          email: primaryEmail,
          name: displayName ?? null,
          profileImageUrl: profileImageUrl ?? null,
        },
      })
      .returning();

    // Mark as synced in Redis
    await cacheSet(cacheKey, true, TTL.userSynced);

    return synced;
  } catch (error) {
    // Keep the page functional if the database is temporarily unreachable.
    console.error("[sync-user] Failed to sync user to database:", error);
    return null;
  }
}

