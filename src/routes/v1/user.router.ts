import { blocklistMiddleware } from "../../middlewares/blocklist.middleware";
import { userRouter } from "../../domains/user/routers/v1/users/users.router";
import {Router} from "express";

const router = Router();
router.use("/users",  userRouter);

export {router as userRouterV1};