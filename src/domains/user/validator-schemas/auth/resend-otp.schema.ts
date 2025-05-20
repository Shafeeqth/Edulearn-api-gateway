import { z } from "zod";

export const ResendOtpSchema = z
    .object({
    
        email: z.string().email({ message: "Invalid email format" }),
    });

export type ResendOtpDto = z.infer<typeof ResendOtpSchema>;
