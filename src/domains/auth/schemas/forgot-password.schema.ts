import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: 'email must be a string' })
    .email({ message: 'email must be a valid' })
    .nonempty({ message: '`email` is a required!.' }),
});

export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
