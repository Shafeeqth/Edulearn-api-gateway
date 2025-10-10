import {  DeleteQuizRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';



export const deleteQuizSchema: ZodType<DeleteQuizRequest> = z.object({
  quizId: z.string(),
});

export type DeleteQuizDto = z.infer<typeof deleteQuizSchema>