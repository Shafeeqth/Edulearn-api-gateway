import { z } from 'zod';

export const courseUploadPreSignSchema = z.object({
  userId: z.string({ message: 'Invalid user Id ' }),
  courseId: z.string({ message: 'Invalid courseId' }),
  fileName: z.string({ message: 'Invalid file Name' }),
  fileSize: z.number({ message: 'Invalid file size' }),
  fileType: z.string({ message: 'Invalid file type' }),
  uploadId: z.string({ message: 'Invalid file type' }).optional(),
  checkSum: z.string().optional(),
  tags: z.record(z.string()).optional(),
});

export type CourseUploadPreSignDto = z.infer<typeof courseUploadPreSignSchema>;
