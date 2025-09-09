import { z } from "zod";

export const ResendOtpSchema = z
    .object({
    
        email: z.string().email({ message: "Invalid email format" }),
        username: z.string({ message: "username must be valid" }).optional(),
        userId: z.string({ message: "userId must be valid format" }).optional(),
    });

export type ResendOtpDto = z.infer<typeof ResendOtpSchema>;
