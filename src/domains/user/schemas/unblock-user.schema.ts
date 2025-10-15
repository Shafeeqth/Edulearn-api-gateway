import { z } from "zod";

export const unBlockUserSchema = z.object({
  userId: z.string().min(1, { message: "userId is required" }),
});

export type UnBlockUserType = z.infer<typeof unBlockUserSchema>;
