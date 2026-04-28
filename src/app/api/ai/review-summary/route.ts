import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getAiModel } from "@/lib/ai";
import db from "@/db";
import { reviews, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import redis from "@/cache";

export async function POST(req: Request) {
  try {
    const { serviceId } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ error: "Missing serviceId" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `review_summary:${serviceId}`;
    const cachedSummary = await redis.get(cacheKey);
    if (cachedSummary) {
      return NextResponse.json({ summary: cachedSummary });
    }

    // Fetch reviews from DB
    const serviceReviews = await db
      .select({ comment: reviews.comment, rating: reviews.rating })
      .from(reviews)
      .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
      .where(eq(bookings.serviceId, parseInt(serviceId, 10)));

    if (serviceReviews.length < 2) {
       return NextResponse.json({ summary: null, status: "Not enough reviews to summarize." });
    }

    // Combine reviews into a single text
    const reviewData = serviceReviews
      .filter((r) => r.comment && r.comment.length > 5)
      .map((r) => `Rating: ${r.rating}/5 - "${r.comment}"`)
      .join("\\n");

    const prompt = `Analyze the following customer reviews for a local service professional.
    Summarize the overall customer sentiment, highlight 1-2 common praises, and mention any common complaints if they exist.
    Keep the summary to exactly 2 short sentences. Make it sound like a quick "Review Highlight".
    
    Reviews:
    ${reviewData}`;

    const result = await generateText({
      model: getAiModel("gemini-2.5-flash"),
      prompt: prompt,
      temperature: 0.3,
    });

    const generatedSummary = result.text;

    // Cache the summary for 24 hours (86400 seconds)
    await redis.setex(cacheKey, 86400, generatedSummary);

    return NextResponse.json({ summary: generatedSummary });

  } catch (error) {
    console.error("[review-summary] Error:", error);
    return NextResponse.json({ error: "Failed to generate review summary" }, { status: 500 });
  }
}
