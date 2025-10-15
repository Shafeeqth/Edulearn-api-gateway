import {
  NodeTracerProvider,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SemanticResourceAttributes,
} from '@opentelemetry/semantic-conventions';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
// import { Sampler, ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base'; // Correct Sampler imports
import os from 'os';

import { resourceFromAttributes } from '@opentelemetry/resources';
import { getEnvs } from '@/shared/utils/getEnv';
import { config } from '@/config';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// Initialize the OpenTelemetry Node SDK
export function initializeTracer() {
  // const { JAEGER_ENDPOINT, NODE_ENV, TRACING_SAMPLING_RATIO } = getEnvs(
  //   "JAEGER_ENDPOINT",
  //   "NODE_ENV",
  //   "TRACING_SAMPLING_RATIO"
  // );
  const {
    serviceName,
    nodeEnv,
    observability: {
      jaeger: { samplingRate, endpoint },
    },
  } = config;

  // Configure sampler based on environment
  const sampler =
    nodeEnv === 'production'
      ? new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(parseFloat(samplingRate || '0.1')),
        }) // Sample 10% by default in prod
      : new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(1.0) }); // Always sample in dev/test

  const otlpExporter = new OTLPTraceExporter({
    url: endpoint || 'http://localhost:4318/v1/traces', // Default to OpenTelemetry Collector endpoint
  });

  // Use BatchSpanProcessor for better performance in production
  const spanProcessor =
    nodeEnv === 'production'
      ? new BatchSpanProcessor(otlpExporter)
      : new SimpleSpanProcessor(otlpExporter); // Simple for immediate visibility in dev

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      // Add more resource attributes here for better context in Jaeger
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version || 'unknown',
      [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
      [SemanticResourceAttributes.OS_TYPE]: os.type(),
      [SemanticResourceAttributes.OS_VERSION]: os.release(),
      [SemanticResourceAttributes.PROCESS_PID]: process.pid,
    }),
    sampler: sampler,
    spanProcessors: [spanProcessor],
  });

  provider.register(); // Register the provider globally

  // Register auto-instrumentations
  // getNodeAutoInstrumentations() includes Http and Express, so be careful not to duplicate
  registerInstrumentations({
    instrumentations: [
      // new HttpInstrumentation(),
      // new GrpcInstrumentation(),
      // new ExpressInstrumentation(),

      // If you want all default instrumentations, you can use:
      getNodeAutoInstrumentations(),
      // but ensure you don't duplicate Http/Express if you're adding them separately.
    ],
  });

  // Graceful shutdown for the tracer
  const shutdownTracer = async () => {
    console.info('Shutting down tracer...');
    await provider
      .shutdown()
      .then(() => console.info('Tracer shut down.'))
      .catch(err => console.error('Error shutting down tracer', err));
    process.exit(0); // Exit process after shutdown
  };

  process.on('SIGTERM', shutdownTracer);
  process.on('SIGINT', shutdownTracer);
}
