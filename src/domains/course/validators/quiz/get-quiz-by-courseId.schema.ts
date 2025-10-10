import {  GetQuizzesByCourseRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';


export const getQuizzesByCourseSchema: ZodType<GetQuizzesByCourseRequest> = z.object({
  courseId: z.string(),
});

export type GetQuizzesByCourseDto = z.infer<typeof getQuizzesByCourseSchema>;
