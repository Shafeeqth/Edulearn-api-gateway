import { asyncHandler } from "../../../../../utils/async-handler";
import { cacheMiddleware } from "../../../../../middlewares/cache.middleware";
import { Router } from "express";
import { authenticate } from "../../../../../middlewares/auth.middleware";
import { AuthController } from "../../../../../domains/user/controllers/v1/auth.controller";

const router = Router();

const authController = new AuthController();

router.post("/register", asyncHandler(authController.registerUser.bind(authController)));

router.post("/email-exist", asyncHandler(authController.registerUser.bind(authController)));

router.post("/login", asyncHandler(authController.loginUser.bind(authController)));

router.post("/refresh", authenticate, asyncHandler(authController.getNewRefreshToken.bind(authController)));

router.post("/verify", asyncHandler(authController.verifyUser.bind(authController)));

router.post("/resend-otp", asyncHandler(authController.resendOtp.bind(authController)));


export { router as authRouter };
