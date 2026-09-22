import { askAI } from "../../services/ai.service.js";
import { logger } from "../../utils/logger.js";

export function createChatHandler(getClient, sendChat) {
  return async (packet) => {
    try {
      const client = getClient();
      logger.debug(
        `Text event: type=${packet.type} from=${packet.source_name} msg=${packet.message}`
      );

      if (packet.type !== "chat") return;
      if (client && packet.source_name === client.username) return;

      const msg = packet.message?.trim() || "";
      if (!msg.toLowerCase().startsWith("bot ")) return;

      const question = msg.slice(4).trim();
      if (!question) {
        sendChat("Usage: bot <question>");
        return;
      }

      logger.game(`${packet.source_name} asked: ${question}`);

      const answer = await askAI(question);
      logger.game(`AI answer: ${answer}`);

      sendChat(answer);
      logger.game(`Replied to ${packet.source_name}: ${answer}`);
    } catch (err) {
      logger.error("Error handling text event:", err?.message ?? err);
    }
  };
}
