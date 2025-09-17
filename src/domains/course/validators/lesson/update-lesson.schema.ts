import { UpdateLessonRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const updateLessonSchema: ZodType<UpdateLessonRequest> = z.object({
  lessonId: z.string(),
  sectionId: z.string(),
  contentType: z.string().optional(),
  contentUrl: z.string().optional(),
  description: z.string().optional(),
  isPreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  estimatedDuration: z.string().optional(),
  order: z.number().optional(),
  title: z.string().optional(),
  metadata: z.any(),
});

export type CreateLessonDto = z.infer<typeof updateLessonSchema>;
