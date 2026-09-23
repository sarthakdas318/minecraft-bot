import { tavily } from "@tavily/core";

const tavilyAPIKey = process.env.TAVILY_API_KEY;

if (!tavilyAPIKey) {
    console.error("Missing Tavily API key. Check .env");
  return false;
}

export async function askTavily(query) {
  try {
    const client = tavily({ apiKey: tavilyAPIKey });
    const response = await client.search(query, {
      includeAnswer: "basic",
      searchDepth: "advanced",
    });
    console.log(response.answer);
    return response.answer;
  } catch (error) {
    console.error(error?.message);
    return false; // return false to indicate failure so the ai reply with his own training data
  }
}
