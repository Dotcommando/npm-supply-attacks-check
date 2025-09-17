import * as path from 'path';
import * as fs from 'fs';
import { readJson5, isRecord } from './util.js';
import type { ICompromisedEntry, IFinding, IPackageMap } from './types.js';

let databaseCache: ICompromisedEntry[] | null = null;

export function loadDatabase(): ICompromisedEntry[] {
  if (databaseCache) return databaseCache;

  const json5Path = path.resolve(process.cwd(), 'compromised.json5');
  if (!fs.existsSync(json5Path)) {
    throw new Error('compromised.json5 not found');
  }

  const raw = readJson5(json5Path);
  if (!Array.isArray(raw)) {
    throw new Error('compromised.json5 must be an array');
  }

  const parsed: ICompromisedEntry[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];

    if (!isRecord(item)) continue;

    const name = typeof item.name === 'string' ? item.name : null;
    const versions = Array.isArray(item.versions) ? item.versions.filter((v) => typeof v === 'string') : [];
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
    const presentVersions = packageIndex.get(entry.name);

    if (!presentVersions) continue;

    for (const present of presentVersions) {
      if (wanted.has(present)) {
        findings.push({
          name: entry.name,
          version: present,
          paths: ['lock'],
          source: entry.source
        });
      }
    }
  }

  return findings;
}
