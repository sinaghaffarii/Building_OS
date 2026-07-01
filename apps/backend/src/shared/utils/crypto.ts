import crypto from "node:crypto";
import bcrypt from "bcryptjs";

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function hashValue(value: string): Promise<string> {
  return bcrypt.hash(value, 10);
}

export async function compareHash(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}

export function generateRandomNumericCode(length = 6): string {
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += Math.floor(Math.random() * 10).toString();
  }

  return code;
}
