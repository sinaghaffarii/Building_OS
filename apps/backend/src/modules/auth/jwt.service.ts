import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

export type AccessTokenPayload = {
  sub: string;
  mobile: string;
};

export type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
};

const accessTokenOptions: SignOptions = {
  expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
};

const refreshTokenOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, accessTokenOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshTokenOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    throw new AppError("Invalid or expired access token", 401, "INVALID_OR_EXPIRED_ACCESS_TOKEN");
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    throw new AppError("Invalid or expired refresh token", 401, "INVALID_OR_EXPIRED_REFRESH_TOKEN");
  }
}
