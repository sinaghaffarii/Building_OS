import type { AccessTokenPayload } from "../../modules/auth/jwt.service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        mobile: string;
        token: AccessTokenPayload;
      };
    }
  }
}

export {};
