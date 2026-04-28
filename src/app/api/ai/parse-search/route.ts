import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getAiModel } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: getAiModel("gemini-2.5-flash"),
      schema: z.object({
        category: z.string().nullable().describe("One of the official categories, e.g., 'electrician', 'plumber', 'tutor', 'developer', 'painter', 'carpenter', 'it-support', 'mover', 'barber', 'photographer', 'gardener', 'security'. If none perfectly matches, return null."),
        keywords: z.array(z.string()).describe("A list of 2-3 essential keywords from the query for full-text search"),
        urgency: z.enum(["low", "medium", "high"]).describe("The estimated urgency of the request based on language (e.g. 'emergency', 'now', 'today' means high)"),
      }),
      prompt: `Extract structured information from the following search query from a local services marketplace: "${query}"`,
      temperature: 0.1,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[parse-search] Error:", error);
    return NextResponse.json({ error: "Failed to parse search query" }, { status: 500 });
  }
}
