import { diff as deepDiff, Diff } from 'deep-diff';

export interface DiffChange {
  path: string;
  type: 'added' | 'removed' | 'changed' | 'array';
  from?: unknown;
  to?: unknown;
  value?: unknown;
  index?: number;
  item?: unknown;
}

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

export interface DiffResult {
  changes: DiffChange[];
  summary: DiffSummary;
}

function countKeys(obj: unknown): number {
  if (typeof obj !== 'object' || obj === null) return 1;
  if (Array.isArray(obj)) return obj.reduce((sum, item) => sum + countKeys(item), 0);
  return Object.keys(obj).reduce((sum, key) => sum + countKeys((obj as Record<string, unknown>)[key]), 0);
}

export function computeDiff(original: unknown, modified: unknown): DiffResult {
  const differences = deepDiff(original, modified) || [];
  const changes: DiffChange[] = [];

  const summary: DiffSummary = {
    added: 0,
    removed: 0,
    changed: 0,
    unchanged: 0,
  };

  for (const d of differences as Diff<unknown, unknown>[]) {
    const path = d.path ? d.path.join('.') : '';

    switch (d.kind) {
      case 'N': // New
        changes.push({ path, type: 'added', value: d.rhs });
        summary.added++;
        break;
      case 'D': // Deleted
        changes.push({ path, type: 'removed', value: d.lhs });
        summary.removed++;
        break;
      case 'E': // Edited
        changes.push({ path, type: 'changed', from: d.lhs, to: d.rhs });
        summary.changed++;
        break;
      case 'A': // Array change
        changes.push({
          path,
          type: 'array',
          index: d.index,
          item: d.item,
        });
        if (d.item?.kind === 'N') summary.added++;
        else if (d.item?.kind === 'D') summary.removed++;
        else summary.changed++;
        break;
    }
  }

  // Calculate unchanged
  const totalOriginalKeys = countKeys(original);
  const totalChanges = summary.added + summary.removed + summary.changed;
  summary.unchanged = Math.max(0, totalOriginalKeys - summary.removed - summary.changed);

  return { changes, summary };
}
