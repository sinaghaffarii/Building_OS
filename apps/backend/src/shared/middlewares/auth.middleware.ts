import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../../modules/auth/jwt.service";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return next(new AppError("Authorization header is required", 401, "AUTHORIZATION_REQUIRED"));
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(
        new AppError("Invalid authorization header", 401, "INVALID_AUTHORIZATION_HEADER"),
      );
    }

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      mobile: payload.mobile,
      token: payload,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
