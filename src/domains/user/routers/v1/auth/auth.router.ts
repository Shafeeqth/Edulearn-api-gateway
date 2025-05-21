import { asyncHandler } from "../../../../../utils/async-handler";
import { Router } from "express";
import { AuthController } from "../../../../../domains/user/controllers/v1/auth.controller";

const router = Router();

const authController = new AuthController();

router.post(
  "/register",
  asyncHandler(authController.registerUser.bind(authController))
);

router.post(
  "/auth2",
  asyncHandler(authController.auth2Sign.bind(authController))
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
  asyncHandler(authController.getNewRefreshToken.bind(authController))
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
  asyncHandler(authController.resendOtp.bind(authController))
);

export { router as authRouter };
