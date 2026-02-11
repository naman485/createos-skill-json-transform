import { Hono } from 'hono';
import { computeDiff } from '../lib/diff.js';
import { success, error, ErrorCodes } from '../utils/response.js';

const app = new Hono();

interface DiffRequest {
  original: unknown;
  modified: unknown;
  format?: 'detailed' | 'simple';
}

app.post('/', async (c) => {
  const startTime = Date.now();

  let body: DiffRequest;
  try {
    body = await c.req.json();
  } catch {
    return error(c, ErrorCodes.INVALID_INPUT, 'Request body must be valid JSON');
  }

  const { original, modified } = body;

  if (original === undefined) {
    return error(c, ErrorCodes.INVALID_INPUT, 'Missing required field: original');
  }

  if (modified === undefined) {
    return error(c, ErrorCodes.INVALID_INPUT, 'Missing required field: modified');
  }

  try {
    const result = computeDiff(original, modified);
    return success(c, result, startTime);
  } catch (e) {
    return error(c, ErrorCodes.INTERNAL_ERROR, (e as Error).message, 500);
  }
});

export default app;
