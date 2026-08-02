import {
  trace,
  SpanKind,
  SpanStatusCode,
  type Attributes,
  type Span,
} from '@opentelemetry/api';

// Deno Deploy registers its OTel providers into the API's global registry, so
// this tracer is live in production. Under plain Node (vite dev) no provider
// is registered and every call is a silent no-op. Only ever import the API
// here — never an OTel SDK; Deploy owns the SDK side.
export const tracer = trace.getTracer('saltcollective-hub');

export { SpanKind, SpanStatusCode, type Span };

/**
 * Run `fn` inside an active child span. Records exceptions, sets ERROR
 * status, always ends the span, and rethrows — callers keep their error flow.
 */
export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: (span: Span) => T | Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      return await fn(span);
    } catch (err) {
      recordError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
}

/** Mark a span failed without throwing — for deliberately swallowed errors. */
export function recordError(span: Span, err: unknown): void {
  span.recordException(err instanceof Error ? err : new Error(String(err)));
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: err instanceof Error ? err.message : String(err),
  });
}
