import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getAiModel } from "@/lib/ai";
import db from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { serviceId } = await req.json();

    const serviceResults = await db
      .select({ title: services.title, categoryId: services.categoryId })
      .from(services)
      .where(eq(services.id, parseInt(serviceId, 10)))
      .limit(1);

    if (serviceResults.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    const svc = serviceResults[0];

    const { object } = await generateObject({
      model: getAiModel("gemini-2.5-flash"),
      schema: z.object({
        suggestedTime: z.string().describe("A suggested time of day/week naturally (e.g., 'Weekday mornings', 'Weekends')"),
        reason: z.string().describe("Why this time is best (e.g. 'Plumbing repairs are less disruptive during the morning.')"),
      }),
      prompt: `For the local service category '${svc.categoryId}' (specifically '${svc.title}'), when is typically the best or most common time a customer should schedule this service? Give a short reason.`,
      temperature: 0.3,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[schedule-suggestion] Error:", error);
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}
