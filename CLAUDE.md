# JSON Transform Skill

> Convert JSON to CSV, XML, YAML, TOML and back — in one API call.

## Quick Reference

```bash
# Development
bun run dev          # Start with hot reload
bun run start        # Production start
bun test             # Run tests

# Deploy
git push origin main # Auto-deploys to CreateOS
```

## Project Overview

This is a CreateOS Skill — a monetized API microservice deployed on CreateOS platform. It provides data transformation utilities for developers and AI agents.

**Live URL**: https://production-json-transform.tyzo.nodeops.app
**Demo**: https://production-json-transform.tyzo.nodeops.app/demo
**Pricing**: 1 credit ($0.01) per request

## Architecture

```
src/
├── index.ts           # Hono server, routes, /docs, /demo pages
├── routes/            # API endpoint handlers
│   ├── transform.ts   # POST /api/transform - format conversion
│   ├── flatten.ts     # POST /api/flatten & /api/unflatten
│   ├── query.ts       # POST /api/query - JMESPath
│   ├── diff.ts        # POST /api/diff - object comparison
│   └── validate.ts    # POST /api/validate - JSON Schema
├── lib/               # Core business logic
│   ├── transform.ts   # Format parsers & serializers
│   ├── query.ts       # JMESPath wrapper
│   ├── diff.ts        # deep-diff wrapper
│   └── validate.ts    # AJV wrapper
└── utils/
    ├── response.ts    # success() and error() helpers
    └── flatten.ts     # flatten/unflatten utilities
```

## API Response Format

All endpoints return consistent JSON:

```typescript
// Success
{ success: true, data: {...}, meta: { credits: 1, processingMs: 5 } }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "..." } }
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| hono | HTTP framework |
| js-yaml | YAML parsing/serialization |
| fast-xml-parser | XML parsing/serialization |
| smol-toml | TOML parsing/serialization |
| jmespath | JSON querying |
| ajv + ajv-formats | JSON Schema validation |
| deep-diff | Object comparison |

## Code Style

- Use TypeScript with strict mode
- No `any` types — use proper interfaces
- All routes return `success()` or `error()` from utils/response.ts
- Keep route handlers thin — business logic goes in lib/

## Testing

Tests run against the live deployed API:
```bash
# Run full test suite against production
BASE_URL="https://production-json-transform.tyzo.nodeops.app" bun test
```

## CreateOS Deployment

- **Runtime**: Bun 1.3
- **Port**: Reads from `process.env.PORT`, defaults to 3000
- **Auto-deploy**: Push to `main` triggers deployment
- **Project ID**: d6ca0a2d-5841-4d5d-b95c-4c3d1c6862e6

## Common Tasks

### Add a new endpoint
1. Create route handler in `src/routes/`
2. Add business logic in `src/lib/`
3. Register route in `src/index.ts`
4. Update `/` endpoint info and `/docs` page
5. Update `mcp-tool.json` for AI agent discovery

### Add a new format
1. Add parser in `lib/transform.ts` → `parseInput()`
2. Add serializer in `lib/transform.ts` → `serializeOutput()`
3. Add to `VALID_FORMATS` array
4. Update documentation

## Error Codes

| Code | HTTP | When |
|------|------|------|
| INVALID_INPUT | 400 | Missing required field |
| INVALID_FORMAT | 400 | Unsupported format |
| PARSE_ERROR | 400 | Can't parse input data |
| QUERY_ERROR | 400 | Invalid JMESPath |
| VALIDATION_ERROR | 400 | Schema validation failed |
| PAYLOAD_TOO_LARGE | 413 | Data > 5MB |
