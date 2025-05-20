import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import {
  CircuitBreakerWrapper,
  defaultCircuitBreakerConfig,
} from "./circuit-breaker";
import { defaultRateLimiterConfig, RateLimiter } from "../rate-limiter";
import { GrpcClientConfig, GrpcClientOptions } from "./types";
// import { defaultRetryConfig, withRetry } from "../retry";
import { StorageMemory } from "../../shared/constants/storage";
import { GrpcTransformedError } from "../errors/grpc-transform.error";

export class GrpcClient<T extends Record<string, Function>> {
  private readonly client: T;
  private readonly circuitBreaker: CircuitBreakerWrapper;
  private readonly rateLimiter: RateLimiter;
  private readonly config: Required<GrpcClientConfig>;
  private metadata: grpc.Metadata;

  constructor(config: GrpcClientConfig) {
    this.config = {
      credentials: grpc.credentials.createInsecure(),
      deadlineMs: 10000,
      keepAliveTimeoutMs: 20000,
      maxMessageSize: StorageMemory.MB * 10,
      // retryConfig: defaultRetryConfig,
      circuitBreakerConfig: defaultCircuitBreakerConfig,
      rateLimiterConfig: defaultRateLimiterConfig,
      ...config,
    };

    const proto = this.loadProto();
    this.client = this.initializeClient(proto);
    this.circuitBreaker = new CircuitBreakerWrapper(
      this.makeUnaryCall.bind(this),
      this.config.circuitBreakerConfig
    );
    this.rateLimiter = new RateLimiter(this.config.rateLimiterConfig);
  }

  private loadProto() {
    const packageDefinition = protoLoader.loadSync(this.config.protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    return protoDescriptor[this.config.packageName];
  }

  private initializeClient(proto: any): T {
    const service = proto[this.config.serviceName];
    this.initializeMetadata();
    return new service(
      `${this.config.host}:${this.config.port}`,
      this.config.credentials,
      {
        'grpc.default_compression_algorithm': grpc.compressionAlgorithms.gzip,
        "grpc.max_reconnect_backoff_ms": 5000,
        "grpc.service_config": JSON.stringify({
          loadBalancingConfig: [{ round_robin: {} }],
          methodConfig: [
            {
              name: [{ service: this.config.serviceName }],
              retryPolicy: {
                maxAttempts: 3,
                initialBackoff: "0.5s",
                maxBackoff: "5s",
                backoffMultiplier: 2,
                retryableStatusCodes: [
                  grpc.status.DEADLINE_EXCEEDED,
                  grpc.status.RESOURCE_EXHAUSTED,
                  grpc.status.ABORTED,
                  grpc.status.CANCELLED,
                  grpc.status.INTERNAL,
                ],
              },
            },
          ],
        }),
        "grpc.keepalive_timeout_ms": this.config.keepAliveTimeoutMs,
        "grpc.max_receive_message_length": this.config.maxMessageSize,
        "grpc.max_send_message_length": this.config.maxMessageSize,
        'grpc.keepalive_time_ms': 120000, // Send keep-alive pings every 2 minutes
        'grpc.http2.max_pings_without_data': 0, // Allow unlimited pings without data
      }
    ) as T;
  }

  getClient(): T {
    return this.client;
  }

  private initializeMetadata() {
    this.metadata = new grpc.Metadata();
    this.metadata.set("x-service-version", "1.0.1");
    this.metadata.set("x-client-id", "123");
  }

  async unaryCall<R, P>(
    method: keyof T,
    request: R,
    options: GrpcClientOptions = {}
  ): Promise<P> {
    const { metadata = this.metadata } = options;
    const key = `${String(method)}:${JSON.stringify(request)}`;
    await this.rateLimiter.consume(key);
    return this.circuitBreaker.execute(method, request, metadata);
  }

  async *streamCall<R, P>(
    method: keyof T,
    request: R,
    options: GrpcClientOptions = {}
  ): AsyncIterableIterator<P> {
    const { metadata = this.metadata } = options;
    const key = `${String(method)}:${JSON.stringify(request)}`;
    await this.rateLimiter.consume(key);

    const deadline = new Date(Date.now() + this.config.deadlineMs);

    const stream = this.client[method](request, metadata, { deadline });

    for await (const response of stream) {
      yield response;
    }
  }

  private async makeUnaryCall<R, P>(
    method: keyof T,
    request: R,
    metadata: grpc.Metadata = this.metadata
  ) {
    const deadline = new Date(Date.now() + this.config.deadlineMs);
    return  new Promise((resolve, reject) => {
          this.client[method](
            request,
            metadata,
            { deadline },
            (error: grpc.ServiceError | null, response: P) => {
              const requestId =
                metadata.get("request_id")?.[0]?.toString() || "unknown";
              if (error) reject(new GrpcTransformedError(error, requestId));
              resolve(response);
            }
          );
        });
  }

  private isRetryable(error: grpc.ServiceError): boolean {
    const retryableStatusCodes = new Set([
      grpc.status.DEADLINE_EXCEEDED,
      grpc.status.UNAVAILABLE,
      grpc.status.RESOURCE_EXHAUSTED,
      grpc.status.ABORTED,
      grpc.status.CANCELLED,
      grpc.status.INTERNAL,
      grpc.status.ALREADY_EXISTS,
    ]);

    return retryableStatusCodes.has(error.code);
  }

  close() {
    this.client.close();
    this.circuitBreaker.shutdown();
  }
}
