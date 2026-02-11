import jmespath from 'jmespath';

export interface QueryResult {
  result: unknown;
  query: string;
  matchCount: number;
}

export function executeQuery(data: unknown, query: string): QueryResult {
  try {
    const result = jmespath.search(data, query);
    const matchCount = Array.isArray(result) ? result.length : (result !== null ? 1 : 0);

    return { result, query, matchCount };
  } catch (e) {
    throw new Error(`Invalid JMESPath query: ${(e as Error).message}`);
  }
}
