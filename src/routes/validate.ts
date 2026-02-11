import { Hono } from 'hono';
import { validateSchema } from '../lib/validate.js';
import { success, error, ErrorCodes } from '../utils/response.js';

const app = new Hono();

interface ValidateRequest {
  data: unknown;
  schema: object;
}

app.post('/', async (c) => {
  const startTime = Date.now();

  let body: ValidateRequest;
  try {
    body = await c.req.json();
  } catch {
    return error(c, ErrorCodes.INVALID_INPUT, 'Request body must be valid JSON');
  }

  const { data, schema } = body;

  if (data === undefined) {
    return error(c, ErrorCodes.INVALID_INPUT, 'Missing required field: data');
  }

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return error(c, ErrorCodes.INVALID_INPUT, 'schema must be a valid JSON Schema object');
  }

  try {
    const result = validateSchema(data, schema);
    return success(c, result, startTime);
  } catch (e) {
    return error(c, ErrorCodes.VALIDATION_ERROR, (e as Error).message);
  }
});

export default app;
