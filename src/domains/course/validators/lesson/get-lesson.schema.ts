import {  GetLessonRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const getLessonSchema: ZodType<GetLessonRequest> = z.object({
  lessonId: z.string(),
  courseId: z.string(),
});

export type GetLessonDto = z.infer<typeof getLessonSchema>;
