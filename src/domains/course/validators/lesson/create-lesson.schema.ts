import { CreateLessonRequest,  } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';


export const createLessonSchema: ZodType<CreateLessonRequest> = z.object({
  sectionId: z.string().uuid(),
  courseId: z.string().uuid(),
  metadata: z.any().optional(),
  contentType: z.string().optional(),
  contentUrl: z.string().optional(),
  description: z.string().optional(),
  estimatedDuration: z.number().optional(),
  isPreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
  title: z.string().optional(),
  
});

export type CreateLessonDto = z.infer<typeof createLessonSchema>;
