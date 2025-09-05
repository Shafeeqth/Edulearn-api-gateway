import { authRouter } from "../../domains/auth/routers/v1/auth.router";
import {Router} from "express";

const router = Router();
router.use("/auth", authRouter);

export {router as authRouterV1};