import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getAiModel } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    // Clean up data URL if present
    const base64Data = imageBase64.replace(/^data:image\/\\w+;base64,/, "");

    const { object } = await generateObject({
      model: getAiModel("gemini-2.5-flash"),
      schema: z.object({
        isHighQuality: z.boolean().describe("Whether the image looks like a clear, high-quality, professional photo suitable for a marketplace listing."),
        feedback: z.string().describe("Friendly feedback (e.g. 'Great photo!', or 'A bit blurry, try using a well-lit headshot.')"),
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Does this image look like a good, clear, professional profile picture for a local services marketplace?' },
            {
              type: 'image',
              image: Buffer.from(base64Data, "base64"),
            },
          ],
        },
      ],
      temperature: 0.1,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("[analyze-image] Error:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
