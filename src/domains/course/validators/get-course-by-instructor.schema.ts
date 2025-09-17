import { Pagination } from '@/domains/service-clients/course/proto/generated/course_service';
import { z, ZodType } from 'zod';

export const paginationSchema: ZodType<Pagination> = z.object({
  limit: z.number().min(1, 'Page limit must be at least one'),
  page: z.number().min(1, 'Page number must be at least one'),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
