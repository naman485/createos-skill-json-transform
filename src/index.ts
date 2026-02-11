import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import transformRoute from './routes/transform.js';
import flattenRoute from './routes/flatten.js';
import queryRoute from './routes/query.js';
import diffRoute from './routes/diff.js';
import validateRoute from './routes/validate.js';

const app = new Hono();
const startTime = Date.now();
const VERSION = '1.0.1';

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Logger middleware
app.use('*', logger((str, ...rest) => {
  console.log(str, ...rest);
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: VERSION,
  });
});

// Service info
app.get('/', (c) => {
  return c.json({
    name: 'json-transform',
    version: VERSION,
    description: 'Convert JSON to CSV, XML, YAML, TOML, and back — in one API call.',
    pricing: { credits: 1, usd: '$0.01' },
    endpoints: [
      { method: 'POST', path: '/api/transform', description: 'Convert data between formats (JSON, CSV, XML, YAML, TOML)' },
      { method: 'POST', path: '/api/flatten', description: 'Flatten nested JSON into dot-notation keys' },
      { method: 'POST', path: '/api/unflatten', description: 'Expand dot-notation keys back into nested objects' },
      { method: 'POST', path: '/api/query', description: 'Query JSON data using JMESPath expressions' },
      { method: 'POST', path: '/api/diff', description: 'Compare two JSON objects and return differences' },
      { method: 'POST', path: '/api/validate', description: 'Validate JSON data against a JSON Schema' },
    ],
    docs: '/docs',
    health: '/health',
    mcp: '/mcp-tool.json',
  });
});

// MCP tool definition
app.get('/mcp-tool.json', (c) => {
  return c.json({
    name: 'json_transform',
    description: 'Convert data between JSON, CSV, XML, YAML, and TOML formats. Also supports flattening nested objects, querying with JMESPath, comparing JSON objects (diff), and validating against JSON Schema.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['transform', 'flatten', 'unflatten', 'query', 'diff', 'validate'],
          description: 'The operation to perform'
        },
        input: {
          type: 'string',
          enum: ['json', 'csv', 'xml', 'yaml', 'toml'],
          description: 'Input format (for transform action)'
        },
        output: {
          type: 'string',
          enum: ['json', 'csv', 'xml', 'yaml', 'toml'],
          description: 'Output format (for transform action)'
        },
        data: {
          description: 'The data to process'
        }
      },
      required: ['action']
    },
    endpoint: 'POST /api/{action}',
    pricing: { credits: 1, usd: 0.01 }
  });
});

