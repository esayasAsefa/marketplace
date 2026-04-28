import { streamText } from "ai";
import { getAiModel } from "@/lib/ai";
import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";

export async function POST(req: Request) {
  // 1. Authenticate (optional, but good practice for abusive limits)
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { category, title, type } = await req.json();

    if (!category || !title || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let prompt = "";
    if (type === "bio") {
      prompt = `You are a professional profile writer for a local services marketplace called ProNear. 
A professional is setting up their profile.
Category: ${category}
Service Title: ${title}

Write a compelling, trustworthy "About Me" bio (around 3-4 sentences). 
Focus on their expertise, reliability, and commitment to quality. Keep it in the first person ("I am...").
Do NOT use placeholders like [Your Name]. Just dive right into the bio. Make it realistic.`;
    } else if (type === "service") {
      prompt = `You are a service listing copywriter for a local services marketplace called ProNear.
A professional is defining a specific service they offer.
Category: ${category}
Service Title: ${title}

Write a professional, clear, and appealing service description (around 3-4 sentences).
Highlight what is typically included, the value to the customer, and assure high-quality results. Keep it in the first person ("I provide...").
Do NOT use placeholders. Keep it actionable and descriptive.`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const result = streamText({
      model: getAiModel("gemini-2.5-flash"),
      prompt: prompt,
      temperature: 0.7,
    });

    return new Response(result.textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[generate-description] Error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
