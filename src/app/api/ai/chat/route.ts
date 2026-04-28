import { streamText, type ModelMessage } from "ai";
import { getAiModel } from "@/lib/ai";

type ChatInputMessage = {
  parts?: Array<{ type?: string; text?: string }>;
  content?: unknown;
  role?: "system" | "user" | "assistant";
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: unknown[] = Array.isArray(body?.messages) ? body.messages : [];

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missing chat messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a helpful assistant for ProNear, a local services marketplace. 
    You help customers find professionals, understand pricing, and navigate the platform. 
    Keep your answers concise, friendly, and helpful. 
    If a user asks for services, you can suggest they search for things like 'electrician', 'plumber', 'tutor', 'developer', etc.
    Do not make up fake professionals or specific pricing. Give general advice.`;

    const normalizedMessages: ModelMessage[] = messages
      .map((message) => {
      const chatMessage = message as ChatInputMessage;

      if (chatMessage.role !== "system" && chatMessage.role !== "user" && chatMessage.role !== "assistant") {
        return null;
      }

      const textFromParts = Array.isArray(chatMessage.parts)
        ? chatMessage.parts
            .filter((part) => part?.type === "text" && typeof part.text === "string")
            .map((part) => part.text)
            .join(" ")
        : "";

      const content =
        typeof chatMessage.content === "string"
          ? chatMessage.content
          : textFromParts;

      if (!content.trim()) {
        return null;
      }

      return {
        role: chatMessage.role,
        content,
      } as ModelMessage;
    })
      .filter((message): message is ModelMessage => message !== null);

    const result = streamText({
      model: getAiModel("gemini-2.5-flash"),
      system: systemPrompt,
      messages: normalizedMessages,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to communicate with AI chat";
    return new Response(
      JSON.stringify({
        error:
          process.env.NODE_ENV === "production"
            ? "Failed to communicate with AI chat"
            : message,
      }),
      {
      status: 500,
      headers: { "Content-Type": "application/json" },
      }
    );
  }
}
