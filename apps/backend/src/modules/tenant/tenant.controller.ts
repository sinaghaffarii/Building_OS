import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/app-error";

export async function tenantContextController(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError("Authentication is required", 401, "AUTHENTICATION_REQUIRED");
  }

  if (!req.tenant) {
    throw new AppError("Tenant context is required", 400, "TENANT_CONTEXT_REQUIRED");
  }

  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
      tenant: req.tenant
    }
  });
}
