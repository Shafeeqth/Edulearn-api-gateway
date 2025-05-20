import { z } from "zod";

export const updateUserSchema = z.object({
  userId: z.string().uuid({ message: "`userId` must be type of UUID" }),
  firstName: z
    .string()
    .min(3, { message: "First name must be at least 3 characters long" })
    .regex(
      /^[A-Za-z\d]+(?: [A-Za-z\d]+)*$/,
      "firstName must contain only alphanumeric and spaces, and spaces cannot be at the beginning"
    )
    .optional(),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .regex(
       /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/,
      "lastName must contain only alphanumeric and spaces, and spaces cannot be at the beginning"
    )
    .optional(),
  headline: z
    .string()
    .min(3, { message: "Headline must be at least 3 characters long" })
    .max(100, { message: "Headline must be at most 100 characters long" })
    .optional(),
  biography: z
    .string()
    .max(500, { message: "Biography must be at most 500 characters long" })
    .optional(),
  avatar: z.string().optional(),
  website: z
    .string()
    .optional(),
  language: z.string().min(2, { message: "Language is required" }).optional(),
  facebook: z
    .string()
    .optional(),
  instagram: z
    .string()
    .optional(),
  linkedin: z
    .string()
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, {
      message: "Phone must be a valid phone number",
    })
    .optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
