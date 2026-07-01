import { prisma } from "../../database/prisma";import { AppError } from "../../shared/errors/app-error";
import { compareHash, hashValue, sha256 } from "../../shared/utils/crypto";
import { createOtpCode, verifyOtpCode } from "./otp.service";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./jwt.service";

export async function requestOtp(mobile: string) {
  return createOtpCode(mobile, "LOGIN");
}

export async function verifyOtp(mobile: string, code: string) {
  const isOtpValid = await verifyOtpCode(mobile, code, "LOGIN");

  if (!isOtpValid) {
    throw new AppError("Invalid or expired OTP code", 401, "INVALID_OR_EXPIRED_OTP");
  }

  const user = await prisma.user.upsert({
    where: {
      mobile,
    },
    update: {
      lastLoginAt: new Date(),
    },
    create: {
      mobile,
      firstName: "User",
      lastName: mobile,
      fullName: mobile,
      status: "ACTIVE",
      lastLoginAt: new Date(),
    },
  });

  const refreshTokenRecord = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: "pending",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    mobile: user.mobile,
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: refreshTokenRecord.id,
  });

  await prisma.refreshToken.update({
    where: {
      id: refreshTokenRecord.id,
    },
    data: {
      tokenHash: await hashValue(sha256(refreshToken)),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      mobile: user.mobile,
      fullName: user.fullName,
      status: user.status,
    },
  };
}

export async function refreshAuthToken(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: {
      id: payload.tokenId,
    },
    include: {
      user: true,
    },
  });

  if (!tokenRecord) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (tokenRecord.userId !== payload.sub) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (tokenRecord.revokedAt) {
    throw new AppError("Refresh token revoked", 401, "REFRESH_TOKEN_REVOKED");
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401, "REFRESH_TOKEN_EXPIRED");
  }

  const isTokenHashValid = await compareHash(sha256(refreshToken), tokenRecord.tokenHash);

  if (!isTokenHashValid) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  const accessToken = signAccessToken({
    sub: tokenRecord.user.id,
    mobile: tokenRecord.user.mobile,
  });

  return {
    accessToken,
  };
}

export async function logout(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: {
      id: payload.tokenId,
    },
  });

  if (!tokenRecord) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (tokenRecord.userId !== payload.sub) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  if (tokenRecord.revokedAt) {
    throw new AppError("Refresh token already revoked", 401, "REFRESH_TOKEN_ALREADY_REVOKED");
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401, "REFRESH_TOKEN_EXPIRED");
  }

  const isTokenHashValid = await compareHash(sha256(refreshToken), tokenRecord.tokenHash);

  if (!isTokenHashValid) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }

  await prisma.refreshToken.update({
    where: {
      id: tokenRecord.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return {
    success: true,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      mobile: true,
      email: true,
      firstName: true,
      lastName: true,
      fullName: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
}
