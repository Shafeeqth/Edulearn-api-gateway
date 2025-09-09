import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: 'token is required' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(50)
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/, {
        message:
          'Password must include at least one digit, one lowercase letter, one uppercase letter, and one special character',
      }),
    confirmPassword: z.string().nonempty(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
