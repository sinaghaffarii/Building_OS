import type { NextFunction, Request, Response } from "express";
import { logger } from "../../config/logger";
import { AppError } from "../errors/app-error";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "ROUTE_NOT_FOUND"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    logger.warn({
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });

    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  logger.error(error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
  });
}
