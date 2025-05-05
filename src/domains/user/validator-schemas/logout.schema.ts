import { AuthType, UserRoles } from "../../../shared/types/user-types";
import { z } from "zod";

export const LogoutUserSchema = z
  .object({
    userId: z
      .string({message: "userId must be a string"})
      .nonempty({message: "`userId` is a required!."})
   
  })

export type LogoutUserDto = z.infer<typeof LogoutUserSchema>;
