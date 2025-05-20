import CircuitBreaker from "opossum";

export interface CircuitBreakerConfig {
  timeout: number;
  errorThresholdPercentage: number;
  resetTimeout: number;
  volumeThreshold: number;
}

export const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 3000,
  volumeThreshold: 5,
};

export class CircuitBreakerWrapper {
  private breaker: CircuitBreaker;

  constructor(
    fn: (...args: any[]) => Promise<any>,
    config: CircuitBreakerConfig = defaultCircuitBreakerConfig
  ) {
    this.breaker = new CircuitBreaker(fn, config);

    this.breaker.on("open", () => console.log("Circuit breaker opened (:)"));
    this.breaker.on("halfOpen", () => console.log("Circuit breaker half  (:)"));
    this.breaker.on("close", () => console.log("Circuit breaker closed (:)"));
    this.breaker.on("failure", () => console.log("Circuit breaker failure (:)"));
  }

  async execute<T>(...args: any[]): Promise<T> {
    return this.breaker.fire(...args) as T;
  }

  shutdown(): void {
    this.breaker.shutdown();
  }
}
