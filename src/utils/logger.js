const prefix = (level) => `[${new Date().toISOString()}] [${level}]`;

const isProd = process.env.NODE_ENV === "production";

export const logger = {
  info: (...args) => console.log(prefix("INFO"), ...args),
  debug: (...args) => {
    if (!isProd) console.log(prefix("DEBUG"), ...args);
  },
  warn: (...args) => console.warn(prefix("WARN"), ...args),
  error: (...args) => console.error(prefix("ERROR"), ...args),
  game: (...args) => {
    if (!isProd) console.log(prefix("GAME"), ...args);
  },
  sent: (...args) => {
    if (!isProd) console.log(prefix("SENT"), ...args);
  },
};
