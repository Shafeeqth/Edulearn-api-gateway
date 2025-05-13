import { asyncHandler } from "../../../../../utils/async-handler";
import { cacheMiddleware } from "../../../../../middlewares/cache.middleware";
import { AdminController } from "../../../controllers/v1/user.controller";
import { Router } from "express";
import { authenticate } from "../../../../../middlewares/auth.middleware";

const router = Router();

const userController = new AdminController();

router.get(
  "/",
  authenticate,
  asyncHandler(userController.getAllUsers.bind(userController))
);

router.delete(
  "/:id",
  authenticate,
  asyncHandler(userController.blockUser.bind(userController))
);

router.get(
  "/:id",
  authenticate,
  asyncHandler(userController.blockUser.bind(userController))
);

export { router as adminRouter };
