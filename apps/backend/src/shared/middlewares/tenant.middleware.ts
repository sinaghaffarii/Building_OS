import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prisma";
import { AppError } from "../errors/app-error";
import { getRolePermissionKeys } from "../../modules/rbac/permission.helper";

export async function requireTenant(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError("Authentication is required", 401, "AUTHENTICATION_REQUIRED");
    }

    const buildingIdHeader = req.headers["x-building-id"];
    const buildingId = Array.isArray(buildingIdHeader) ? buildingIdHeader[0] : buildingIdHeader;

    if (!buildingId || typeof buildingId !== "string") {
      throw new AppError("X-Building-Id header is required", 400, "BUILDING_ID_REQUIRED");
    }

    const membership = await prisma.buildingMember.findFirst({
      where: {
        buildingId,
        userId: req.user.id,
        status: "ACTIVE",
        deletedAt: null,
        building: {
          status: "ACTIVE",
          deletedAt: null
        }
      },
      select: {
        id: true,
        buildingId: true,
        roleId: true,
        role: { select: { key: true } },
        building: { select: { organizationId: true } }
      }
    });

    if (!membership) {
      throw new AppError("You do not have access to this building", 403, "BUILDING_ACCESS_DENIED");
    }

    const permissions = await getRolePermissionKeys(membership.roleId);

    req.tenant = {
      buildingId: membership.buildingId,
      organizationId: membership.building.organizationId,
      membershipId: membership.id,
      roleId: membership.roleId,
      roleKey: membership.role.key,
      permissions
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
