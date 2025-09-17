import {  DeleteLessonRequest, DeleteSectionRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';



export const deleteLessonSchema: ZodType<DeleteLessonRequest> = z.object({
  lessonId: z.string(),
});

export type DeleteLessonDto = z.infer<typeof deleteLessonSchema>