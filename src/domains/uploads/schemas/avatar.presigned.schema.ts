import { z } from 'zod';

export const avatarPresignedSchema = z.object({
  userId: z.string({ message: 'userId is required' }),
  uploadType: z.string(),
});

export type AvatarPresignedType = z.infer<typeof avatarPresignedSchema>;
