import { z } from 'zod';

export const getCoursePreSignSchema = z.object({
 key: z.string()
});

export type GetCoursePreSignDto = z.infer<typeof getCoursePreSignSchema>;
