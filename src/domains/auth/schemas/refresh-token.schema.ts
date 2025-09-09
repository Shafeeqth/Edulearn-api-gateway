import { z } from "zod";

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ message: "refreshToken must be a string" })
    .nonempty({ message: "`refreshToken` is a required!." }),
});

export type RefreshTokenType = z.infer<typeof refreshTokenSchema>;
