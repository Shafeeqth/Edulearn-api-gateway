import { GetCourseBySlugRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const getCourseBySlugSchema: ZodType<GetCourseBySlugRequest> = z.object({
  slug: z
    .string()
});



export type GetCourseBySlugDto = z.infer<typeof getCourseBySlugSchema>;
