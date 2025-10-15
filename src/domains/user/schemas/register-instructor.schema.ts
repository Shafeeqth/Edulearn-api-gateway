import { RegisterInstructorRequest } from '@/domains/service-clients/user/proto/generated/user_service';
import { z, ZodType } from 'zod';

export const registerInstructorSchema: ZodType<RegisterInstructorRequest> =
  z.object({
    userId: z.string().uuid({ message: '`userId` must be type of UUID' }),
    username: z.string(),
    tags: z.array(z.string()),
    agreeToTerms: z.boolean(),
    agreeToPrivacy: z.boolean(),
    receiveUpdates: z.boolean(),
    headline: z
      .string()
      .min(3, { message: 'Headline must be at least 3 characters long' })
      .max(100, { message: 'Headline must be at most 100 characters long' }),
    biography: z
      .string()
      .max(500, { message: 'Biography must be at most 500 characters long' }),
    // avatar: z.string(),
    language: z.string().min(2, { message: 'Language is required' }),
    experience: z.string(),
    expertise: z.string(),
    education: z.string(),
    
  });

export type RegisterInstructorDto = z.infer<typeof registerInstructorSchema>;
