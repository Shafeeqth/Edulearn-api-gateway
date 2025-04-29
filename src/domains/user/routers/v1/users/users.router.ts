import { asyncHandler } from "../../../../../utils/async-handler";
import { cacheMiddleware } from "../../../../../middlewares/cache.middleware";
import { UserController } from "../../../controllers/v1/user.controller";
import { Router } from "express";

const router = Router();

const userController = new UserController();

router.post("/me", asyncHandler(userController.getCurrentUser.bind(userController)));



export { router as userRouter };
