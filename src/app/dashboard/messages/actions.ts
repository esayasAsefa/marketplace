"use server";

import { stackServerApp } from "@/stack";
import db from "@/db";
import {
  conversations,
  messages,
  bookings,
  services,
  users,
} from "@/db/schema";
import { eq, and, or, desc, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cacheGet, cacheSet, cacheInvalidate, CACHE_KEYS, TTL } from "@/cache";

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

export type ConversationItem = {
  id: number;
  bookingId: number;
  serviceTitle: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserEmail: string;
  otherUserImage: string | null;
  lastMessageAt: string;
  lastMessageContent: string | null;
  unreadCount: number;
};

export type MessageItem = {
  id: number;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
  senderName: string | null;
  senderImage: string | null;
};

/**
 * Get all conversations for the authenticated user (as customer or pro).
 */
export async function getConversations(): Promise<ConversationItem[]> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) return [];

  const cacheKey = CACHE_KEYS.conversations(stackUser.id);
  const cached = await cacheGet<ConversationItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const rows = await db
      .select({
        id: conversations.id,
        bookingId: conversations.bookingId,
        customerId: conversations.customerId,
        proId: conversations.proId,
        lastMessageAt: conversations.lastMessageAt,
        serviceTitle: services.title,
      })
      .from(conversations)
      .innerJoin(bookings, eq(conversations.bookingId, bookings.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(
        or(
          eq(conversations.customerId, stackUser.id),
          eq(conversations.proId, stackUser.id)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    // For each conversation, get the other user's info & last message
    const result: ConversationItem[] = [];
    for (const row of rows) {
      const otherUserId =
        row.customerId === stackUser.id ? row.proId : row.customerId;

      const [otherUser] = await db
        .select({
          name: users.name,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      // Get last message
      const [lastMsg] = await db
        .select({ content: messages.content })
        .from(messages)
        .where(eq(messages.conversationId, row.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Count unread messages (messages not from me and unread)
      const [unread] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, row.id),
            ne(messages.senderId, stackUser.id),
            eq(messages.isRead, false)
          )
        );

      result.push({
        id: row.id,
        bookingId: row.bookingId,
        serviceTitle: row.serviceTitle,
        otherUserId,
        otherUserName: otherUser?.name ?? null,
        otherUserEmail: otherUser?.email ?? "",
        otherUserImage: otherUser?.profileImageUrl ?? null,
        lastMessageAt: row.lastMessageAt.toISOString(),
        lastMessageContent: lastMsg?.content ?? null,
        unreadCount: unread?.count ?? 0,
      });
    }

    await cacheSet(cacheKey, result, TTL.conversations);
    return result;
  } catch (err) {
    console.error("[getConversations] Error:", err);
    return [];
  }
}

/**
 * Get or create a conversation for a booking.
 * Returns the conversation ID.
 */
export async function getOrCreateConversation(
  bookingId: number
): Promise<ActionResult> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    // Check if conversation already exists for this booking
    const existing = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.bookingId, bookingId))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, data: { conversationId: existing[0].id } };
    }

    // Look up the booking to get customer + pro
    const [booking] = await db
      .select({
        customerId: bookings.customerId,
        proId: services.proId,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found." };
    }

    // Verify the current user is part of this booking
    if (
      stackUser.id !== booking.customerId &&
      stackUser.id !== booking.proId
    ) {
      return {
        success: false,
        error: "You are not authorized for this booking.",
      };
    }

    // Create the conversation
    const [newConvo] = await db
      .insert(conversations)
      .values({
        bookingId,
        customerId: booking.customerId,
        proId: booking.proId,
      })
      .returning({ id: conversations.id });

    // Invalidate caches
    await cacheInvalidate(
      CACHE_KEYS.conversations(booking.customerId),
      CACHE_KEYS.conversations(booking.proId)
    );

    return { success: true, data: { conversationId: newConvo.id } };
  } catch (err) {
    console.error("[getOrCreateConversation] Error:", err);
    return { success: false, error: "Something went wrong." };
  }
}

