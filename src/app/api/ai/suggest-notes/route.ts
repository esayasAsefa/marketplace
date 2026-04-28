import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getAiModel } from "@/lib/ai";
import db from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stackServerApp } from "@/stack";

export async function POST(req: Request) {
  // 1. Authenticate
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { serviceId } = await req.json();

    if (!serviceId) {
      return NextResponse.json({ error: "Missing serviceId" }, { status: 400 });
    }

    // Fetch service info
    const serviceResults = await db
      .select({ title: services.title, categoryId: services.categoryId })
      .from(services)
      .where(eq(services.id, parseInt(serviceId, 10)))
      .limit(1);

    if (serviceResults.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const svc = serviceResults[0];

    const prompt = `A customer is about to book a professional for the following service on our marketplace:
Category: \${svc.categoryId}
Title: \${svc.title}

Write a short, suggestive prompt or template (2-3 sentences max) to help the customer fill out the "Project Details / Notes" box.
It should prompt them to include details the professional would find useful. 
For example, for a plumber: "Please describe the issue. Is it a leak or a clog? Where is it located (e.g. kitchen sink)? Do you know the pipe material?"
Make sure it sounds helpful and concise. Do NOT include phrases like "Here is a template". Just provide the text itself.`;

    const result = await generateText({
      model: getAiModel("gemini-2.5-flash"),
      prompt: prompt,
      temperature: 0.6,
    });

    return NextResponse.json({
      suggestion: result.text,
    });

  } catch (error) {
    console.error("[suggest-notes] Error:", error);
    return NextResponse.json({ error: "Failed to suggest notes" }, { status: 500 });
  }
}
