import { BloomFilterFacade } from './bloom-filter.facade';
import { RedisService } from '@/shared/utils/redis';
import { getBloomFilterConfig } from './bloom-filter.config';

/**
 * @deprecated Use BloomFilterFacade.getInstance() instead
 * This class is maintained for backward compatibility
 */
export class EmailAvailabilityService {
  private facade: BloomFilterFacade;

  constructor(redis: RedisService) {
    this.facade = BloomFilterFacade.getInstance(redis, getBloomFilterConfig());
  }

  public async initialize(): Promise<void> {
    return this.facade.initialize();
  }

  public async isEmailAvailable(email: string): Promise<boolean> {
    return this.facade.isEmailAvailable(email);
  }

  public async addEmail(email: string): Promise<void> {
    return this.facade.addEmail(email);
  }
}
