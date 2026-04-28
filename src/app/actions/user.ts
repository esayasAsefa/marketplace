"use server";

import { stackServerApp } from "@/stack";
import db from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Check whether the currently authenticated user has a Pro profile.
 * Returns `true` if the user exists in the profiles table with isPro = true.
 */
export async function checkUserIsPro(): Promise<boolean> {
  let stackUser;
  try {
    stackUser = await stackServerApp.getUser();
  } catch {
    // StackAuth API may be down — fail gracefully
    return false;
  }
  if (!stackUser) return false;

  try {
    const result = await db
      .select({ isPro: profiles.isPro })
      .from(profiles)
      .where(eq(profiles.userId, stackUser.id))
      .limit(1);

    return result.length > 0 && result[0].isPro;
  } catch (err) {
    console.error("[checkUserIsPro] Error:", err);
    return false;
  }
}
