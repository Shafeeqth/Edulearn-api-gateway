import { z } from "zod";

export const blockUserSchema = z.object({
  userId: z.string().min(1, { message: "userId is required" }),
});

export type BlockUserType = z.infer<typeof blockUserSchema>;
