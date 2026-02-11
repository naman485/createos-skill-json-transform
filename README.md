# JSON Transform

> Convert JSON to CSV, XML, YAML, TOML, and back — in one API call.

## Try It

```bash
curl -X POST https://json-transform.nodeops.app/api/transform \
  -H "Content-Type: application/json" \
  -d '{
    "input": "json",
    "output": "yaml",
    "data": {"name": "NK", "skills": ["code", "deploy"]}
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": "name: NK\nskills:\n  - code\n  - deploy\n",
    "inputFormat": "json",
    "outputFormat": "yaml",
    "inputSize": 42,
    "outputSize": 35
  },
  "meta": { "credits": 1, "processingMs": 3 }
}
```

## API Reference

### `POST /api/transform`
Convert data between JSON, CSV, XML, YAML, and TOML formats.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| input | string | Yes | Input format: json, csv, xml, yaml, toml |
| output | string | Yes | Output format: json, csv, xml, yaml, toml |
| data | any | Yes | Data to convert (object/array for JSON, string for others) |
| options | object | No | Conversion options (see below) |

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| pretty | boolean | true | Pretty-print output |
| delimiter | string | "," | CSV delimiter |
| headers | boolean | true | Include headers in CSV |
| rootElement | string | "root" | Root element name for XML |
| indent | number | 2 | Indentation spaces |

---

### `POST /api/flatten`
Flatten nested JSON into dot-notation keys.

**Request:**
```json
{
  "data": { "user": { "name": { "first": "NK" } } },
  "delimiter": ".",
  "maxDepth": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": { "user.name.first": "NK" },
    "keysFlattened": 1,
    "originalDepth": 3
  }
}
```

---

### `POST /api/unflatten`
Expand dot-notation keys back into nested objects.

**Request:**
```json
{
  "data": { "user.name.first": "NK" },
  "delimiter": "."
}
```

---

### `POST /api/query`
Query JSON data using JMESPath expressions.

**Request:**
```json
{
  "data": { "users": [{ "name": "NK", "role": "admin" }, { "name": "Bob", "role": "user" }] },
  "query": "users[?role=='admin'].name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": ["NK"],
    "query": "users[?role=='admin'].name",
    "matchCount": 1
  }
}
```

---

### `POST /api/diff`
Compare two JSON objects and return differences.

**Request:**
```json
{
  "original": { "name": "NK", "age": 25 },
  "modified": { "name": "NK", "age": 26, "city": "SF" }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "changes": [
      { "path": "age", "type": "changed", "from": 25, "to": 26 },
      { "path": "city", "type": "added", "value": "SF" }
    ],
    "summary": { "added": 1, "removed": 0, "changed": 1, "unchanged": 1 }
  }
}
```

---

### `POST /api/validate`
Validate JSON data against a JSON Schema.

**Request:**
```json
{
  "data": { "name": "NK", "email": "not-an-email" },
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "email": { "type": "string", "format": "email" }
    },
    "required": ["name", "email"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "errors": [
      { "path": "/email", "message": "must match format \"email\"", "keyword": "format" }
    ]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_INPUT | Missing or invalid request field |
| INVALID_FORMAT | Unsupported format specified |
| UNSUPPORTED_CONVERSION | Same input and output format |
| PARSE_ERROR | Failed to parse input data |
| PAYLOAD_TOO_LARGE | Data exceeds 5MB limit |
| CIRCULAR_REFERENCE | Data contains circular references |
| QUERY_ERROR | Invalid JMESPath query |
| VALIDATION_ERROR | Schema validation failed |

## Pricing

| Tier | Credits | USD |
|------|---------|-----|
| Per request | 1 | $0.01 |

> At 100 requests/day, this Skill earns **$24/month** for the publisher (80% split).

## MCP Integration (AI Agents)

This Skill is auto-discoverable by AI agents via MCP:

```bash
# Fetch tool definition:
curl https://json-transform.nodeops.app/mcp-tool.json
```

## Deploy Your Own

```bash
git clone https://github.com/naman485/createos-skill-json-transform
cd createos-skill-json-transform
bun install
bun run start
```

Or deploy to CreateOS:
```bash
npx createos deploy
```

## Tech Stack
- Bun 1.3 + Hono
- js-yaml, fast-xml-parser, smol-toml
- jmespath, ajv, deep-diff
- Deployed on [CreateOS](https://createos.nodeops.network)
# Trigger rebuild
