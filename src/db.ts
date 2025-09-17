import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { readJson5, isRecord } from './util.js';
import type { ICompromisedEntry, IFinding, IPackageMap } from './types.js';

let databaseCache: ICompromisedEntry[] | null = null;

export function loadDatabase(): ICompromisedEntry[] {
  if (databaseCache) return databaseCache;

  const pkgDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(pkgDir, '..');
  const packagedDb = path.join(rootDir, 'compromised.json5');
  const cwdDb = path.resolve(process.cwd(), 'compromised.json5');

  const candidates = [packagedDb, cwdDb];
  const existing = candidates.find((p) => fs.existsSync(p));
  if (!existing) {
    throw new Error(
      `compromised.json5 not found (looked in: ${candidates.join(', ')})`
    );
  }

  const raw = readJson5(existing);
  if (!Array.isArray(raw)) {
    throw new Error('compromised.json5 must be an array');
  }

  const parsed: ICompromisedEntry[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];

    if (!isRecord(item)) continue;

    const name = typeof item.name === 'string' ? item.name : null;
    const versions = Array.isArray(item.versions)
      ? item.versions.filter((v) => typeof v === 'string')
      : [];
    const source = typeof item.source === 'string' ? item.source : undefined;

    if (name && versions.length > 0) {
      parsed.push({ name, versions, source });
    }
  }

  databaseCache = parsed;

  return databaseCache;
}

export function matchFindings(packageIndex: IPackageMap): IFinding[] {
  const database = loadDatabase();
  const findings: IFinding[] = [];

  for (let i = 0; i < database.length; i++) {
    const entry = database[i];
    const wanted = new Set(entry.versions);
    const present = packageIndex.get(entry.name);
    if (!present) continue;

    for (const version of present) {
      if (wanted.has(version)) {
        findings.push({
          name: entry.name,
          version,
          paths: ['lock'],
          source: entry.source
        });
      }
    }
  }

  return findings;
}
