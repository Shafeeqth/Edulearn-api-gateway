import { adminRouter } from "../../domains/admin/routers/v1/users/users.router";
import { Router } from "express";

const router = Router();
router.use("/admin", adminRouter);

export { router as adminRouterV1 };
