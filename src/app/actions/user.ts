"use server";

import { stackServerApp } from "@/stack";
import db from "@/db";
import { profiles, conversations, messages } from "@/db/schema";
import { eq, or, and, ne, sql } from "drizzle-orm";
import { cacheGet, cacheSet, CACHE_KEYS, TTL } from "@/cache";

/**
 * Check whether the currently authenticated user has a Pro profile.
 * Heavily cached function for fast response.
 */
export async function checkUserIsPro(): Promise<boolean> {
  let stackUser;
  try {
    stackUser = await stackServerApp.getUser();
  } catch {
    return false;
  }
  if (!stackUser) return false;

  const cacheKey = CACHE_KEYS.isPro(stackUser.id);
  const cached = await cacheGet<boolean>(cacheKey);
  if (cached !== null) return cached;

  try {
    const result = await db
      .select({ isPro: profiles.isPro })
      .from(profiles)
      .where(eq(profiles.userId, stackUser.id))
      .limit(1);

    const isPro = result.length > 0 && result[0].isPro;
    await cacheSet(cacheKey, isPro, TTL.isPro);
    return isPro;
  } catch (err) {
    console.error("[checkUserIsPro] Error:", err);
    return false;
  }
}

/**
 * Aggegator for Navbar to prevent multiple slow server actions running in parallel.
 * Retrieves both isPro status and unreadCount securely via cache and/or DB.
 */
export async function getNavbarState(): Promise<{ isPro: boolean; unreadCount: number }> {
  let stackUser;
  try {
    stackUser = await stackServerApp.getUser();
  } catch {
    return { isPro: false, unreadCount: 0 };
  }
  if (!stackUser) return { isPro: false, unreadCount: 0 };

  const userId = stackUser.id;

  const [isPro, unreadCount] = await Promise.all([
    (async () => {
      const cacheKey = CACHE_KEYS.isPro(userId);
      const cached = await cacheGet<boolean>(cacheKey);
      if (cached !== null) return cached;
      try {
        const result = await db
          .select({ isPro: profiles.isPro })
          .from(profiles)
          .where(eq(profiles.userId, userId))
          .limit(1);
        const isProAns = result.length > 0 && result[0].isPro;
        await cacheSet(cacheKey, isProAns, TTL.isPro);
        return isProAns;
      } catch { return false; }
    })(),
    (async () => {
      const cacheKey = CACHE_KEYS.unreadCount(userId);
      const cached = await cacheGet<number>(cacheKey);
      if (cached !== null) return cached;
      try {
        const userConvos = await db
          .select({ id: conversations.id })
          .from(conversations)
          .where(or(eq(conversations.customerId, userId), eq(conversations.proId, userId)));

        if (userConvos.length === 0) return 0;

        const convoIds = userConvos.map((c) => c.id);
        const [result] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(messages)
          .where(
            and(
              sql`${messages.conversationId} IN (${sql.join(convoIds.map((id) => sql`${id}`), sql`, `)})`,
              ne(messages.senderId, userId),
              eq(messages.isRead, false)
            )
          );
        const count = result?.count ?? 0;
        await cacheSet(cacheKey, count, TTL.unreadCount);
        return count;
      } catch { return 0; }
    })()
  ]);

  return { isPro, unreadCount };
}
