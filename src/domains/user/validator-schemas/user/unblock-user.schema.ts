import { z } from "zod";

export const unBlockUserSchema = z.object({
  userId: z.string().min(1, { message: "userId is required" }),
});

// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords must match",
//   path: ["confirmPassword"],
// });

export type UnBlockUserType = z.infer<typeof unBlockUserSchema>;
