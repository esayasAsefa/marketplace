import { generateObject } from "ai";
import { z } from "zod";
import { getAiModel } from "@/lib/ai";

export async function moderateContent(text: string): Promise<{ isSafe: boolean; reason?: string }> {
  try {
    const { object } = await generateObject({
      model: getAiModel("gemini-2.5-flash"),
      schema: z.object({
        isSafe: z.boolean().describe("True if the content is safe, false if it contains fraud, spam, severe profanity, or PII (SSN, credit cards). Phone numbers and general locations are fine."),
        reason: z.string().optional().describe("If isSafe is false, explain why concisely."),
      }),
      prompt: `Analyze the following profile content for a marketplace professional and determine if it is safe to publish.
      Content: "${text}"`,
      temperature: 0.1,
    });

    return object;
  } catch (error) {
    console.error("[ai-moderation] Error:", error);
    // Default to safe if AI fails, so we don't block users unnecessarily
    return { isSafe: true };
  }
}
