import { NextResponse } from "next/server";
import db from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { getAiModel } from "@/lib/ai";
import { stackServerApp } from "@/stack";

export async function POST(req: Request) {
  // 1. Authenticate
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, title } = await req.json();

    if (!categoryId) {
      return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });
    }

    // Fetch existing services in this category to calculate stats
    const existingServices = await db
      .select({ price: services.price })
      .from(services)
      .where(eq(services.categoryId, categoryId));

    let statsStr = "No data available in your area yet for this category.";
    let minPrice = 0;
    let maxPrice = 0;
    let avgPrice = 0;

    if (existingServices.length > 0) {
      const prices = existingServices.map((s) => s.price / 100); // Prices are in cents
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
      avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      statsStr = `Min: ETB ${minPrice}, Max: ETB ${maxPrice}, Average: ETB ${Math.round(avgPrice)}`;
    }

    const prompt = `You are an expert pricing consultant for a local services marketplace.
A professional is trying to price their service.
Category: ${categoryId}
Service Title: ${title || "unspecified"}
Platform Data for this category: ${statsStr}

Given this information, provide a short, 1-2 sentence recommendation on how they should price their service in ETB. 
Be encouraging and practical. If there is no data, suggest a reasonable baseline for the profession in ETB.`;

    const result = await generateText({
      model: getAiModel("gemini-2.5-flash"),
      prompt: prompt,
      temperature: 0.5,
    });

    return NextResponse.json({
      recommendation: result.text,
      stats: {
        min: minPrice,
        max: maxPrice,
        avg: Math.round(avgPrice),
        count: existingServices.length,
      }
    });

  } catch (error) {
    console.error("[price-recommendation] Error:", error);
    return NextResponse.json({ error: "Failed to generate price recommendation" }, { status: 500 });
  }
}
