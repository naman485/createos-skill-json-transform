import yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as TOML from 'smol-toml';
import { flatten as flattenObj } from '../utils/flatten.js';

export type Format = 'json' | 'csv' | 'xml' | 'yaml' | 'toml';

export interface TransformOptions {
  pretty?: boolean;
  delimiter?: string;
  headers?: boolean;
  rootElement?: string;
  indent?: number;
  flattenArrays?: boolean;
  flattenDepth?: number;
}

const SUPPORTED_FORMATS: Format[] = ['json', 'csv', 'xml', 'yaml', 'toml'];

export function isValidFormat(format: string): format is Format {
  return SUPPORTED_FORMATS.includes(format as Format);
}

export function parseInput(data: unknown, format: Format): unknown {
  if (format === 'json') {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        const error = e as SyntaxError;
        throw new Error(`Invalid JSON: ${error.message}`);
      }
    }
    return data;
  }

  if (typeof data !== 'string') {
    throw new Error(`${format.toUpperCase()} input must be a string`);
  }

  switch (format) {
    case 'csv':
      return parseCSV(data);
    case 'xml':
      return parseXML(data);
    case 'yaml':
      return parseYAML(data);
    case 'toml':
      return parseTOML(data);
    default:
      throw new Error(`Unsupported input format: ${format}`);
  }
}

function parseCSV(data: string): Record<string, unknown>[] {
  const lines = data.trim().split('\n');
  if (lines.length === 0) {
    return [];
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delimiter);
  const result: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const row: Record<string, unknown> = {};

    for (let j = 0; j < headers.length; j++) {
      let value: unknown = values[j] ?? '';

      // Try to parse as number or boolean
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value !== '' && !isNaN(Number(value))) value = Number(value);

      row[headers[j]] = value;
    }
    result.push(row);
  }

  return result;
}

function detectDelimiter(line: string): string {
  const delimiters = [',', '\t', '|', ';'];
  let maxCount = 0;
  let detected = ',';

  for (const d of delimiters) {
    const count = (line.match(new RegExp(d === '|' ? '\\|' : d, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      detected = d;
    }
  }

  return detected;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseXML(data: string): unknown {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: true,
    parseTagValue: true,
  });

  try {
    return parser.parse(data);
  } catch (e) {
    throw new Error(`Invalid XML: ${(e as Error).message}`);
  }
}

function parseYAML(data: string): unknown {
  try {
    return yaml.load(data);
  } catch (e) {
    throw new Error(`Invalid YAML: ${(e as Error).message}`);
  }
}

function parseTOML(data: string): unknown {
  try {
    return TOML.parse(data);
  } catch (e) {
    throw new Error(`Invalid TOML: ${(e as Error).message}`);
  }
}

export function convertTo(data: unknown, format: Format, options: TransformOptions = {}): string {
  const { pretty = true, indent = 2 } = options;

  switch (format) {
    case 'json':
      return pretty ? JSON.stringify(data, null, indent) : JSON.stringify(data);
    case 'csv':
      return toCSV(data, options);
    case 'xml':
      return toXML(data, options);
    case 'yaml':
      return toYAML(data, options);
    case 'toml':
      return toTOML(data);
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}

function toCSV(data: unknown, options: TransformOptions): string {
  const { delimiter = ',', headers = true, flattenArrays = true, flattenDepth = 1 } = options;

  if (!Array.isArray(data)) {
    data = [data];
  }

  const rows = data as Record<string, unknown>[];
  if (rows.length === 0) {
    return '';
  }

  // Flatten nested objects if needed
  const flattenedRows = rows.map(row => {
    if (typeof row !== 'object' || row === null) {
      return { value: row };
    }
    const { result } = flattenObj(row as Record<string, unknown>, {
      delimiter: '.',
      maxDepth: flattenDepth
    });
    return result;
  });

  // Collect all unique headers
  const allHeaders = new Set<string>();
  for (const row of flattenedRows) {
    Object.keys(row).forEach(key => allHeaders.add(key));
  }
  const headerArray = Array.from(allHeaders);

  const lines: string[] = [];

  if (headers) {
    lines.push(headerArray.map(h => escapeCSVValue(h, delimiter)).join(delimiter));
  }

  for (const row of flattenedRows) {
    const values = headerArray.map(header => {
      let value = row[header];

      if (Array.isArray(value)) {
        value = flattenArrays ? value.join(';') : JSON.stringify(value);
      } else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }

      return escapeCSVValue(String(value ?? ''), delimiter);
    });
    lines.push(values.join(delimiter));
  }

  return lines.join('\n');
}

function escapeCSVValue(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toXML(data: unknown, options: TransformOptions): string {
  const { rootElement = 'root', pretty = true, indent = 2 } = options;

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    format: pretty,
    indentBy: ' '.repeat(indent),
  });

  // Wrap data with root element
  const wrapped = { [rootElement]: data };

  try {
    return builder.build(wrapped);
  } catch (e) {
    throw new Error(`Failed to build XML: ${(e as Error).message}`);
  }
}

function toYAML(data: unknown, options: TransformOptions): string {
  const { indent = 2 } = options;

  try {
    return yaml.dump(data, { indent, lineWidth: -1 });
  } catch (e) {
    throw new Error(`Failed to convert to YAML: ${(e as Error).message}`);
  }
}

function toTOML(data: unknown): string {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('TOML output requires a plain object at the root level');
  }

  try {
    return TOML.stringify(data as Record<string, unknown>);
  } catch (e) {
    throw new Error(`Failed to convert to TOML: ${(e as Error).message}`);
  }
}

export function getByteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}
