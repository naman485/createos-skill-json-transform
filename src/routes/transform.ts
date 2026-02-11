import { Hono } from 'hono';
import { parseInput, convertTo, isValidFormat, getByteSize, type Format, type TransformOptions } from '../lib/transform.js';
import { success, error, ErrorCodes } from '../utils/response.js';

const app = new Hono();

interface TransformRequest {
  input: string;
  output: string;
  data: unknown;
  options?: TransformOptions;
}

app.post('/', async (c) => {
  const startTime = Date.now();

  let body: TransformRequest;
  try {
    body = await c.req.json();
  } catch {
    return error(c, ErrorCodes.INVALID_INPUT, 'Request body must be valid JSON');
  }

  const { input, output, data, options = {} } = body;

  // Validate required fields
  if (!input) {
    return error(c, ErrorCodes.INVALID_INPUT, 'Missing required field: input');
  }
  if (!output) {
    return error(c, ErrorCodes.INVALID_INPUT, 'Missing required field: output');
  }
  if (data === undefined || data === null) {
    return error(c, ErrorCodes.INVALID_INPUT, 'Missing required field: data');
  }

  // Validate formats
  if (!isValidFormat(input)) {
    return error(c, ErrorCodes.INVALID_FORMAT, `Invalid input format: ${input}. Supported: json, csv, xml, yaml, toml`);
  }
  if (!isValidFormat(output)) {
    return error(c, ErrorCodes.INVALID_FORMAT, `Invalid output format: ${output}. Supported: json, csv, xml, yaml, toml`);
  }

  // Check same format
  if (input === output) {
    return error(c, ErrorCodes.UNSUPPORTED_CONVERSION, `Input and output formats are the same: ${input}`);
  }

  // Check data size
  const inputStr = typeof data === 'string' ? data : JSON.stringify(data);
  const inputSize = getByteSize(inputStr);
  if (inputSize > 5 * 1024 * 1024) {
    return error(c, ErrorCodes.PAYLOAD_TOO_LARGE, 'Data exceeds 5MB limit', 413);
  }

  try {
    // Parse input
    const parsed = parseInput(data, input as Format);

    // Convert to output format
    const result = convertTo(parsed, output as Format, options);
    const outputSize = getByteSize(result);

    return success(c, {
      result,
      inputFormat: input,
      outputFormat: output,
      inputSize,
      outputSize,
    }, startTime);
  } catch (e) {
    const message = (e as Error).message;

    if (message.includes('Invalid')) {
      return error(c, ErrorCodes.PARSE_ERROR, message);
    }
    if (message.includes('circular')) {
      return error(c, ErrorCodes.CIRCULAR_REFERENCE, 'Data contains circular references');
    }

    return error(c, ErrorCodes.INTERNAL_ERROR, message, 500);
  }
});

export default app;
