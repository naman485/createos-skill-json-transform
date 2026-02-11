import { Hono } from 'hono';
import { executeQuery } from '../lib/query.js';
import { success, error, ErrorCodes } from '../utils/response.js';

const app = new Hono();

interface QueryRequest {
  data: unknown;
  query: string;
}

app.post('/', async (c) => {
  const startTime = Date.now();

  let body: QueryRequest;
  try {
    body = await c.req.json();
  } catch {
    return error(c, ErrorCodes.INVALID_INPUT, 'Request body must be valid JSON');
  }

  const { data, query } = body;

  if (data === undefined || data === null) {
    return error(c, ErrorCodes.INVALID_INPUT, 'Missing required field: data');
  }

  if (!query || typeof query !== 'string') {
    return error(c, ErrorCodes.INVALID_INPUT, 'query must be a non-empty string');
  }

  try {
    const result = executeQuery(data, query);
    return success(c, result, startTime);
  } catch (e) {
    return error(c, ErrorCodes.QUERY_ERROR, (e as Error).message);
  }
});

export default app;
