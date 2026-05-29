import "server-only";
import { stackServerApp } from "@/stack";
import db from "@/db";
import { users } from "@/db/schema";
import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "@/cache";
import { sendWelcomeEmail } from "@/email/send";

/**
 * Syncs the currently logged-in StackAuth user to the Neon `users` table.
 * - If the user doesn't exist in the DB, inserts them.
 * - If they already exist, updates their name/email/profile image.
 * - If no user is logged in, does nothing.
 *
 * Uses Redis to skip the DB upsert if the user was synced recently.
 * Also sends a welcome email on first-ever sync (fire-and-forget).
 */
export async function syncCurrentUser() {
  let stackUser;
  try {
    stackUser = await stackServerApp.getUser();
  } catch (err) {
    // StackAuth API can return 500 intermittently — don't crash the page
    console.warn("[sync-user] StackAuth getUser() failed:", err instanceof Error ? err.message : err);
    return null;
  }

  if (!stackUser) {
    return null; // No logged-in user
  }

  const { id, primaryEmail, displayName, profileImageUrl } = stackUser;

  const email = primaryEmail;

  if (!email) {
    console.warn("[sync-user] User has no primary email, skipping sync.");
    return null;
  }

  // Check Redis — skip everything if we synced this user recently
  const cacheKey = CACHE_KEYS.userSynced(id);
  const alreadySynced = await cacheGet<boolean>(cacheKey);
  if (alreadySynced) {
    return null; // Already synced within TTL, skip DB + email
  }

  // Fire-and-forget welcome email (don't block page rendering)
  const fireWelcomeEmail = () => {
    const welcomeKey = CACHE_KEYS.welcomeSent(id);
    cacheGet<boolean>(welcomeKey).then((alreadyWelcomed) => {
      if (alreadyWelcomed) return;

      // Mark as welcomed IMMEDIATELY to prevent retries on next page load
      cacheSet(welcomeKey, true, 365 * 24 * 60 * 60).catch(() => {});

      sendWelcomeEmail(email, displayName || "")
        .then((result) => {
          if (!result.success) {
            console.warn("[sync-user] Welcome email send failed:", result.error);
          }
        })
        .catch((e) => {
          console.warn("[sync-user] Welcome email failed (non-blocking):", e);
        });
    }).catch(() => {});
  };

  try {
    // Upsert: insert if not exists, update if exists
    const [synced] = await db
      .insert(users)
      .values({
        id,
        email,
        name: displayName ?? null,
        profileImageUrl: profileImageUrl ?? null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          id,
          email,
          name: displayName ?? null,
          profileImageUrl: profileImageUrl ?? null,
        },
      })
      .returning();

    // Mark as synced in Redis
    await cacheSet(cacheKey, true, TTL.userSynced);

    // Fire welcome email without blocking
    fireWelcomeEmail();

    return synced;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Existing data may already contain this email under a different user id.
    // Do not block login flow.
    if (message.includes("users_email_unique")) {
      console.warn("[sync-user] Email already exists in users table; skipping DB upsert for this session.");
      await cacheSet(cacheKey, true, TTL.userSynced);
      return null;
    }

    // Keep the page functional if the database is temporarily unreachable.
    console.warn("[sync-user] Failed to sync user to database:", error);
    return null;
  }
}
