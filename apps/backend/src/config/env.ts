import "dotenv/config";
function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

function getNumberEnv(key: string, fallback?: number): number {
  const value = process.env[key];

  if (!value) {
    if (fallback === undefined) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return fallback;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  return numberValue;
}

export const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getNumberEnv("PORT", 4000),

  DATABASE_URL: getEnv("DATABASE_URL"),

  REDIS_HOST: getEnv("REDIS_HOST", "localhost"),
  REDIS_PORT: getNumberEnv("REDIS_PORT", 6379),

  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),

  OTP_EXPIRES_MINUTES: getNumberEnv("OTP_EXPIRES_MINUTES", 2),
};
