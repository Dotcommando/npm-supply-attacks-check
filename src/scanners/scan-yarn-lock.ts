import type { IPackageMap } from '../types.js';
import { addToMap, isRecord, getStringProp } from '../util.js';
import * as fs from 'fs';
import yarnLockfile from '@yarnpkg/lockfile';

export function scanYarnLock(filePath: string): IPackageMap {
  const text = fs.readFileSync(filePath, 'utf8');
  const parsed = yarnLockfile.parse(text);
  const result: IPackageMap = new Map();

  if (parsed.type !== 'success') return result;

  const entries = Object.entries(parsed.object);

  for (let i = 0; i < entries.length; i++) {
    const specifier = entries[i][0];
    const meta = entries[i][1];
    const version = isRecord(meta) ? getStringProp(meta, 'version') : null;

    if (!version) continue;

    const name = extractNameFromYarnKey(specifier);

    if (name) addToMap(result, name, version);
  }

  return result;
}

function extractNameFromYarnKey(key: string): string | null {
  const firstSpecifier = key.split(', ')[0];

  if (firstSpecifier.startsWith('@')) {
    const secondAt = firstSpecifier.indexOf('@', 1);
    if (secondAt === -1) return null;
    return firstSpecifier.slice(0, secondAt);
  }

  const lastAt = firstSpecifier.lastIndexOf('@');

  if (lastAt === -1) return firstSpecifier;

  return firstSpecifier.slice(0, lastAt);
}
