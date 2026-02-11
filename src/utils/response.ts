import type { Context } from 'hono';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    credits: number;
    processingMs: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export function success<T>(c: Context, data: T, startTime: number, credits = 1): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    meta: {
      credits,
      processingMs: Date.now() - startTime,
    },
  };
  return c.json(response);
}

export function error(c: Context, code: string, message: string, status = 400): Response {
  const response: ErrorResponse = {
    success: false,
    error: { code, message },
  };
  return c.json(response, status);
}

export const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_FORMAT: 'INVALID_FORMAT',
  UNSUPPORTED_CONVERSION: 'UNSUPPORTED_CONVERSION',
  PARSE_ERROR: 'PARSE_ERROR',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  CIRCULAR_REFERENCE: 'CIRCULAR_REFERENCE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  QUERY_ERROR: 'QUERY_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
