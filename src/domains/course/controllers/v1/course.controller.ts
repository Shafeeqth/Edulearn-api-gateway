import { UserService } from '../../../service-clients/user';
import { Request, Response } from 'express';
import validateSchema from '../../../../services/validate-schema';

import { HttpStatus } from '@/shared/constants/http-status';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { NotificationService } from '@/domains/service-clients/notification';
import { MetadataManager } from '@/shared/utils/metadata-manager';
import { CourseService } from '@/domains/service-clients/course';
import { createCourseSchema } from '../../validators/course/create-course.schema';
import { updateCourseSchema } from '../../validators/course/update-current-course.schema';
import {
  ContentMetaData,
  CourseData,
  EnrollmentData,
  LessonData,
  ProgressData,
  QuizData,
  ReviewData,
  SectionData,
} from '@/domains/service-clients/course/proto/generated/course_service';
import { getLessonSchema } from '../../validators/lesson/get-lesson.schema';
import { deleteSectionSchema } from '../../validators/section/delete-section.schema';
import { updateSectionSchema } from '../../validators/section/update-section.schema';
import { getCourseByInstructorSchema } from '../../validators/course/get-course-by-instructor.schema';
import { getCourseSchema } from '../../validators/course/get-course.schema';
import { getCoursesSchema } from '../../validators/course/get-courses.schema';
import { getEnrolledCoursesSchema } from '../../validators/course/get-enrolled-courses.schema';
import { getSectionSchema } from '../../validators/section/get-section.schema';
import { getSectionsByCourseSchema } from '../../validators/section/get-section-by-courseId.schema';
import { createLessonSchema } from '../../validators/lesson/create-lesson.schema';
import { deleteLessonSchema } from '../../validators/lesson/delete-lesson.schema';
import { updateLessonSchema } from '../../validators/lesson/update-lesson.schema';
import { getLessonsBySectionSchema } from '../../validators/lesson/get-lessons-by-section.schema';
import { getQuizzesByCourseSchema } from '../../validators/quiz/get-quiz-by-courseId.schema';
import { getQuizSchema } from '../../validators/quiz/get-quiz.schema';
import { createQuizSchema } from '../../validators/quiz/create-quiz.schema';
import { deleteQuizSchema } from '../../validators/quiz/delete-quiz.schema';
import { updateQuizSchema } from '../../validators/quiz/update-quiz.schema';
import { createSectionSchema } from '../../validators/section/create-section.schema';
import { Observe } from '@/services/observability/decorators';
import { getCourseBySlugSchema } from '../../validators/course/get-course-by-slug.schema';

@Observe({ logLevel: 'debug' })
export class CourseController {
  private userServiceClient: UserService;
  private notificationService: NotificationService;
  private courseServiceClient: CourseService;

  constructor() {
    this.userServiceClient = UserService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.courseServiceClient = CourseService.getInstance();
  }

