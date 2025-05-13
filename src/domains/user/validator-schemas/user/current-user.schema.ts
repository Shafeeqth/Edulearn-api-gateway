import { z } from "zod";

export const currentUserSchema = z.object({
  userId: z.string({message: "userId be string type"}).min(1, { message: "userId is required" }),
});

export type CurrentUserType = z.infer<typeof currentUserSchema>;
