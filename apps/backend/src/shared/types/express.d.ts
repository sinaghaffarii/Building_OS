import type { AccessTokenPayload } from "../../modules/auth/jwt.service";
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        mobile: string;
        token: AccessTokenPayload;
      };
      tenant?: {
        buildingId: string;
        organizationId: string;
        membershipId: string;
        roleId: string;
        roleKey: string;
        permissions: string[];
      };
    }
  }
}

export {};
