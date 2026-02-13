---
name: json-transform
description: Transform data between JSON, CSV, XML, YAML, and TOML formats. Use when the user wants to convert data formats, flatten/unflatten JSON, query JSON with JMESPath, diff JSON objects, or validate JSON against a schema. Also use when user mentions "convert json", "yaml to json", "flatten json", "json diff", or "validate schema".
allowed-tools: Bash, WebFetch
argument-hint: [action] [data]
---

# JSON Transform Skill

Transform data between formats using the JSON Transform API.

**API Base**: `https://production-json-transform.tyzo.nodeops.app`

## Available Actions

### 1. Transform (Convert Formats)
Convert between JSON, CSV, XML, YAML, and TOML.

```bash
curl -s -X POST https://production-json-transform.tyzo.nodeops.app/api/transform \
  -H "Content-Type: application/json" \
  -d '{
    "input": "json",
    "output": "yaml",
    "data": {"name": "Example", "value": 123}
  }'
```

**Supported formats**: `json`, `csv`, `xml`, `yaml`, `toml`

### 2. Flatten
Flatten nested JSON into dot-notation keys.

```bash
curl -s -X POST https://production-json-transform.tyzo.nodeops.app/api/flatten \
  -H "Content-Type: application/json" \
  -d '{
    "data": {"user": {"name": {"first": "John"}}},
    "delimiter": "."
  }'
```

### 3. Unflatten
Expand dot-notation keys back into nested objects.

```bash
curl -s -X POST https://production-json-transform.tyzo.nodeops.app/api/unflatten \
  -H "Content-Type: application/json" \
  -d '{
    "data": {"user.name.first": "John"},
    "delimiter": "."
  }'
```

### 4. Query (JMESPath)
Query JSON data using JMESPath expressions.

```bash
curl -s -X POST https://production-json-transform.tyzo.nodeops.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "data": {"users": [{"name": "John", "role": "admin"}]},
    "query": "users[?role=='"'"'admin'"'"'].name"
  }'
```

### 5. Diff
Compare two JSON objects and return differences.

```bash
curl -s -X POST https://production-json-transform.tyzo.nodeops.app/api/diff \
  -H "Content-Type: application/json" \
  -d '{
    "original": {"name": "John", "age": 25},
    "modified": {"name": "John", "age": 26, "city": "NYC"}
  }'
```

### 6. Validate
Validate JSON data against a JSON Schema.

```bash
curl -s -X POST https://production-json-transform.tyzo.nodeops.app/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "data": {"name": "John", "email": "john@example.com"},
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"}
      },
      "required": ["name", "email"]
    }
  }'
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { "result": "..." },
  "meta": { "credits": 1, "processingMs": 5 }
}
```

## Instructions

When the user wants to transform data:

1. **Identify the action**: transform, flatten, unflatten, query, diff, or validate
2. **Prepare the request**: Format the user's data as JSON
3. **Execute the API call**: Use curl or fetch to call the appropriate endpoint
4. **Present the result**: Show the transformed data clearly

For inline transformations, execute the curl command and display the result.

## Examples

**User**: "Convert this JSON to YAML: {name: 'test'}"
**Action**: Call `/api/transform` with `input: "json"`, `output: "yaml"`

**User**: "Flatten this nested object"
**Action**: Call `/api/flatten` with the user's data

**User**: "Find all admins in this user list"
**Action**: Call `/api/query` with appropriate JMESPath expression

## Links

- [Interactive Demo](https://production-json-transform.tyzo.nodeops.app/demo)
- [API Documentation](https://production-json-transform.tyzo.nodeops.app/docs)
- [MCP Tool Definition](https://production-json-transform.tyzo.nodeops.app/mcp-tool.json)
