import { AuthType, UserRoles } from "../../../shared/types/user-types";
import { z } from "zod";

export const Auth2SignSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .regex(
        /^[A-Za-z]+(?: [A-Za-z]+)?$/,
        "Name must contain only alphabets and numbers and one space between"
      ),
    email: z.string().email({ message: "Invalid email format" }),
    role: z.enum(Object.values(UserRoles) as [string], {
      message: "Invalid role. role must be one of roles*",
    }),
    avatar: z.string(),
    authType: z.enum(Object.values(AuthType) as [string], {
      message: "Invalid authType. type must be one of the auth types*",
    }),
  })

export type Auth2SignDto = z.infer<typeof Auth2SignSchema>;
