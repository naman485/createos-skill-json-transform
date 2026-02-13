import { describe, it, expect, beforeAll } from 'bun:test';

const BASE_URL = 'http://localhost:3000';

describe('JSON Transform API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.version).toBe('1.0.1');
      expect(typeof data.uptime).toBe('number');
    });
  });

  describe('GET /', () => {
    it('should return service info', async () => {
      const res = await fetch(`${BASE_URL}/`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.name).toBe('json-transform');
      expect(data.version).toBe('1.0.1');
      expect(Array.isArray(data.endpoints)).toBe(true);
      expect(data.endpoints.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/transform', () => {
    it('should convert JSON to YAML', async () => {
      const res = await fetch(`${BASE_URL}/api/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'json',
          output: 'yaml',
          data: { name: 'NK', age: 25 },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.result).toContain('name: NK');
      expect(data.data.inputFormat).toBe('json');
      expect(data.data.outputFormat).toBe('yaml');
    });

    it('should convert JSON to CSV', async () => {
      const res = await fetch(`${BASE_URL}/api/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'json',
          output: 'csv',
          data: [
            { name: 'NK', age: 25 },
            { name: 'Bob', age: 30 },
          ],
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.result).toContain('name');
      expect(data.data.result).toContain('NK');
    });

    it('should convert JSON to XML', async () => {
      const res = await fetch(`${BASE_URL}/api/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'json',
          output: 'xml',
          data: { name: 'NK' },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.result).toContain('<root>');
      expect(data.data.result).toContain('<name>NK</name>');
    });

    it('should return error for missing input', async () => {
      const res = await fetch(`${BASE_URL}/api/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          output: 'yaml',
          data: { name: 'NK' },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_INPUT');
    });

    it('should return error for invalid format', async () => {
      const res = await fetch(`${BASE_URL}/api/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'json',
          output: 'invalid',
          data: { name: 'NK' },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_FORMAT');
    });
  });

  describe('POST /api/flatten', () => {
    it('should flatten nested object', async () => {
      const res = await fetch(`${BASE_URL}/api/flatten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { user: { name: { first: 'NK' } } },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.result['user.name.first']).toBe('NK');
    });
  });

  describe('POST /api/unflatten', () => {
    it('should unflatten dot-notation object', async () => {
      const res = await fetch(`${BASE_URL}/api/unflatten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { 'user.name.first': 'NK' },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.result.user.name.first).toBe('NK');
    });
  });

  describe('POST /api/query', () => {
    it('should query JSON with JMESPath', async () => {
      const res = await fetch(`${BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { users: [{ name: 'NK', role: 'admin' }, { name: 'Bob', role: 'user' }] },
          query: "users[?role=='admin'].name",
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.result).toEqual(['NK']);
      expect(data.data.matchCount).toBe(1);
    });
  });

  describe('POST /api/diff', () => {
    it('should compute diff between objects', async () => {
      const res = await fetch(`${BASE_URL}/api/diff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: { name: 'NK', age: 25 },
          modified: { name: 'NK', age: 26, city: 'SF' },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.summary.added).toBe(1);
      expect(data.data.summary.changed).toBe(1);
    });
  });

  describe('POST /api/validate', () => {
    it('should validate valid data against schema', async () => {
      const res = await fetch(`${BASE_URL}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { name: 'NK', email: 'nk@example.com' },
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
            required: ['name', 'email'],
          },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(true);
      expect(data.data.errors).toHaveLength(0);
    });

    it('should return errors for invalid data', async () => {
      const res = await fetch(`${BASE_URL}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { name: 'NK', email: 'not-an-email' },
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
            required: ['name', 'email'],
          },
        }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(false);
      expect(data.data.errors.length).toBeGreaterThan(0);
    });
  });
});
