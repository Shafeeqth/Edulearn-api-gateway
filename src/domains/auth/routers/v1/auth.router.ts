import { asyncHandler } from "@/shared/utils/async-handler";
import { Router } from "express";
import { AuthController } from "@/domains/auth/controllers/v1/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { blocklistMiddleware } from "@/middlewares/blocklist.middleware";


const router = Router();

const authController = new AuthController();

router.post(
  "/register",
  asyncHandler(authController.registerUser.bind(authController))
);

router.post(
  "/oauth",
  asyncHandler(authController.oauthSign.bind(authController))
);

router.post(
  "/email-check",
  asyncHandler(authController.checkEmailAvailability.bind(authController))
);

router.post(
  "/login",
  asyncHandler(authController.loginUser.bind(authController))
);

router.post(
  "/logout",
  asyncHandler(authController.logoutUser.bind(authController))
);

router.post(
  "/refresh",
  asyncHandler(authController.refreshToken.bind(authController))
);

router.post(
  "/verify",
  asyncHandler(authController.verifyUser.bind(authController))
);

router.post(
  "/resend-otp",
  asyncHandler(authController.resendOtp.bind(authController))
);

router.post(
  "/reset-password",
  asyncHandler(authController.resetPassword.bind(authController))
);

router.post(
  "/change-password",
  authenticate,
  // blocklistMiddleware,
  asyncHandler(authController.changePassword.bind(authController))
);

router.post(
  "/forgot-password",
  // authenticate,
  // blocklistMiddleware,
  asyncHandler(authController.forgotPassword.bind(authController))
);
export { router as authRouter };