  async createCourse(req: Request, res: Response) {
    // console.log(JSON.stringify(req.body, null, 2));

    const {
      instructorId,
      category,
      durationValue,
      durationUnit,
      language,
      level,
      subCategory,
      subtitle,
      subtitleLanguage,
      title,
      topics,
      instructor,
    } = validateSchema(
      { ...req.body, instructorId: req.user?.userId!, instructor: req.user },
      createCourseSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { course } = await this.courseServiceClient.createCourse(
      {
        category,
        durationUnit,
        durationValue,
        instructorId,
        language,
        level,
        subCategory,
        subTitle: subtitle,
        subtitleLanguage,
        title,
        topics,
        instructor,
      },
      { metadata: metadata.metadata }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.CREATED)
      .success(
        this.mapCourseToResponse(course!),
        'Course has been successfully created'
      );
  }

  async updateCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params, instructorId: req.user?.userId },
      updateCourseSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { course } = await this.courseServiceClient.updateCourse(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapCourseToResponse(course!),
        'Course updated successfully'
      );
  }

  async getCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getCourseSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { course } = await this.courseServiceClient.getCourse(validPayload, {
      metadata: metadata.metadata,
    });

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapCourseToResponse(course!),
        'Course fetched successfully'
      );
  }
  async getCourseBySlug(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getCourseBySlugSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { course } = await this.courseServiceClient.getCoursesBySlug(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapCourseToResponse(course!),
        'Course fetched successfully'
      );
  }

  async getCoursesByInstructor(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getCourseByInstructorSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { courses } = await this.courseServiceClient.getCoursesByInstructor(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );
    const mappedCourses = courses?.courses.map(this.mapCourseToResponse);

    // // Batch fetch users to reduce N requests -> naive implementation: parallel fetch with dedupe
    // const mappedCourses = courses?.courses.map(this.mapCourseToResponse);
    // const instructorIds = Array.from(
    //   new Set(mappedCourses?.map(c => c.instructorId!))
    // );
    // const usersMap: Record<string, any> = {};
    // const promiseErrors: Error[] = [];
    // await Promise.all(
    //   instructorIds.map(async (userId: string) => {
    //     try {
    //       const { user } = await this.userServiceClient.getUser({ userId });
    //       usersMap[userId] = {
    //         avatar: user?.avatar,
    //         id: user?.userId,
    //         name: `${user?.firstName} ${user?.lastName}`,
    //       };
    //     } catch (error) {
    //       promiseErrors.push(error as Error);
    //     }
    //   })
    // );
    // if (promiseErrors.length !== 0) {
    //   throw AggregateError(
    //     promiseErrors,
    //     'Error while trying to merge instructor data with course id'
    //   );
    // }

    const instructorIds = Array.from(
      new Set(mappedCourses?.map(c => c.instructorId!))
    );
    let usersMap: Record<string, any> = {};

    const { success } = await this.userServiceClient.getUsersByIds({
      userIds: instructorIds,
    });

    usersMap = success?.users.reduce((userMap: typeof usersMap, user) => {
      userMap[user.userId] = {
        avatar: user.avatar,
        id: user.userId,
        name: `${user.firstName} ${user.lastName}`,
      };
      return userMap;
    }, {})!;

    return new ResponseWrapper(res).status(HttpStatus.OK).success(
      {
        courses: mappedCourses?.map(course => ({
          ...course,
          instructor: usersMap[course.instructorId!],
        })),

        total: courses?.total,
      },
      'Courses by Instructor fetched successfully'
    );
  }

  async deleteCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      updateCourseSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const serverResponse = await this.courseServiceClient.deleteCourse(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.NO_CONTENT)
      .success({ deleted: true }, 'Course has been deleted successfully');
  }

  async getCourses(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getCoursesSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { courses } = await this.courseServiceClient.getAllCourse(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res).status(HttpStatus.OK).success(
      {
        courses: courses?.courses.map(this.mapCourseToResponse),
        total: courses?.total,
      },
      'Courses has been fetched successfully'
    );
  }
  async getEnrolledCourses(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getEnrolledCoursesSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { courses } = await this.courseServiceClient.getEnrolledCourses(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res).status(HttpStatus.OK).success(
      {
        courses: courses?.courses.map(this.mapCourseToResponse),
        total: courses?.total,
      },
      'Fetched all enrolled courses'
    );
  }

  async getSection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getSectionSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { section } = await this.courseServiceClient.getSection(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapSectionToResponse(section!),
        'Fetched section successfully'
      );
  }

  async createSection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      createSectionSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { section } = await this.courseServiceClient.createSection(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.CREATED)
      .success(
        this.mapSectionToResponse(section!),
        'section created successfully'
      );
  }
  async deleteSection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      deleteSectionSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { success } = await this.courseServiceClient.deleteSection(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.NO_CONTENT)
      .success({ deleted: true }, 'Section has been deleted successfully');
  }

  async updateSection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      updateSectionSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { section } = await this.courseServiceClient.updateSection(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapSectionToResponse(section!),
        'section has updated successfully'
      );
  }

  async getSectionsByCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getSectionsByCourseSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { sections } = await this.courseServiceClient.getSectionsByCourse(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        { sections: sections?.sections.map(this.mapSectionToResponse) },
        'Fetched sections successfully'
      );
  }

  async getLesson(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getLessonSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { lesson } = await this.courseServiceClient.getLesson(validPayload, {
      metadata: metadata.metadata,
    });

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapLessonToResponse(lesson!),
        'Fetched lesson successfully'
      );
  }
  async createLesson(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      createLessonSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { lesson } = await this.courseServiceClient.createLesson(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapLessonToResponse(lesson!),
        'Created lesson successfully'
      );
  }
  async deleteLesson(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      deleteLessonSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const serverResponse = await this.courseServiceClient.deleteLesson(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.NO_CONTENT)
      .success({ deleted: true }, 'Lesson has been deleted successfully');
  }
  async updateLesson(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      updateLessonSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { lesson } = await this.courseServiceClient.updateLesson(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapLessonToResponse(lesson!),
        'Lesson has been updated successfully'
      );
  }

  async getLessonsBySection(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getLessonsBySectionSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { lessons } = await this.courseServiceClient.getLessonsBySection(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        { lessons: lessons?.lessons.map(this.mapLessonToResponse) },
        'Fetched lessons successfully'
      );
  }

  async getQuizzesByCourse(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getQuizzesByCourseSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { quizzes } = await this.courseServiceClient.getQuizzesByCourse(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        { quizzes: quizzes?.quizzes.map(this.mapQuizToResponse) },
        'Use has been blocker successfully'
      );
  }
  async getQuiz(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      getQuizSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { quiz } = await this.courseServiceClient.getQuiz(validPayload, {
      metadata: metadata.metadata,
    });

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(this.mapQuizToResponse(quiz!), 'Fetched quiz successfully');
  }
  async createQuiz(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      createQuizSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { quiz } = await this.courseServiceClient.createQuiz(validPayload, {
      metadata: metadata.metadata,
    });

    return new ResponseWrapper(res)
      .status(HttpStatus.CREATED)
      .success(this.mapQuizToResponse(quiz!), 'Quiz created successfully');
  }

  async deleteQuiz(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      deleteQuizSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const serverResponse = await this.courseServiceClient.deleteQuiz(
      validPayload,
      {
        metadata: metadata.metadata,
      }
    );

    return new ResponseWrapper(res)
      .status(HttpStatus.NO_CONTENT)
      .success({ deleted: true }, 'Quiz has been deleted successfully');
  }
  async updateQuiz(req: Request, res: Response) {
    const validPayload = validateSchema(
      { ...req.body, ...req.params },
      updateQuizSchema
    )!;

    // create metadata object to pass req headers
    const metadata = new MetadataManager();
    metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

    const { quiz } = await this.courseServiceClient.updateQuiz(validPayload, {
      metadata: metadata.metadata,
    });

    return new ResponseWrapper(res)
      .status(HttpStatus.OK)
      .success(
        this.mapQuizToResponse(quiz!),
        'Quiz has been deleted successfully'
      );
  }

  // async getReviewsByCourse(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.getReviewsByCourse(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async getReview(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.getReview(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async createReview(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.createReview(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async deleteReview(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.deleteReview(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async updateReview(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.updateReview(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async getEnrollment(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.getEnrollment(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async createEnrollment(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.createEnrollment(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async deleteEnrollment(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.deleteEnrollment(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async updateEnrollment(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.updateEnrollment(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async getProgress(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.getProgress(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async updateProgress(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.updateProgress(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async createProgress(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.createProgress(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }
  // async deleteProgress(req: Request, res: Response) {
  //   const validPayload = validateSchema(
  //     { ...req.body, ...req.params },
  //     updateCourseSchema
  //   )!;

  //   // create metadata object to pass req headers
  //   const metadata = new MetadataManager();
  //   metadata.set({ 'x-user': req.user }); // send user data in `x-user` header

  //   const serverResponse = await this.courseServiceClient.deleteProgress(
  //     validPayload,
  //     {
  //       metadata: metadata.metadata,
  //     }
  //   );

  //   const resWrap = new ResponseWrapper(res);

  //   return resWrap
  //     .status(HttpStatus.OK)
  //     .success({ updated: true }, 'Use has been blocker successfully');
  // }

  // Mapping Functions
  private mapCourseToResponse = (dto: CourseData): CourseData => {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      learningOutcomes: dto.learningOutcomes,
      requirements: dto.learningOutcomes,
      topics: dto.topics,
      category: dto.category,
      subCategory: dto.subCategory,
      durationUnit: dto.durationUnit,
      durationValue: dto.durationValue,
      subTitle: dto.subTitle,
      currency: dto.currency,
      discountPrice: dto.discountPrice,
      price: dto.price,
      language: dto.language,
      subtitleLanguage: dto.subtitleLanguage,
      targetAudience: dto.targetAudience,
      thumbnail: dto.thumbnail,
      trailer: dto.trailer,
      level: dto.level,
      instructor: dto.instructor && {
        avatar: dto.instructor.avatar,
        id: dto.instructor.id,
        name: dto.instructor.name,
        email: dto.instructor.email,
      },
      instructorId: dto.instructorId,
      sections: dto.sections.map(this.mapSectionToResponse),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : undefined,
    };
  };

  private mapSectionToResponse = (dto: SectionData): SectionData => {
    return {
      id: dto.id,
      courseId: dto.courseId,
      title: dto.title,
      description: dto.description,
      isPublished: dto.isPublished,
      order: dto.order,
      quiz: this.mapQuizToResponse(dto.quiz),
      lessons: dto.lessons.map(this.mapLessonToResponse),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : undefined,
    };
  };

  private mapLessonToResponse = (dto: LessonData): LessonData => {
    return {
      id: dto.id,
      sectionId: dto.sectionId,
      title: dto.title,
      contentUrl: dto.contentUrl,
      description: dto.description,
      estimatedDuration: dto.estimatedDuration,
      isPreview: dto.isPreview,
      isPublished: dto.isPublished,
      order: dto.order,
      metadata: Object.fromEntries(
        Object.entries(dto.metadata!).filter(
          ([key, value]) => !key.toString().startsWith('_')
        )
      ) as unknown as ContentMetaData,
      contentType: dto.contentType,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : undefined,
    };
  };

  private mapQuizToResponse = (dto?: QuizData): QuizData | undefined => {
    if (!dto) return;
    return {
      id: dto.id,
      courseId: dto.courseId,
      sectionId: dto.sectionId,
      title: dto.title,
      description: dto.description,
      timeLimit: dto.timeLimit,
      passingScore: dto.passingScore,
      questions:
        dto.questions?.map(q => ({
          id: q.id,
          question: q.question,
          required: q.required,
          type: q.type,
          timeLimit: q.timeLimit,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer?.toString(),
          explanation: q.explanation ?? '',
        })) ?? [],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : '',
    };
  };

  private mapEnrollmentToResponse = (dto: EnrollmentData): EnrollmentData => {
    return {
      id: dto.id,
      userId: dto.userId,
      courseId: dto.courseId,
      progress: dto.progress,
      completedAt: dto.completedAt,
      status: dto.status.toString(),
      enrolledAt: dto.enrolledAt,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : '',
    };
  };

  private mapProgressToResponse = (dto: ProgressData): ProgressData => {
    return {
      id: dto.id,
      enrollmentId: dto.enrollmentId,
      lessonId: dto.lessonId,
      completed: dto.completed,
      completedAt: dto.completedAt ? dto.completedAt : '',
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      deletedAt: dto.deletedAt ? dto.deletedAt : '',
    };
  };

  private mapReviewToResponse = (dto: ReviewData): ReviewData => {
    return {
      id: dto.id,
      userId: dto.userId,
      courseId: dto.courseId,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  };
}
