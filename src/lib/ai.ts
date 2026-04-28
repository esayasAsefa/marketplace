import { google } from "@ai-sdk/google";

// The AI provider instance configured for Gemini
// You can use the model string like "gemini-2.5-flash"
export const getAiModel = (modelName: string = "gemini-2.5-flash") => {
  return google(modelName);
};
