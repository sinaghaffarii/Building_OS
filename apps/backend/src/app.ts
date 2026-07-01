import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import { logger } from "./config/logger";
import { authRoutes } from "./modules/auth/auth.routes";
import { errorHandler, notFoundHandler } from "./shared/middlewares/error.middleware";

export const app = express();

app.use(
  pinoHttp({
    logger,
  }),
);

app.use(helmet());
app.use(cors());
app.use(compression());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "building-os-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
