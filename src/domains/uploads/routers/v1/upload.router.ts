import { asyncHandler } from '@/shared/utils/async-handler';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { UploaderService } from '../../controllers/v1/upload.controller';

const router = Router();

const uploaderService = new UploaderService();

router.post(
  '/avatar/signature',
  authenticate,
  asyncHandler(
    uploaderService.getPreSignedAvatarUploadUrl.bind(uploaderService)
  )
);
router.post(
  '/course/signature',
  authenticate,
  asyncHandler(
    uploaderService.getPreSignedCourseUploadUrl.bind(uploaderService)
  )
);
router.post(
  '/course/secure/signature',
  authenticate,
  asyncHandler(
    uploaderService.getPreSignedCourseSecureUploadUrl.bind(uploaderService)
  )
);
router.post(
  '/course/secure/content',
  authenticate,
  asyncHandler(
    uploaderService.getSecureSignedCourseUrl.bind(uploaderService)
  )
);
router.post(
  '/course/secure/signature/multipart/init',
  authenticate,
  asyncHandler(uploaderService.multipartSignInit.bind(uploaderService))
);
router.post(
  '/course/secure/signature/multipart/parts',
  authenticate,
  asyncHandler(uploaderService.multipartSignGetParts.bind(uploaderService))
);
router.post(
  '/course/secure/signature/multipart/complete',
  authenticate,
  asyncHandler(uploaderService.multipartSignComplete.bind(uploaderService))
);
router.post(
  '/course/secure/signature/multipart/abort',
  authenticate,
  asyncHandler(uploaderService.multipartSignAbort.bind(uploaderService))
);

export { router as uploaderRouter };
