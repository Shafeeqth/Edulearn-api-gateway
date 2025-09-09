import { AuthType, UserRoles } from '../../../shared/types/user-types';
import { z } from 'zod';

export const RegisterUserSchema = z
  .object({
    firstName: z
      .string()
      .min(3, { message: 'firstName must be at least 3 characters long' })
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)?$/,
        'Name must contain only alphabets and numbers and one space between'
      ),
    lastName: z
      .string()
      .min(0, { message: 'lastName must be at least 3 characters long' })
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)?$/,
        'Name must contain only alphabets and numbers and one space between'
      ), // .optional(),
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(50)
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/, {
        message:
          'Password must include at least one digit, one lowercase letter, one uppercase letter, and one special character',
      }),

    confirmPassword: z.string().nonempty(),
    role: z.enum(Object.values(UserRoles) as [string], {
      message: 'Invalid role. role must be one of roles*',
    }),
    avatar: z.string().optional(),
    authType: z.enum(Object.values(AuthType) as [string], {
      message: 'Invalid authType. type must be one of the auth types*',
    }), 
  })
  .refine(
    data => data.authType === AuthType.OAUTH || data.password !== undefined,
    {
      message: "Password is required unless authType is 'auth2'",
      path: ['password'],
    }
  )
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
