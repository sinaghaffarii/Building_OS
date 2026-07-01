import { Router } from "express";
import {
  logoutController,
  meController,
  refreshTokenController,
  requestOtpController,
  verifyOtpController,
} from "./auth.controller";
import { requireAuth } from "../../shared/middlewares/auth.middleware";

const router = Router();

router.post("/request-otp", requestOtpController);
router.post("/verify-otp", verifyOtpController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);

export const authRoutes = router;
