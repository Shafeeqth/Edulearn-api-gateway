import { CreateCourseRequest } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';


export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
    // .regex(
    //   /^[A-Za-z\d]+(?: [A-Za-z\d]+)*$/,
    //   'title must contain only alphanumeric and spaces, and spaces cannot be at the beginning'
    // ),
  category: z.string(),
  subCategory: z.string(),
  instructorId: z.string(),
  level: z.string(),
  durationUnit: z.string(),
  durationValue: z.string(),
  language: z.string().min(2, { message: 'Language is required' }),
  subtitle: z.string(),
  subtitleLanguage: z.string(),
  topics: z.array(z.string()),
  instructor: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string(),
    email: z.string().optional(),
  })
});

export type CreateCourseDto = z.infer<typeof createCourseSchema>;
