import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import db from "@/db";
import { conversations, messages, users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const stackUser = await stackServerApp.getUser();
  if (!stackUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = parseInt(searchParams.get("conversationId") ?? "0");

  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  }

  try {
    // Verify participation
    const [convo] = await db
      .select({
        customerId: conversations.customerId,
        proId: conversations.proId,
      })
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!convo) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      stackUser.id !== convo.customerId &&
      stackUser.id !== convo.proId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch messages
    const rows = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderName: users.name,
        senderImage: users.profileImageUrl,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    // Auto-mark incoming messages as read
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

    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("[GET /api/messages] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
