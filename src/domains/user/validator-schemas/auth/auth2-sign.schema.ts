import { AuthType, UserRoles } from "../../../../shared/types/user-types";
import { z } from "zod";

export const Auth2SignSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" })
      .regex(
        /^(?! )[A-Za-z0-9]+(?: [A-Za-z0-9]+)*(?<! )$/,
        "Username must contain only alphanumeric characters and one space between words, starting and ending with alphanumeric characters"
      ),
    email: z.string().email({ message: "Invalid email format" }),
    role: z.enum(Object.values(UserRoles) as [string], {
      message: "Invalid role. Role must be one of the defined roles",
    }),
    avatar: z.string(),
    authType: z.enum(Object.values(AuthType) as [string], {
      message: "Invalid authType. AuthType must be one of the defined types",
    }),
  });

export type Auth2SignDto = z.infer<typeof Auth2SignSchema>;
