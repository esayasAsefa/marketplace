import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getAiModel } from "@/lib/ai";
import db from "@/db";
import { bookings, services } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { stackServerApp } from "@/stack";

export async function GET(req: Request) {
  try {
    const user = await stackServerApp.getUser();
    
    // If not logged in or no history, we could return generic recommendations, but we want personalized
    if (!user) {
      return NextResponse.json({ recommendations: null });
    }

    // Fetch user's recent bookings to understand their needs
    const userBookings = await db
      .select({ 
        category: services.categoryId, 
        title: services.title 
      })
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.customerId, user.id))
      .orderBy(desc(bookings.createdAt))
      .limit(5);

    if (userBookings.length === 0) {
      return NextResponse.json({ recommendations: null });
    }

    const historyText = userBookings.map(b => `${b.category}: ${b.title}`).join(", ");

    const { object } = await generateObject({
      model: getAiModel("gemini-2.5-flash"),
      schema: z.object({
        category: z.string().describe("The recommended category based on their history (e.g., 'plumber', 'painter', 'cleaner')"),
        reason: z.string().describe("A friendly 1-sentence reason why this is recommended (e.g., 'Since you recently hired an electrician, you might also need a painter for touch-ups.')"),
        searchQuery: z.string().describe("A suggested search term for this recommendation"),
      }),
      prompt: `A user has recently booked the following services on our local marketplace:
      ${historyText}

      Suggest exactly ONE new service category they might need next.
      For example, if they hired a mover, they might need a cleaner or a carpenter. If they hired a plumber, they might need a painter.
      Make the reason friendly and personalized.`,
      temperature: 0.7,
    });

    return NextResponse.json({ recommendations: object });

  } catch (error) {
    console.error("[recommendations] Error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
