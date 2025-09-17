import { GetLessonsBySectionRequest, UpdateSectionRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';



export const getLessonsBySectionSchema: ZodType<GetLessonsBySectionRequest> = z.object({
  sectionId: z.string(),

  

});

export type GetLessonsBySectionDto = z.infer<typeof getLessonsBySectionSchema>