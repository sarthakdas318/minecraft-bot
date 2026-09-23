import { tavily } from "@tavily/core";

export async function askTavily(query) {
  const tavilyAPIKey = process.env.TAVILY_API_KEY;
  if (!tavilyAPIKey) {
    console.error("Missing Tavily API key. Check .env -skipping realtime search.");
    return false;
  }
  try {
    const client = tavily({ apiKey: tavilyAPIKey });
    const response = await client.search(query, {
      includeAnswer: "basic",
      searchDepth: "advanced",
    });
    console.log(response.answer);
    // Tavily returns { answer, results, ... } - prefer answer, fallback to results snippet
    if (response.answer) return response.answer;
    if (response.results?.length) {
      return response.results
        .slice(0, 3)
        .map((r) => r.content)
        .join("\n");
    }
    return false;
  } catch (error) {
    console.error(error?.message);
    return false; // return false to indicate failure so the ai reply with his own training data
  }
}
