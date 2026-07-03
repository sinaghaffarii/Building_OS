import { Router } from "express";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { requireTenant } from "../../shared/middlewares/tenant.middleware";
import { asyncHandler } from "../../shared/middlewares/async-handler";
import { tenantContextController } from "./tenant.controller";
import { requirePermission } from "../../shared/middlewares/permission.middleware";

const router = Router();

router.get(
  "/context",
  requireAuth,
  asyncHandler(requireTenant),
  asyncHandler(tenantContextController),
);

router.get(
  "/debug/units-read",
  requireAuth,
  asyncHandler(requireTenant),
  requirePermission("units.read"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "You have units.read permission",
      data: {
        roleKey: req.tenant?.roleKey,
        permissions: req.tenant?.permissions,
      },
    });
  },
);

router.get(
  "/debug/super-admin-only",
  requireAuth,
  asyncHandler(requireTenant),
  requirePermission("superAdmin.dashboard.read"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "You have super admin permission",
    });
  },
);

export const tenantRoutes = router;
