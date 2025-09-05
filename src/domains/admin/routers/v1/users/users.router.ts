import { asyncHandler } from "@/shared/utils/async-handler";
import { cacheMiddleware } from "@/middlewares/cache.middleware";
import { AdminController } from "../../../controllers/v1/user.controller";
import { Router } from "express";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();

const userController = new AdminController();

router.get(
  "/users",
  authenticate,
  asyncHandler(userController.getAllUsers.bind(userController))
);

router.delete(
  "/users/:userId",
  authenticate,
  asyncHandler(userController.blockUser.bind(userController))
);

router.patch(
  "/users/:userId",
  authenticate,
  asyncHandler(userController.unBlockUser.bind(userController))
);

router.get(
  "/users/:userId",
  authenticate,
  asyncHandler(userController.blockUser.bind(userController))
);

export { router as adminRouter };
