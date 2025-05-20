// src/utils/circuit-breaker.ts
interface CircuitBreakerOptions {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
  }
  
  export class CircuitBreaker {
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    private failureCount: number;
    private successCount: number;
    private nextAttempt: number;
    private options: CircuitBreakerOptions;
  
    constructor(
      private action: () => Promise<any>,
      options?: Partial<CircuitBreakerOptions>
    ) {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.successCount = 0;
      this.nextAttempt = Date.now();
      this.options = {
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 5000,
        ...options
      };
    }
  
    public async execute(): Promise<any> {
      if (this.state === 'OPEN') {
        if (this.nextAttempt <= Date.now()) {
          this.state = 'HALF_OPEN';
        } else {
          throw new Error('Circuit breaker is open');
        }
      }
  
      try {
        const result = await this.action();
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure();
        throw error;
      }
    }
  
    private onSuccess(): void {
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= this.options.successThreshold) {
          this.reset();
        }
      }
    }
  
    private onFailure(): void {
      this.failureCount++;
      if (this.failureCount >= this.options.failureThreshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.options.timeout;
      }
    }
  
    private reset(): void {
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.successCount = 0;
    }
  }