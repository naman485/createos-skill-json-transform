import { Hono } from 'hono';
import { flatten, unflatten } from '../utils/flatten.js';
import { success, error, ErrorCodes } from '../utils/response.js';

const app = new Hono();

interface FlattenRequest {
  data: Record<string, unknown>;
  delimiter?: string;
  maxDepth?: number;
}

interface UnflattenRequest {
  data: Record<string, unknown>;
  delimiter?: string;
}

app.post('/flatten', async (c) => {
  const startTime = Date.now();

  let body: FlattenRequest;
  try {
    body = await c.req.json();
  } catch {
    return error(c, ErrorCodes.INVALID_INPUT, 'Request body must be valid JSON');
  }

  const { data, delimiter = '.', maxDepth = 10 } = body;

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return error(c, ErrorCodes.INVALID_INPUT, 'data must be a plain object');
  }

  if (typeof delimiter !== 'string' || delimiter.length === 0) {
    return error(c, ErrorCodes.INVALID_INPUT, 'delimiter must be a non-empty string');
  }

  if (typeof maxDepth !== 'number' || maxDepth < 1 || maxDepth > 100) {
    return error(c, ErrorCodes.INVALID_INPUT, 'maxDepth must be a number between 1 and 100');
  }

  try {
    const result = flatten(data, { delimiter, maxDepth });
    return success(c, result, startTime);
  } catch (e) {
    return error(c, ErrorCodes.INTERNAL_ERROR, (e as Error).message, 500);
  }
});

app.post('/unflatten', async (c) => {
  const startTime = Date.now();

  let body: UnflattenRequest;
  try {
    body = await c.req.json();
  } catch {
    return error(c, ErrorCodes.INVALID_INPUT, 'Request body must be valid JSON');
  }

  const { data, delimiter = '.' } = body;

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return error(c, ErrorCodes.INVALID_INPUT, 'data must be a plain object');
  }

  if (typeof delimiter !== 'string' || delimiter.length === 0) {
    return error(c, ErrorCodes.INVALID_INPUT, 'delimiter must be a non-empty string');
  }

  try {
    const result = unflatten(data, delimiter);
    return success(c, result, startTime);
  } catch (e) {
    return error(c, ErrorCodes.INTERNAL_ERROR, (e as Error).message, 500);
  }
});

export default app;
