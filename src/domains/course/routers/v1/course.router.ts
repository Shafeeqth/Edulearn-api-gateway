import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { CourseController } from '../../controllers/v1/course.controller';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

const courseController = new CourseController();

//  ============================================================================
//                               COURSE ROUTES
//  ============================================================================

router.get(
  '/',
  asyncHandler(courseController.getCourses.bind(courseController))
);

router.get(
  '/instructor/:instructorId',
  authenticate,
  asyncHandler(courseController.getCoursesByInstructor.bind(courseController))
);

router.get(
  '/:courseId',
  asyncHandler(courseController.getCourse.bind(courseController))
);

router.get(
  '/slug/:slug',
  asyncHandler(courseController.getCourseBySlug.bind(courseController))
);

router.patch(
  '/:courseId',
  authenticate,
  asyncHandler(courseController.updateCourse.bind(courseController))
);

router.post(
  '/',
  authenticate,
  asyncHandler(courseController.createCourse.bind(courseController))
);

router.delete(
  '/:courseId',
  authenticate,
  asyncHandler(courseController.deleteCourse.bind(courseController))
);

// router.get(
//   '/:courseId/related',
//   authenticate,
//   asyncHandler(courseController.relatedCourses.bind(courseController))
// );

// router.post(
//   '/:courseId/enroll',
//   authenticate,
//   asyncHandler(courseController.enrollInCourse.bind(courseController))
// );

// router.get(
//   '/featured',
//   authenticate,
//   asyncHandler(courseController.getFeaturedCourses.bind(courseController))
// );

//  ============================================================================
//                               SECTION ROUTES
//  ============================================================================

router.post(
  '/:courseId/sections/:sectionId',
  authenticate,
  asyncHandler(courseController.getSection.bind(courseController))
);

router.get(
  '/:courseId/sections/',
  asyncHandler(courseController.getSectionsByCourse.bind(courseController))
);

router.post(
  '/:courseId/sections/',
  authenticate,
  asyncHandler(courseController.createSection.bind(courseController))
);

router.patch(
  '/:courseId/sections/:sectionId',
  authenticate,
  asyncHandler(courseController.updateSection.bind(courseController))
);

router.delete(
  '/:courseId/sections/:sectionId',
  authenticate,
  asyncHandler(courseController.deleteSection.bind(courseController))
);

//  ============================================================================
//                               LESSON ROUTES
//  ============================================================================

router.get(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  asyncHandler(courseController.getLesson.bind(courseController))
);

router.get(
  '/:courseId/sections/:sectionId/lessons',
  authenticate,
  asyncHandler(courseController.getLessonsBySection.bind(courseController))
);

router.post(
  '/:courseId/sections/:sectionId/lessons',
  authenticate,
  asyncHandler(courseController.createLesson.bind(courseController))
);

router.patch(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  asyncHandler(courseController.updateLesson.bind(courseController))
);

router.delete(
  '/:courseId/sections/:sectionId/lessons/:lessonId',
  authenticate,
  asyncHandler(courseController.deleteLesson.bind(courseController))
);

//  ============================================================================
//                               QUIZ ROUTES
//  ============================================================================

router.get(
  '/:courseId/sections/:sectionId/quizzes',
  asyncHandler(courseController.getQuizzesByCourse.bind(courseController))
);

router.get(
  '/:courseId/sections/:sectionId/quizzes/:quizId',
  asyncHandler(courseController.getQuiz.bind(courseController))
);

router.post(
  '/:courseId/sections/:sectionId/quizzes',
  authenticate,
  asyncHandler(courseController.createQuiz.bind(courseController))
);

router.delete(
  '/:courseId/sections/:sectionId/quizzes/:quizId',
  authenticate,
  asyncHandler(courseController.deleteQuiz.bind(courseController))
);

router.patch(
  '/:courseId/sections/:sectionId/quizzes/:quizId',
  authenticate,
  asyncHandler(courseController.updateQuiz.bind(courseController))
);

export { router as courseRouter };
