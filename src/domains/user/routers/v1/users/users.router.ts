import { asyncHandler } from "../../../../../utils/async-handler";
import { cacheMiddleware } from "../../../../../middlewares/cache.middleware";
import { UserController } from "../../../controllers/v1/user.controller";
import { Router } from "express";
import { authenticate } from "../../../../../middlewares/auth.middleware";
import { blocklistMiddleware } from "../../../../../middlewares/blocklist.middleware";

const router = Router();

const userController = new UserController();

router.get(
  "/",
  authenticate,
  blocklistMiddleware,
  asyncHandler(userController.getAllUsers.bind(userController))
);

router.get(
  "/me",
  authenticate,
  blocklistMiddleware,
  asyncHandler(userController.getCurrentUser.bind(userController))
);

router.patch(
  "/:userId/change-password",
  authenticate,
  blocklistMiddleware,
  asyncHandler(userController.changePassword.bind(userController))
);
router.patch(
  "/:userId",
  authenticate,
  blocklistMiddleware,
  asyncHandler(userController.updateUserData.bind(userController))
);

router.get(
  "/:userId",
  authenticate,
  asyncHandler(userController.getDetailedUser.bind(userController))
);

router.post(
  "/instructors/register",
  authenticate,
  asyncHandler(userController.registerInstructor.bind(userController))
);

router.post(
  "/reset-password",
  authenticate,
  blocklistMiddleware,
  asyncHandler(userController.getCurrentUser.bind(userController))
);

router.post(
  "/forget-password",
  authenticate,
  blocklistMiddleware,
  asyncHandler(userController.getCurrentUser.bind(userController))
);

export { router as userRouter };
