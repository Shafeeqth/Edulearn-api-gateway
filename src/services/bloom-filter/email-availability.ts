import { BloomFilter } from "bloom-filters";
import { RedisClientType } from "redis";
import { BloomFilterConfig, getBloomFilterConfig } from "./bloom-filter.config";
import { metrics } from "./metrics";
import {
  CheckUserByEmailRequest,
  CheckUserByEmailResponse,
  GetAllUserEmailsRequest,
  GetAllUserEmailsResponse,
} from "../../domains/clients/user/proto/generated/user";
import { GrpcClientOptions } from "../../utils/grpc/types";

interface BloomFilterUtilMethods {
  queryForEmails: (
    request: GetAllUserEmailsRequest,
    options?: GrpcClientOptions
  ) => Promise<GetAllUserEmailsResponse>;
  checkEmailExistInDB: (
    request: CheckUserByEmailRequest,
    options?: GrpcClientOptions
  ) => Promise<CheckUserByEmailResponse>;
}

export class EmailAvailabilityService {
  private bloomFilter: BloomFilter;
  private redisClient: RedisClientType;
  private config: BloomFilterConfig;
  private methods: BloomFilterUtilMethods;

  constructor(
    redisClient: RedisClientType,
    methods: BloomFilterUtilMethods,
    config: BloomFilterConfig = getBloomFilterConfig()
  ) {
    this.redisClient = redisClient;
    this.config = config;
    this.bloomFilter = new BloomFilter(this.config.size, this.config.hashes);
    this.methods = methods;
  }

  public async initialize(): Promise<void> {
    try {
      
      console.log("Bloom filter initializing...");
     
      const serializeFilter = await this.redisClient.get(this.config.redisKey);
      if (serializeFilter) {
        this.bloomFilter = BloomFilter.fromJSON(JSON.parse(serializeFilter));
      } else {
        await this.seedFromDb();
      }
    } catch (error) {
      metrics.bloomFilterErrors.inc();
      console.error("Bloom filter initialization failed:", error);
      // throw new Error(`Bloom filter initialization failed: ${error}`);
    }
  }

  private async seedFromDb(): Promise<void> {
    try {
      const { success } = await this.methods.queryForEmails({});
      console.log("Seed data from server", JSON.stringify(success, null, 2));
      if (success)
        throw new Error(
          "An Error occurred while fetch user emails from server :)"
        );
      success!.email.forEach((email) => this.bloomFilter.add(email));
      await this.persistFilter();
    } catch (error) {
      metrics.bloomFilterErrors.inc();
      console.error("Error seeding Bloom filter from DB:", error);
      throw error;
    }
  }

  public async isEmailAvailable(email: string): Promise<boolean> {
    const startTime = Date.now();
    try {
      if (!this.bloomFilter.has(email)) {
        metrics.bloomFilterQueries.labels({ result: "negative" }).inc();
        metrics.responseTimes
          .labels({ stage: "bloom_filter" })
          .observe(Date.now() - startTime);
        return true;
      }
      metrics.bloomFilterQueries.labels({ result: "positive" }).inc();
      const existInDb = await this.methods.checkEmailExistInDB({ email });
      console.log("After bloom filter query from db");
      metrics.databaseQueries.inc();
      metrics.responseTimes
        .labels({ stage: "database" })
        .observe(Date.now() - startTime);
      return !existInDb;
    } catch (error) {
      metrics.bloomFilterErrors.inc();
      console.error("Error checking email availability:", error);
      throw error;
    }
  }

  public async addEmail(email: string): Promise<void> {
    try {
      this.bloomFilter.add(email);
      await this.persistFilter();
      metrics.bloomFilterQueries.labels({ result: "added" }).inc();
    } catch (error) {
      metrics.bloomFilterErrors.inc();
      console.error("Error adding email to Bloom filter:", error);
      throw error;
    }
  }

  private async persistFilter(): Promise<void> {
    try {
      await this.redisClient.set(
        this.config.redisKey,
        JSON.stringify(this.bloomFilter.saveAsJSON())
      );
      metrics.bloomFilterQueries.labels({ result: "persisted" }).inc();
    } catch (error) {
      metrics.bloomFilterErrors.inc();
      console.error("Error persisting Bloom filter to Redis:", error);
      throw error;
    }
  }
}
