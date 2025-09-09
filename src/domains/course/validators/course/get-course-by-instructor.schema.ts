import { GetCoursesByInstructorRequest, Pagination } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';
import { paginationSchema } from '../get-course-by-instructor.schema';

export const getCourseByInstructorSchema: ZodType<GetCoursesByInstructorRequest> = z.object({
  // override or add fields here
  instructorId: z
    .string(),
  pagination: paginationSchema.optional()
  
  
  
});



export type GetCourseByInstructorDto = z.infer<typeof getCourseByInstructorSchema>;
