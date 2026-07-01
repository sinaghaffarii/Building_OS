import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Building OS API is running on port ${env.PORT}`);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down...");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
});
