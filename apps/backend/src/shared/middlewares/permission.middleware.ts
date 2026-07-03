import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";

export function requirePermission(permission: string) {
  return function permissionMiddleware(req: Request, _res: Response, next: NextFunction) {
    if (!req.user) {
      throw new AppError("Authentication is required", 401, "AUTHENTICATION_REQUIRED");
    }

    if (!req.tenant) {
      throw new AppError("Tenant context is required", 400, "TENANT_CONTEXT_REQUIRED");
    }

    const hasPermission = req.tenant.permissions.includes(permission);

    if (!hasPermission) {
      throw new AppError(
        "You do not have permission to perform this action",
        403,
        "PERMISSION_DENIED",
      );
    }

    return next();
  };
}

export function requireAnyPermission(permissions: string[]) {
  return function anyPermissionMiddleware(req: Request, _res: Response, next: NextFunction) {
    if (!req.user) {
      throw new AppError("Authentication is required", 401, "AUTHENTICATION_REQUIRED");
    }

    if (!req.tenant) {
      throw new AppError("Tenant context is required", 400, "TENANT_CONTEXT_REQUIRED");
    }

    const hasAnyPermission = permissions.some((permission) =>
      req.tenant!.permissions.includes(permission),
    );

    if (!hasAnyPermission) {
      throw new AppError("You do not have any required permission", 403, "PERMISSION_DENIED");
    }

    return next();
  };
}

export function requireAllPermissions(permissions: string[]) {
  return function allPermissionsMiddleware(req: Request, _res: Response, next: NextFunction) {
    if (!req.user) {
      throw new AppError("Authentication is required", 401, "AUTHENTICATION_REQUIRED");
    }

    if (!req.tenant) {
      throw new AppError("Tenant context is required", 400, "TENANT_CONTEXT_REQUIRED");
    }

    const hasAllPermissions = permissions.every((permission) =>
      req.tenant!.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new AppError("You do not have all required permissions", 403, "PERMISSION_DENIED");
    }

    return next();
  };
}
