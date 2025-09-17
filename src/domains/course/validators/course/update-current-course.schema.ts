import { z } from 'zod';
import { createCourseSchema } from './create-course.schema';

export const updateCourseSchema = createCourseSchema.omit({instructor: true, instructorId: true}).extend({
  description: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional().default([]),
  targetAudience: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
  thumbnail: z.string().optional(),
  trailer: z.string().optional(),
  courseId: z.string().uuid(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
