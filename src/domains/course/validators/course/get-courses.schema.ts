import { GetAllCoursesRequest, GetCourseRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../get-course-by-instructor.schema';

export const getCoursesSchema: ZodType<GetAllCoursesRequest> = z.object({
  courseId: z
    .string(),
  pagination: paginationSchema
});



export type GetCourseDto = z.infer<typeof getCoursesSchema>;
