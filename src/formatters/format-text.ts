import type { IFinding } from '../types.js';

export function formatText(findings: IFinding[]): string {
  if (findings.length === 0) return '✓ No compromised versions found.';

  const lines: string[] = [];

  lines.push('✗ Compromised package versions detected:\n');

  for (let i = 0; i < findings.length; i++) {
    const f = findings[i];
    lines.push(`- ${f.name}@${f.version}${f.source ? `  (source: ${f.source})` : ''}`);
  }

  return lines.join('\n');
}
