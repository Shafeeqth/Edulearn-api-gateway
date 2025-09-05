import { Router } from 'express';
import { userRouterV1 } from './user.router';
import { authRouterV1 } from './auth.router';
import { uploaderRouterV1 } from './upload.router';
import { adminRouterV1 } from './admin.router';
import { courseRouterV1 } from './course.router';

const router = Router();
router.use(userRouterV1);
router.use(authRouterV1);
router.use(uploaderRouterV1);
router.use(courseRouterV1);
// router.use(adminRouterV1);

export { router as routerV1 };
