import {
  Span,
  Tracer,
  trace,
  context,
  Attributes,
  SpanStatusCode,
  Context,
} from '@opentelemetry/api'; // Import Tracer and SpanStatusCode
import { config } from 'config';

export class TracingService {
  private static instance: TracingService; // Follow a singleton pattern
  private tracer: Tracer; // Explicitly type the tracer

  private constructor() {
    this.tracer = trace.getTracer(config.serviceName || 'api-gateway'); // Initialize tracer with service name
  }

  public static getInstance(): TracingService {
    if (!TracingService.instance) {
      TracingService.instance = new TracingService();
    }
    return TracingService.instance;
  }

  // Starts a new span and makes it active in the current context
  startActiveSpan<T>(
    name: string,
    fn: (span: Span) => T | Promise<T>,
    attributes?: Attributes
  ): T | Promise<T> {
    return this.tracer.startActiveSpan(name, span => {
      if (attributes) {
        span.setAttributes(attributes);
      }
      try {
        const result = fn(span);
        if (result instanceof Promise) {
          return result
            .then(res => {
              span.setStatus({
                code: SpanStatusCode.OK,
                message: 'Operation has been successful',
              });
              return res;
            })
            .catch(error => {
              span.recordException(error);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error.message || 'Operation failed',
              });
              throw error;
            })
            .finally(() => {
              span.end();
            });
        }
        span.setStatus({
          code: SpanStatusCode.OK,
          message: 'Operation has been successful',
        });
        return result;
      } catch (error: any) {
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        throw error;
      }
    });
  }

  // Starts a non-active span (useful if you manage context manually or for specific async flows)
  startSpan(
    name: string,
    attributes?: Attributes | Record<string | any, string | any>,
    contextOverride?: Context
  ): Span {
    const ctx = contextOverride || context.active();
    const span = this.tracer.startSpan(name, { attributes }, ctx);
    return span;
  }

  endSpan(span: Span): void {
    span.end();
  }

  recordException(span: Span, error: any): void {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message }); // Set span status to ERROR on exception
  }

  setStatus(span: Span, code: SpanStatusCode, message?: string): void {
    // Use OpenTelemetry SpanStatusCode
    span.setStatus({ code, message });
  }

  setAttribute(span: Span, key: string, value: any): void {
    span.setAttribute(key, value);
  }

  // Get the current active span (useful for adding attributes to an existing span)
  getCurrentSpan(): Span | undefined {
    return trace.getSpan(context.active());
  }
}
