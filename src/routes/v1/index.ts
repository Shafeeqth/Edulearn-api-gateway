import {Router} from "express";
import { userRouterV1 } from "./user.router";
import { authRouterV1 } from "./auth.router";
import { adminRouterV1 } from "./admin.router";

const router = Router();
router.use(userRouterV1);
router.use(authRouterV1);
router.use(adminRouterV1);

export {router as routerV1};