// Documentation page
app.get('/docs', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON Transform API - Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; background: #0d1117; color: #c9d1d9; line-height: 1.6; padding: 2rem; max-width: 900px; margin: 0 auto; }
    h1 { color: #58a6ff; margin-bottom: 0.5rem; }
    h2 { color: #58a6ff; margin: 2rem 0 1rem; border-bottom: 1px solid #30363d; padding-bottom: 0.5rem; }
    h3 { color: #79c0ff; margin: 1.5rem 0 0.5rem; }
    p { margin-bottom: 1rem; }
    code { background: #161b22; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    pre { background: #161b22; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; border: 1px solid #30363d; }
    pre code { background: none; padding: 0; }
    .endpoint { background: #161b22; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 3px solid #58a6ff; }
    .method { background: #238636; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 0.8em; }
    .method.post { background: #1f6feb; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #30363d; }
    th { color: #58a6ff; }
    .badge { display: inline-block; background: #238636; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8em; margin-left: 0.5rem; }
    a { color: #58a6ff; }
  </style>
</head>
<body>
  <h1>JSON Transform API</h1>
  <p>Convert JSON to CSV, XML, YAML, TOML, and back — in one API call.</p>
  <p><span class="badge">1 credit</span> per request ($0.01)</p>

  <h2>Endpoints</h2>

  <div class="endpoint">
    <h3><span class="method post">POST</span> /api/transform</h3>
    <p>Convert data between formats.</p>
    <pre><code>curl -X POST https://json-transform.nodeops.app/api/transform \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "json",
    "output": "yaml",
    "data": {"name": "NK", "skills": ["code", "deploy"]}
  }'</code></pre>
  </div>

  <div class="endpoint">
    <h3><span class="method post">POST</span> /api/flatten</h3>
    <p>Flatten nested JSON into dot-notation keys.</p>
    <pre><code>curl -X POST https://json-transform.nodeops.app/api/flatten \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {"user": {"name": {"first": "NK"}}},
    "delimiter": "."
  }'</code></pre>
  </div>

  <div class="endpoint">
    <h3><span class="method post">POST</span> /api/unflatten</h3>
    <p>Expand dot-notation keys back into nested objects.</p>
    <pre><code>curl -X POST https://json-transform.nodeops.app/api/unflatten \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {"user.name.first": "NK"},
    "delimiter": "."
  }'</code></pre>
  </div>

  <div class="endpoint">
    <h3><span class="method post">POST</span> /api/query</h3>
    <p>Query JSON data using JMESPath expressions.</p>
    <pre><code>curl -X POST https://json-transform.nodeops.app/api/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {"users": [{"name": "NK", "role": "admin"}, {"name": "Bob", "role": "user"}]},
    "query": "users[?role==\\u0027admin\\u0027].name"
  }'</code></pre>
  </div>

  <div class="endpoint">
    <h3><span class="method post">POST</span> /api/diff</h3>
    <p>Compare two JSON objects and return differences.</p>
    <pre><code>curl -X POST https://json-transform.nodeops.app/api/diff \\
  -H "Content-Type: application/json" \\
  -d '{
    "original": {"name": "NK", "age": 25},
    "modified": {"name": "NK", "age": 26, "city": "SF"}
  }'</code></pre>
  </div>

  <div class="endpoint">
    <h3><span class="method post">POST</span> /api/validate</h3>
    <p>Validate JSON data against a JSON Schema.</p>
    <pre><code>curl -X POST https://json-transform.nodeops.app/api/validate \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": {"name": "NK", "email": "nk@example.com"},
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"}
      },
      "required": ["name", "email"]
    }
  }'</code></pre>
  </div>

  <h2>Supported Formats</h2>
  <table>
    <tr><th>Format</th><th>Input</th><th>Output</th></tr>
    <tr><td>JSON</td><td>Object, array, or JSON string</td><td>Pretty-printed JSON string</td></tr>
    <tr><td>CSV</td><td>CSV string</td><td>CSV string with headers</td></tr>
    <tr><td>XML</td><td>XML string</td><td>XML string with root element</td></tr>
    <tr><td>YAML</td><td>YAML string</td><td>YAML string</td></tr>
    <tr><td>TOML</td><td>TOML string</td><td>TOML string</td></tr>
  </table>

  <h2>Error Codes</h2>
  <table>
    <tr><th>Code</th><th>Description</th></tr>
    <tr><td>INVALID_INPUT</td><td>Missing or invalid request field</td></tr>
    <tr><td>INVALID_FORMAT</td><td>Unsupported format specified</td></tr>
    <tr><td>PARSE_ERROR</td><td>Failed to parse input data</td></tr>
    <tr><td>PAYLOAD_TOO_LARGE</td><td>Data exceeds 5MB limit</td></tr>
    <tr><td>QUERY_ERROR</td><td>Invalid JMESPath query</td></tr>
    <tr><td>VALIDATION_ERROR</td><td>Schema validation failed</td></tr>
  </table>

  <p style="margin-top: 2rem; color: #8b949e;">Powered by <a href="https://createos.nodeops.network">CreateOS</a></p>
</body>
</html>`;

  return c.html(html);
});

// API routes
app.route('/api/transform', transformRoute);
app.route('/api', flattenRoute);
app.route('/api/query', queryRoute);
app.route('/api/diff', diffRoute);
app.route('/api/validate', validateRoute);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3000', 10);

console.log(\`🚀 json-transform v\${VERSION} running on port \${port}\`);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default {
  port,
  fetch: app.fetch,
};
