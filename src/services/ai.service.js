import OpenAI from "openai";
import { config } from "../config/index.js";
import { AI_SYSTEM_PROMPT } from "../config/constants.js";
import { logger } from "../utils/logger.js";
import { askTavily } from "../bot/tavily.js";

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

const TAVILY_TOOL = {
  type: "function",
  function: {
    name: "askTavily",
    description:
      "Search the web for realtime, up-to-date information via Tavily. Call this when the user asks about current events, news, weather, prices, sports scores, recent releases, or any topic that requires realtime data beyond your training cutoff. Pass the user's query (or an optimized search query) as input.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query - the user question or an optimized search query for realtime data",
        },
      },
      required: ["query"],
    },
  },
};

const TOOL_SYSTEM_PROMPT =
  AI_SYSTEM_PROMPT +
  `\n\nTool usage: You have access to askTavily. When the user asks for realtime / current / latest information, you MUST call askTavily with the user query. Do not hallucinate recent facts - use the tool.`;

export async function askAI(query) {
  try {
    const client = getClient();
    if (!client) return "AI is not configured.";

    const messages = [
      { role: "system", content: TOOL_SYSTEM_PROMPT },
      { role: "user", content: query },
    ];

    // First completion - allow model to decide to call tool
    let completion;
    try {
      completion = await client.chat.completions.create({
        model: config.ai.model || "auto",
        messages,
        temperature: 0.7,
        tools: [TAVILY_TOOL],
        tool_choice: "auto",
      });
    } catch (err) {
      // Fallback for providers that don't support tools
      logger.warn("Tool calling not supported, retrying without tools:", err?.message);
      completion = await client.chat.completions.create({
        model: config.ai.model,
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
        temperature: 0.7,
      });
      return completion.choices[0]?.message?.content?.trim() || "No response from AI.";
    }

    let msg = completion.choices[0]?.message;

    // Handle tool calls loop (max 3 iterations to avoid infinite loop)
    let iterations = 0;
    while (msg?.tool_calls?.length && iterations < 3) {
      iterations++;
      // Append assistant tool_calls to history
      messages.push(msg);

      for (const toolCall of msg.tool_calls) {
        if (toolCall.function.name === "askTavily") {
          let args = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}");
          } catch (_) {
            args = { query };
          }
          const searchQuery = args.query || query;
          logger.info(`AI requested askTavily: "${searchQuery}"`);
          const result = await askTavily(searchQuery);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result
              ? String(result)
              : "Tavily search failed or returned no results. Fall back to your own training data and inform the user the realtime search was unavailable.",
          });
        } else {
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: "Unknown tool",
          });
        }
      }

      completion = await client.chat.completions.create({
        model: config.ai.model,
        messages,
        temperature: 0.7,
        tools: [TAVILY_TOOL],
        tool_choice: "auto",
      });
      msg = completion.choices[0]?.message;

      // If no more tool calls, break and return content
      if (!msg?.tool_calls?.length) break;
    }

    return msg?.content?.trim() || "No response from AI.";
  } catch (err) {
    logger.error("AI API error:", err?.message);
    return "Sorry, I couldn't process your request right now.";
  }
}
