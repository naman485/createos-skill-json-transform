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
    demo: '/demo',
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

// Interactive Demo page
app.get('/demo', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON Transform - Interactive Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
      color: #c9d1d9;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 2rem; }
    h1 {
      color: #58a6ff;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(90deg, #58a6ff, #a371f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: #8b949e; font-size: 1.1rem; }
    .badge {
      display: inline-block;
      background: linear-gradient(90deg, #238636, #2ea043);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .tab {
      padding: 0.75rem 1.5rem;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 8px;
      color: #c9d1d9;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    .tab:hover { background: #30363d; border-color: #58a6ff; }
    .tab.active {
      background: #1f6feb;
      border-color: #1f6feb;
      color: white;
    }
    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .main-grid { grid-template-columns: 1fr; }
    }
    .panel {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #30363d;
    }
    .panel-title { color: #58a6ff; font-weight: 600; }
    label {
      display: block;
      color: #8b949e;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    select, textarea, input {
      width: 100%;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      color: #c9d1d9;
      padding: 0.75rem;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    select:focus, textarea:focus, input:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }
    textarea {
      min-height: 200px;
      resize: vertical;
      line-height: 1.5;
    }
    .format-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .btn {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(90deg, #238636, #2ea043);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 1rem;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(35, 134, 54, 0.4);
    }
    .btn:active { transform: translateY(0); }
    .btn:disabled {
      background: #30363d;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .output {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 1rem;
      min-height: 200px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-x: auto;
      line-height: 1.5;
    }
    .output.success { border-color: #238636; }
    .output.error { border-color: #f85149; }
    .meta {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      font-size: 0.85rem;
    }
    .meta-item {
      background: #21262d;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .meta-label { color: #8b949e; }
    .meta-value { color: #58a6ff; font-weight: 600; }
    .hidden { display: none !important; }
    .input-group { margin-bottom: 1rem; }
    .examples { margin-top: 1rem; }
    .example-btn {
      padding: 0.4rem 0.8rem;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #8b949e;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-right: 0.5rem;
      margin-top: 0.5rem;
    }
    .example-btn:hover { background: #30363d; color: #c9d1d9; }
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff40;
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 0.5rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    footer {
      text-align: center;
      margin-top: 2rem;
      color: #8b949e;
      font-size: 0.9rem;
    }
    footer a { color: #58a6ff; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    .nav-links {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .nav-links a {
      color: #8b949e;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: #58a6ff; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>JSON Transform</h1>
      <p class="subtitle">Convert JSON to CSV, XML, YAML, TOML and back — in one API call</p>
      <span class="badge">1 credit per request ($0.01)</span>
      <div class="nav-links">
        <a href="/docs">API Docs</a>
        <a href="/mcp-tool.json">MCP Tool</a>
        <a href="/health">Health</a>
      </div>
    </header>

    <div class="tabs">
      <button class="tab active" data-action="transform">Transform</button>
      <button class="tab" data-action="flatten">Flatten</button>
      <button class="tab" data-action="unflatten">Unflatten</button>
      <button class="tab" data-action="query">Query</button>
      <button class="tab" data-action="diff">Diff</button>
      <button class="tab" data-action="validate">Validate</button>
    </div>

    <div class="main-grid">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Input</span>
        </div>

        <!-- Transform inputs -->
        <div id="transform-inputs">
          <div class="format-row">
            <div>
              <label>Input Format</label>
              <select id="input-format">
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="xml">XML</option>
                <option value="csv">CSV</option>
                <option value="toml">TOML</option>
              </select>
            </div>
            <div>
              <label>Output Format</label>
              <select id="output-format">
                <option value="yaml">YAML</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="csv">CSV</option>
                <option value="toml">TOML</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label>Data</label>
            <textarea id="transform-data" placeholder='{"name": "John", "age": 30}'></textarea>
          </div>
          <div class="examples">
            <label>Examples:</label>
            <button class="example-btn" onclick="loadExample('transform', 'simple')">Simple Object</button>
            <button class="example-btn" onclick="loadExample('transform', 'array')">Array</button>
            <button class="example-btn" onclick="loadExample('transform', 'nested')">Nested</button>
          </div>
        </div>

        <!-- Flatten inputs -->
        <div id="flatten-inputs" class="hidden">
          <div class="input-group">
            <label>Nested JSON Data</label>
            <textarea id="flatten-data" placeholder='{"user": {"name": {"first": "John"}}}'></textarea>
          </div>
          <div class="input-group">
            <label>Delimiter (default: .)</label>
            <input type="text" id="flatten-delimiter" value="." placeholder=".">
          </div>
          <div class="examples">
            <label>Examples:</label>
            <button class="example-btn" onclick="loadExample('flatten', 'simple')">Simple</button>
            <button class="example-btn" onclick="loadExample('flatten', 'deep')">Deep Nested</button>
          </div>
        </div>

        <!-- Unflatten inputs -->
        <div id="unflatten-inputs" class="hidden">
          <div class="input-group">
            <label>Flattened JSON Data</label>
            <textarea id="unflatten-data" placeholder='{"user.name.first": "John"}'></textarea>
          </div>
          <div class="input-group">
            <label>Delimiter (default: .)</label>
            <input type="text" id="unflatten-delimiter" value="." placeholder=".">
          </div>
          <div class="examples">
            <label>Examples:</label>
            <button class="example-btn" onclick="loadExample('unflatten', 'simple')">Simple</button>
          </div>
        </div>

        <!-- Query inputs -->
        <div id="query-inputs" class="hidden">
          <div class="input-group">
            <label>JSON Data</label>
            <textarea id="query-data" placeholder='{"users": [{"name": "John", "role": "admin"}]}'></textarea>
          </div>
          <div class="input-group">
            <label>JMESPath Query</label>
            <input type="text" id="query-expression" placeholder="users[?role=='admin'].name">
          </div>
          <div class="examples">
            <label>Examples:</label>
            <button class="example-btn" onclick="loadExample('query', 'filter')">Filter</button>
            <button class="example-btn" onclick="loadExample('query', 'select')">Select Fields</button>
          </div>
        </div>

        <!-- Diff inputs -->
        <div id="diff-inputs" class="hidden">
          <div class="input-group">
            <label>Original JSON</label>
            <textarea id="diff-original" placeholder='{"name": "John", "age": 25}' style="min-height: 120px;"></textarea>
          </div>
          <div class="input-group">
            <label>Modified JSON</label>
            <textarea id="diff-modified" placeholder='{"name": "John", "age": 26, "city": "NYC"}' style="min-height: 120px;"></textarea>
          </div>
          <div class="examples">
            <label>Examples:</label>
            <button class="example-btn" onclick="loadExample('diff', 'simple')">Simple Diff</button>
          </div>
        </div>

        <!-- Validate inputs -->
        <div id="validate-inputs" class="hidden">
          <div class="input-group">
            <label>JSON Data</label>
            <textarea id="validate-data" placeholder='{"name": "John", "email": "john@example.com"}' style="min-height: 100px;"></textarea>
          </div>
          <div class="input-group">
            <label>JSON Schema</label>
            <textarea id="validate-schema" placeholder='{"type": "object", "properties": {...}}' style="min-height: 100px;"></textarea>
          </div>
          <div class="examples">
            <label>Examples:</label>
            <button class="example-btn" onclick="loadExample('validate', 'valid')">Valid Data</button>
            <button class="example-btn" onclick="loadExample('validate', 'invalid')">Invalid Data</button>
          </div>
        </div>

        <button class="btn" id="execute-btn" onclick="execute()">
          Execute
        </button>
      </div>

      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Output</span>
        </div>
        <div class="output" id="output">Click "Execute" to see results...</div>
        <div class="meta" id="meta" style="display: none;">
          <div class="meta-item">
            <span class="meta-label">Credits:</span>
            <span class="meta-value" id="meta-credits">-</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Time:</span>
            <span class="meta-value" id="meta-time">-</span>
          </div>
        </div>
      </div>
    </div>

    <footer>
      <p>Powered by <a href="https://createos.nodeops.network" target="_blank">CreateOS</a></p>
    </footer>
  </div>

  <script>
    let currentAction = 'transform';
    const apiBase = window.location.origin;

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentAction = tab.dataset.action;

        // Hide all input sections
        document.querySelectorAll('[id$="-inputs"]').forEach(el => el.classList.add('hidden'));
        // Show current input section
        document.getElementById(currentAction + '-inputs').classList.remove('hidden');

        // Reset output
        document.getElementById('output').textContent = 'Click "Execute" to see results...';
        document.getElementById('output').className = 'output';
        document.getElementById('meta').style.display = 'none';
      });
    });

    // Example data
    const examples = {
      transform: {
        simple: { data: '{"name": "John Doe", "age": 30, "city": "New York"}' },
        array: { data: '[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]' },
        nested: { data: '{"user": {"name": "John", "address": {"city": "NYC", "zip": "10001"}}, "active": true}' }
      },
      flatten: {
        simple: { data: '{"user": {"name": "John", "email": "john@example.com"}}' },
        deep: { data: '{"company": {"department": {"team": {"lead": {"name": "John"}}}}}' }
      },
      unflatten: {
        simple: { data: '{"user.name": "John", "user.email": "john@example.com", "user.address.city": "NYC"}' }
      },
      query: {
        filter: {
          data: '{"users": [{"name": "John", "role": "admin", "age": 30}, {"name": "Jane", "role": "user", "age": 25}, {"name": "Bob", "role": "admin", "age": 35}]}',
          query: "users[?role=='admin'].name"
        },
        select: {
          data: '{"items": [{"id": 1, "name": "Apple", "price": 1.5}, {"id": 2, "name": "Banana", "price": 0.5}]}',
          query: "items[*].{product: name, cost: price}"
        }
      },
      diff: {
        simple: {
          original: '{"name": "John", "age": 25, "city": "Boston"}',
          modified: '{"name": "John", "age": 26, "city": "NYC", "active": true}'
        }
      },
      validate: {
        valid: {
          data: '{"name": "John Doe", "email": "john@example.com", "age": 30}',
          schema: '{"type": "object", "properties": {"name": {"type": "string"}, "email": {"type": "string", "format": "email"}, "age": {"type": "integer", "minimum": 0}}, "required": ["name", "email"]}'
        },
        invalid: {
          data: '{"name": "John", "email": "not-an-email", "age": -5}',
          schema: '{"type": "object", "properties": {"name": {"type": "string"}, "email": {"type": "string", "format": "email"}, "age": {"type": "integer", "minimum": 0}}, "required": ["name", "email"]}'
        }
      }
    };

    function loadExample(action, type) {
      const example = examples[action][type];
      switch(action) {
        case 'transform':
          document.getElementById('transform-data').value = example.data;
          break;
        case 'flatten':
          document.getElementById('flatten-data').value = example.data;
          break;
        case 'unflatten':
          document.getElementById('unflatten-data').value = example.data;
          break;
        case 'query':
          document.getElementById('query-data').value = example.data;
          document.getElementById('query-expression').value = example.query;
          break;
        case 'diff':
          document.getElementById('diff-original').value = example.original;
          document.getElementById('diff-modified').value = example.modified;
          break;
        case 'validate':
          document.getElementById('validate-data').value = example.data;
          document.getElementById('validate-schema').value = example.schema;
          break;
      }
    }

    async function execute() {
      const btn = document.getElementById('execute-btn');
      const output = document.getElementById('output');
      const meta = document.getElementById('meta');

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Processing...';
      output.textContent = 'Processing...';
      output.className = 'output';
      meta.style.display = 'none';

      try {
        let endpoint, body;

        switch(currentAction) {
          case 'transform':
            endpoint = '/api/transform';
            const inputFormat = document.getElementById('input-format').value;
            const outputFormat = document.getElementById('output-format').value;
            let transformData = document.getElementById('transform-data').value;

            // Parse JSON if input format is JSON
            if (inputFormat === 'json') {
              try {
                transformData = JSON.parse(transformData);
              } catch (e) {
                throw new Error('Invalid JSON input: ' + e.message);
              }
            }

            body = { input: inputFormat, output: outputFormat, data: transformData };
            break;

          case 'flatten':
            endpoint = '/api/flatten';
            body = {
              data: JSON.parse(document.getElementById('flatten-data').value),
              delimiter: document.getElementById('flatten-delimiter').value || '.'
            };
            break;

          case 'unflatten':
            endpoint = '/api/unflatten';
            body = {
              data: JSON.parse(document.getElementById('unflatten-data').value),
              delimiter: document.getElementById('unflatten-delimiter').value || '.'
            };
            break;

          case 'query':
            endpoint = '/api/query';
            body = {
              data: JSON.parse(document.getElementById('query-data').value),
              query: document.getElementById('query-expression').value
            };
            break;

          case 'diff':
            endpoint = '/api/diff';
            body = {
              original: JSON.parse(document.getElementById('diff-original').value),
              modified: JSON.parse(document.getElementById('diff-modified').value)
            };
            break;

          case 'validate':
            endpoint = '/api/validate';
            body = {
              data: JSON.parse(document.getElementById('validate-data').value),
              schema: JSON.parse(document.getElementById('validate-schema').value)
            };
            break;
        }

        const response = await fetch(apiBase + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const result = await response.json();

        if (result.success) {
          output.className = 'output success';
          output.textContent = JSON.stringify(result.data, null, 2);
          meta.style.display = 'flex';
          document.getElementById('meta-credits').textContent = result.meta?.credits || 1;
          document.getElementById('meta-time').textContent = (result.meta?.processingMs || 0) + 'ms';
        } else {
          output.className = 'output error';
          output.textContent = 'Error: ' + result.error.code + '\\n\\n' + result.error.message;
        }
      } catch (error) {
        output.className = 'output error';
        output.textContent = 'Error: ' + error.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Execute';
      }
    }

    // Load default example
    loadExample('transform', 'simple');
  </script>
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

console.log(`🚀 json-transform v${VERSION} running on port ${port}`);

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
