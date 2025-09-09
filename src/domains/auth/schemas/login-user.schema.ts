import { z } from 'zod';

export const LoginUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(50),
  rememberMe: z.boolean().default(false),
  // .optional(),
  // authType: z.enum(Object.values(AuthType) as [string], {
  //   message: "AuthType must be one of the auth types",
  // }),
});
// .refine(
//   (data) => data.authType === AuthType.OAUTH || data.password !== undefined,
//   {
//     message: "Password is required unless authType is 'auth2'",
//     path: ["password"],
//   }
// );
