export interface BloomFilterConfig {
  size: number;
  hashes: number;
  redisKey: string;
  falsePositiveRate: number;
}

export interface BloomFilterServiceConfig {
  email: BloomFilterConfig;
  courseName: BloomFilterConfig;
}

export const getBloomFilterConfig = (): BloomFilterServiceConfig => ({
  email: {
    size: parseInt(process.env.BLOOM_FILTER_EMAIL_SIZE || "1000000"),
    hashes: parseInt(process.env.BLOOM_FILTER_EMAIL_HASHES || "10"),
    redisKey: process.env.BLOOM_FILTER_EMAIL_REDIS_KEY || "email:bloomfilter",
    falsePositiveRate: parseFloat(process.env.BLOOM_FILTER_EMAIL_FP_RATE || "0.01"),
  },
  courseName: {
    size: parseInt(process.env.BLOOM_FILTER_COURSE_SIZE || "100000"),
    hashes: parseInt(process.env.BLOOM_FILTER_COURSE_HASHES || "8"),
    redisKey: process.env.BLOOM_FILTER_COURSE_REDIS_KEY || "course:bloomfilter",
    falsePositiveRate: parseFloat(process.env.BLOOM_FILTER_COURSE_FP_RATE || "0.01"),
  },
});
