import * as path from 'path';
import * as fs from 'fs';
import JSON5 from 'json5';

export function findFirstExisting(baseDir: string, fileNames: string[]): string | null {
  for (let i = 0; i < fileNames.length; i++) {
    const fullPath = path.join(baseDir, fileNames[i]);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return null;
}

export function addToMap(target: Map<string, Set<string>>, packageName: string, version: string): void {
  const normalizedName = normalizeName(packageName);
  if (!target.has(normalizedName)) target.set(normalizedName, new Set());
  const set = target.get(normalizedName);
  if (set) set.add(version);
}

export function normalizeName(packageName: string): string {
  return packageName.trim();
}

export function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function readJson5(filePath: string): unknown {
  const rawText = fs.readFileSync(filePath, 'utf8');
  return JSON5.parse(rawText);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getStringProp(obj: unknown, prop: string): string | null {
  if (!isRecord(obj)) return null;
  const val = obj[prop];
  return typeof val === 'string' ? val : null;
}

export function getObjectProp(obj: unknown, prop: string): Record<string, unknown> | null {
  if (!isRecord(obj)) return null;
  const val = obj[prop];
  return isRecord(val) ? val : null;
}
