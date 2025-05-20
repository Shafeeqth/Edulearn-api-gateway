import grpc from "@grpc/grpc-js";

export class ExponentialBackoff {
    constructor(
        private readonly options: {
            initialDelay: number,
            maxDelay: number,
            factor: number,
            jitter: number,
        }
    ){}

    async execute<T>(fn:()=>Promise<T>, maxRetries: number): Promise<T> {
        let attempt = 0;

        while(true) {
            try {
                return await fn();
            } catch (error: unknown) {
                if(attempt >= maxRetries || !this.isRetryable(error)){
                    throw error;
                }

                const delay = this.calculateDelay(attempt);
                await this.sleep(delay);
                attempt++;
            }
            
        }
    }

    private calculateDelay(attempt: number): number {
        const delay = Math.min(
            this.options.initialDelay * Math.pow(this.options.factor, attempt), 
            this.options.maxDelay
        );

        return this.applyJitter(delay);
    }

    private applyJitter(delay: number): number {
        const jitter = delay * this.options.jitter * Math.random();
        return delay + jitter;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private isRetryable(error: any): boolean {
        return [
            grpc.status.UNAVAILABLE,
            grpc.status.DEADLINE_EXCEEDED,
            grpc.status.RESOURCE_EXHAUSTED,
        ].includes(error.code)
    }
}