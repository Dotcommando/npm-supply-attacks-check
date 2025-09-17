import type { IPackageMap } from '../types.js';
import { addToMap, isRecord } from '../util.js';
import * as fs from 'fs';
import * as YAML from 'yaml';

export function scanPnpmLock(filePath: string): IPackageMap {
  const text = fs.readFileSync(filePath, 'utf8');
  const data = YAML.parse(text);
  const result: IPackageMap = new Map();

  if (!isRecord(data)) return result;

  const packages = data.packages;

  if (!isRecord(packages)) return result;

  const keys = Object.keys(packages);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]; // '/@scope/name@1.2.3' or '/name@1.2.3'
    const match = key.match(/^\/(.+)@([^@\/]+)$/);

    if (!match) continue;

    const rawName = match[1];
    const version = match[2];
    const name = rawName.startsWith('@') ? `@${rawName.split('@')[1]}` : rawName;

    addToMap(result, name, version);
  }

  return result;
}
