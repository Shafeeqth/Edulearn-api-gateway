import { authRouter } from "../../domains/user/routers/v1/auth/auth.router";
import {Router} from "express";

const router = Router();
router.use("/auth", authRouter);

export {router as authRouterV1};