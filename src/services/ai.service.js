import OpenAI from "openai";
import { config } from "../config/index.js";
import { AI_SYSTEM_PROMPT } from "../config/constants.js";
import { logger } from "../utils/logger.js";

let openai = null;

function getClient() {
  if (openai) return openai;
  if (!config.ai.baseURL || !config.ai.apiKey) {
    logger.error("AI client not configured: missing baseURL/apiKey");
    return null;
  }
  openai = new OpenAI({
    baseURL: config.ai.baseURL,
    apiKey: config.ai.apiKey,
  });
  return openai;
}

export async function askAI(query) {
  try {
    const client = getClient();
    if (!client) return "AI is not configured.";

    const completion = await client.chat.completions.create({
      model: config.ai.model,
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content?.trim() || "No response from AI."
    );
  } catch (err) {
    logger.error("AI API error:", err?.message);
    return "Sorry, I couldn't process your request right now.";
  }
}
