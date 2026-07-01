import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

export async function requestOtpController(req: Request, res: Response, next: NextFunction) {
  try {
    const { mobile } = req.body as { mobile?: string };

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "mobile is required"
      });
    }

    const result = await authService.requestOtp(mobile);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyOtpController(req: Request, res: Response, next: NextFunction) {
  try {
    const { mobile, code } = req.body as { mobile?: string; code?: string };

    if (!mobile || !code) {
      return res.status(400).json({
        success: false,
        message: "mobile and code are required"
      });
    }

    const result = await authService.verifyOtp(mobile, code);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

export async function refreshTokenController(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "refreshToken is required"
      });
    }

    const result = await authService.refreshAuthToken(refreshToken);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

export async function logoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "refreshToken is required"
      });
    }

    const result = await authService.logout(refreshToken);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const result = await authService.getMe(req.user.id);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return next(error);
  }
}
