import { prisma } from "../../database/prisma";
import { env } from "../../config/env";
import { generateRandomNumericCode, hashValue, compareHash } from "../../shared/utils/crypto";

export async function createOtpCode(mobile: string, purpose: "LOGIN") {
  const code = generateRandomNumericCode(6);
  const codeHash = await hashValue(code);

  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      mobile,
      codeHash,
      purpose,
      expiresAt
    }
  });

  if (env.NODE_ENV === "development") {
    console.log(`[DEV OTP] mobile=${mobile} code=${code}`);
  }

  return {
    expiresAt
  };
}

export async function verifyOtpCode(mobile: string, code: string, purpose: "LOGIN") {
  const otp = await prisma.otpCode.findFirst({
    where: {
      mobile,
      purpose,
      consumedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!otp) {
    return false;
  }

  const isValid = await compareHash(code, otp.codeHash);

  await prisma.otpCode.update({
    where: {
      id: otp.id
    },
    data: {
      attemptCount: {
        increment: 1
      },
      consumedAt: isValid ? new Date() : null
    }
  });

  return isValid;
}
