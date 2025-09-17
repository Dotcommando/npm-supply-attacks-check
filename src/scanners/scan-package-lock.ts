import type { IPackageMap } from '../types.js';
import { addToMap, readJson, isRecord, getStringProp, getObjectProp } from '../util.js';

export function scanPackageLock(filePath: string): IPackageMap {
  const data = readJson(filePath);
  const result: IPackageMap = new Map();

  if (isRecord(data)) {
    const packages = getObjectProp(data, 'packages');

    if (packages) {
      const entries = Object.entries(packages);
      for (let i = 0; i < entries.length; i++) {
        const pkgPath = entries[i][0];
        const info = entries[i][1];
        if (!isRecord(info)) continue;

        const version = getStringProp(info, 'version');
        if (!version) continue;

        // try read "name", otherwise derive from key
        const nameFromInfo = getStringProp(info, 'name');
        const name = nameFromInfo ?? deriveNameFromPackagePath(pkgPath);

        if (!name) continue;

        addToMap(result, name, version);
      }
      return result;
    }

    // npm v1-style fallback
    const dependencies = getObjectProp(data, 'dependencies');

    if (dependencies) {
      walkDependencies(dependencies);
    }
  }
  return result;

  function walkDependencies(depMap: Record<string, unknown>): void {
    const depNames = Object.keys(depMap);
    for (let i = 0; i < depNames.length; i++) {
      const depName = depNames[i];
      const info = depMap[depName];

      if (isRecord(info)) {
        const version = getStringProp(info, 'version');
        if (version) addToMap(result, depName, version);

        const child = getObjectProp(info, 'dependencies');
        if (child) walkDependencies(child);
      }
    }
  }
}

function deriveNameFromPackagePath(pkgPath: string): string | null {
  if (!pkgPath || pkgPath === '') return null;

  const marker = 'node_modules/';
  const lastIdx = pkgPath.lastIndexOf(marker);

  if (lastIdx === -1) return null;

  const sub = pkgPath.slice(lastIdx + marker.length);

  if (!sub) return null;

  return sub;
}
