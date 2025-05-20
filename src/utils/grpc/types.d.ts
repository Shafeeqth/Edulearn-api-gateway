import {ChannelCredentials, Metadata} from "@grpc/grpc-js";
import { RetryConfig } from "../retry";
import { CircuitBreakerConfig } from "./circuit-breaker";
import { RateLimiterConfig } from "../rate-limiter";

export interface GrpcClientConfig {
    protoPath: string;
    packageName: string;
    serviceName: string;
    host: string;
    port: number;
    credentials?: ChannelCredentials;
    deadlineMs?: number;
    keepAliveTimeoutMs?: number;
    maxMessageSize?: number;
    // retryConfig?: RetryConfig;
    circuitBreakerConfig?: CircuitBreakerConfig;
    rateLimiterConfig?: RateLimiterConfig;
}

export interface GrpcClientOptions {
    metadata?: Metadata;
}