/**
 * Get messages for a conversation. Verifies the user is a participant.
 */
export async function getMessages(
  conversationId: number
): Promise<MessageItem[]> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) return [];

  try {
    // Verify user is a participant
    const [convo] = await db
      .select({
        customerId: conversations.customerId,
        proId: conversations.proId,
      })
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!convo) return [];
    if (
      stackUser.id !== convo.customerId &&
      stackUser.id !== convo.proId
    ) {
      return [];
    }

    const rows = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        attachmentUrl: messages.attachmentUrl,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderName: users.name,
        senderImage: users.profileImageUrl,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("[getMessages] Error:", err);
    return [];
  }
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(
  conversationId: number,
  content: string,
  attachmentUrl?: string
): Promise<ActionResult> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    return { success: false, error: "Not authenticated." };
  }

  const trimmed = content.trim();
  if ((!trimmed && !attachmentUrl) || trimmed.length > 2000) {
    return {
      success: false,
      error: "Message must be valid and under 2000 characters.",
    };
  }

  try {
    // Verify user is a participant
    const [convo] = await db
      .select({
        customerId: conversations.customerId,
        proId: conversations.proId,
      })
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!convo) {
      return { success: false, error: "Conversation not found." };
    }
    if (
      stackUser.id !== convo.customerId &&
      stackUser.id !== convo.proId
    ) {
      return { success: false, error: "Not authorized." };
    }

    // Insert message
    await db.insert(messages).values({
      conversationId,
      senderId: stackUser.id,
      content: trimmed,
      attachmentUrl: attachmentUrl || null,
    });

    // Update conversation lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    // Determine the other user for cache invalidation
    const otherUserId =
      convo.customerId === stackUser.id ? convo.proId : convo.customerId;

    // Invalidate relevant caches
    await cacheInvalidate(
      CACHE_KEYS.conversationMessages(conversationId),
      CACHE_KEYS.conversations(stackUser.id),
      CACHE_KEYS.conversations(otherUserId),
      CACHE_KEYS.unreadCount(otherUserId)
    );

    revalidatePath("/dashboard/messages");

    return { success: true };
  } catch (err) {
    console.error("[sendMessage] Error:", err);
    return { success: false, error: "Failed to send message." };
  }
}

/**
 * Mark all messages in a conversation as read (those not sent by the current user).
 */
export async function markAsRead(
  conversationId: number
): Promise<ActionResult> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, stackUser.id),
          eq(messages.isRead, false)
        )
      );

    await cacheInvalidate(
      CACHE_KEYS.unreadCount(stackUser.id),
      CACHE_KEYS.conversations(stackUser.id)
    );

    return { success: true };
  } catch (err) {
    console.error("[markAsRead] Error:", err);
    return { success: false, error: "Failed to mark as read." };
  }
}

/**
 * Get total unread message count for the authenticated user (for navbar badge).
 */
export async function getUnreadCount(): Promise<number> {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) return 0;

  const cacheKey = CACHE_KEYS.unreadCount(stackUser.id);
  const cached = await cacheGet<number>(cacheKey);
  if (cached !== null) return cached;

  try {
    // Get all conversation IDs where this user is a participant
    const userConvos = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        or(
          eq(conversations.customerId, stackUser.id),
          eq(conversations.proId, stackUser.id)
        )
      );

    if (userConvos.length === 0) return 0;

    const convoIds = userConvos.map((c) => c.id);

    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(
        and(
          sql`${messages.conversationId} IN (${sql.join(
            convoIds.map((id) => sql`${id}`),
            sql`, `
          )})`,
          ne(messages.senderId, stackUser.id),
          eq(messages.isRead, false)
        )
      );

    const count = result?.count ?? 0;
    await cacheSet(cacheKey, count, TTL.unreadCount);
    return count;
  } catch (err) {
    console.error("[getUnreadCount] Error:", err);
    return 0;
  }
}
