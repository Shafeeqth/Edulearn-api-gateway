import { z } from "zod";

export const emailAvailabilitySchema = z.object({
  email: z.string().email().nonempty({ message: "`email` is a required!." }),
});

export type EmailAvailabilityDto = z.infer<typeof emailAvailabilitySchema>;
