import type { IFinding } from '../types.js';

export function formatJson(findings: IFinding[]): string {
  return JSON.stringify(
    {
      ok: findings.length === 0,
      count: findings.length,
      findings,
    },
    null,
    2,
  );
}
