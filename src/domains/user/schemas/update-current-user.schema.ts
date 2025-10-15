import { UpdateUserDetailsRequest } from '@/domains/service-clients/user/proto/generated/user_service';
import { z, ZodType } from 'zod';

export const updateCurrentUserSchema: ZodType<UpdateUserDetailsRequest> = z.object({
  userId: z.string().uuid({ message: '`userId` must be type of UUID' }),
  firstName: z
    .string()
    .min(3, { message: 'First name must be at least 3 characters long' })
    .regex(
      /^[A-Za-z\d]+(?: [A-Za-z\d]+)*$/,
      'firstName must contain only alphanumeric and spaces, and spaces cannot be at the beginning'
    ),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' })
    .regex(
      /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/,
      'lastName must contain only alphanumeric and spaces, and spaces cannot be at the beginning'
    )
    .optional(),
  biography: z
    .string()
    .max(500, { message: 'Biography must be at most 500 characters long' })
    .optional(),
  avatar: z.string().optional(),
  website: z.string().optional(),
  language: z.string().min(2, { message: 'Language is required' }).optional(),
  socials: z
    .array(
      z.object({
        provider: z.string(),
        profileUrl: z.string(),
        providerUserUrl: z.string().optional(),
      })
    )
    // .optional()
    .default([]),

  city: z.string().optional(),
  country: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, {
      message: 'Phone must be a valid phone number',
    })
    .optional(),
});

export type UpdateCurrentUserDto = z.infer<typeof updateCurrentUserSchema>;
