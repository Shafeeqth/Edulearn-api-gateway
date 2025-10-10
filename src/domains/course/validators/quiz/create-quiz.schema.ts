import { CreateQuizRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const createQuizSchema: ZodType<CreateQuizRequest> = z.object({
  courseId: z.string(),
  sectionId : z.string(),
  maxAttempts: z.number().default(3),
  passingScore: z.number().default(70),
  isRequired: z.boolean().default(false),
  title: z.string().optional(),
  timeLimit: z.number().default(10),
  description: z.string().optional(),
  questions: z.any(),
});

export type CreateQuizDto = z.infer<typeof createQuizSchema>;
