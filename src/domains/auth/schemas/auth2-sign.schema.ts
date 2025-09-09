import { Auth2SignRequest } from '@/domains/service-clients/auth/proto/generated/auth_service';
import { AuthType, UserRoles } from '../../../shared/types/user-types';
import { z, ZodType } from 'zod';

export const Auth2SignSchema: ZodType<Auth2SignRequest> = z.object({
  provider: z.string(),
  token: z.string(),
  authType: z.enum(Object.values(AuthType) as [string], {
    message: 'Invalid authType. AuthType must be one of the defined types',
  }),
});

export type Auth2SignDto = z.infer<typeof Auth2SignSchema>;
