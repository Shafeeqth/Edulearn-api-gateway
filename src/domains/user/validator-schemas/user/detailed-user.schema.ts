import { z } from "zod";

export const detailedUserSchema = z.object({
  userId: z.string({message: "userId be string type"}).min(1, { message: "userId is required" }),
});

export type DetailedUserType = z.infer<typeof detailedUserSchema>;
