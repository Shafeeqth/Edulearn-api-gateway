import { z } from "zod";

export const VerifyUserSchema = z
    .object({
        code: z
            .string()
            .regex(/^\d{6}$/, { message: "Invalid OTP code, code must be exactly 6 digits" }),
        email: z.string().email({ message: "Invalid email format" }),
    });

export type VerifyUserDto = z.infer<typeof VerifyUserSchema>;
