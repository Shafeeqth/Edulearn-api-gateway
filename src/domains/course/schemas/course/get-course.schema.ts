import { GetCourseRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const getCourseSchema: ZodType<GetCourseRequest> = z.object({
  courseId: z
    .string()
});



export type GetCourseDto = z.infer<typeof getCourseSchema>;
