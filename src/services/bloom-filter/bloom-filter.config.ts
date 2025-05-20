export interface BloomFilterConfig {
  size: number;
  hashes: number;
  redisKey: string;
  falsePositiveRate: number;
}

export const getBloomFilterConfig = (): BloomFilterConfig => ({
  size: parseInt(process.env.BLOOM_FILTER_SIZE || "1000000"),
  hashes: parseInt(process.env.BLOOM_FILTER_HASHES || "10"),
  redisKey: process.env.BLOOM_FILTER_REDIS_KEY || "email:bloomfilter",
  falsePositiveRate: parseInt(process.env.BLOOM_FILTER_FP_RATE || "0.01"),
});
