import { z } from "zod";

export const blockUserSchema = z.object({
  userId: z.string().min(1, { message: "userId is required" }),
});

// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords must match",
//   path: ["confirmPassword"],
// });

export type BlockUserType = z.infer<typeof blockUserSchema>;
