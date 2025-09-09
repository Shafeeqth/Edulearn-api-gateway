import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    userId: z.string().min(1, { message: 'userId is required' }),

    currentPassword: z
      .string()
      .nonempty({ message: 'old password is required' }),
    newPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(50)
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/, {
        message:
          'Password must include at least one digit, one lowercase letter, one uppercase letter, and one special character',
      }),
    confirmPassword: z.string(),
  })
  .refine(data => data.confirmPassword === data.newPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
