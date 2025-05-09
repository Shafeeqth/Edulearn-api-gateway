import retry from "async-retry";

export interface RetryConfig {
  retries: number;
  factor: number;
  minTimeout: number;
  maxTimeout: number;
  randomize: boolean;
}

export const defaultRetryConfig: Required<RetryConfig> = {
  retries: 2,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 5000,
  randomize: true,
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
  isRetryable: (error: any) => boolean = (error) => true
): Promise<T | undefined> => {
  return retry(
    async (bail) => {
      try {
        return await fn();
      } catch (error) {
        console.count("Retries")
        if (!isRetryable(error)) {
          bail(error);
          return;
        }
        console.log("Error from retry :(", error);
        throw error;
      }
    },
    {
      retries: config.retries,
      factor: config.factor,
      minTimeout: config.minTimeout,
      maxTimeout: config.maxTimeout,
      randomize: config.randomize,
    }
  );
};
