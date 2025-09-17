import { GetAllCoursesRequest, GetCourseRequest, GetEnrolledCoursesRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../get-course-by-instructor.schema';

export const getEnrolledCoursesSchema: ZodType<GetEnrolledCoursesRequest> = z.object({
  userId: z
    .string(),
  pagination: paginationSchema
});



export type GetCourseDto = z.infer<typeof getEnrolledCoursesSchema>;
