export interface FlattenOptions {
  delimiter?: string;
  maxDepth?: number;
}

export interface FlattenResult {
  result: Record<string, unknown>;
  keysFlattened: number;
  originalDepth: number;
}

function getDepth(obj: unknown, currentDepth = 0): number {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return currentDepth + 1;
    return Math.max(...obj.map(item => getDepth(item, currentDepth + 1)));
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) return currentDepth + 1;

  return Math.max(...keys.map(key => getDepth((obj as Record<string, unknown>)[key], currentDepth + 1)));
}

export function flatten(
  obj: Record<string, unknown>,
  options: FlattenOptions = {}
): FlattenResult {
  const { delimiter = '.', maxDepth = 10 } = options;
  const result: Record<string, unknown> = {};
  const originalDepth = getDepth(obj);
  let keysFlattened = 0;

  function recurse(current: unknown, path: string, depth: number): void {
    if (depth > maxDepth) {
      result[path] = current;
      keysFlattened++;
      return;
    }

    if (typeof current !== 'object' || current === null) {
      result[path] = current;
      keysFlattened++;
      return;
    }

    if (Array.isArray(current)) {
      if (current.length === 0) {
        result[path] = current;
        keysFlattened++;
        return;
      }
      current.forEach((item, index) => {
        recurse(item, path ? `${path}${delimiter}${index}` : String(index), depth + 1);
      });
      return;
    }

    const keys = Object.keys(current);
    if (keys.length === 0) {
      result[path] = current;
      keysFlattened++;
      return;
    }

    for (const key of keys) {
      const newPath = path ? `${path}${delimiter}${key}` : key;
      recurse((current as Record<string, unknown>)[key], newPath, depth + 1);
    }
  }

  recurse(obj, '', 0);
  return { result, keysFlattened, originalDepth };
}

export interface UnflattenResult {
  result: Record<string, unknown>;
  keysExpanded: number;
}

export function unflatten(
  obj: Record<string, unknown>,
  delimiter = '.'
): UnflattenResult {
  const result: Record<string, unknown> = {};
  let keysExpanded = 0;

  for (const [flatKey, value] of Object.entries(obj)) {
    const keys = flatKey.split(delimiter);
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const nextKey = keys[i + 1];
      const isNextArray = /^\d+$/.test(nextKey);

      if (!(key in current)) {
        current[key] = isNextArray ? [] : {};
      }
      current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    keysExpanded++;
  }

  return { result, keysExpanded };
}
