import { config } from "./config/index.js";
import { createApp } from "./web/app.js";
import { botManager } from "./bot/BotManager.js";
import { logger } from "./utils/logger.js";

const app = createApp();
const { port, host } = config.server;

app.listen(port, host, async () => {
  logger.info(`Server started on http://${host}:${port}`);
  try {
    await botManager.connect();
  } catch (err) {
    logger.error("Failed to connect bot:", err.message);
  }
});
