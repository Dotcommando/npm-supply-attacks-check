import type { IPackageMap } from '../types.js';
import { addToMap, isRecord, getObjectProp, getStringProp } from '../util.js';
import { execSync } from 'child_process';

export function scanRuntimeTree(cwd: string): IPackageMap {
  const result: IPackageMap = new Map();
  if (!runNpm()) runPnpm();
  return result;

  function runNpm(): boolean {
    try {
      let json = '';
      try {
        json = execSync('npm ls --all --json', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      } catch {
        json = execSync('npm ls --all --json || true', { cwd, stdio: ['ignore', 'pipe', 'ignore'], shell: '/bin/bash' }).toString();
      }

      const tree = safeParse(json);

      if (tree) walk(tree);

      return true;
    } catch {
      return false;
    }
  }

  function runPnpm(): boolean {
    try {
      const json = execSync('pnpm list --json', { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      const arr = safeParse(json);

      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
          walk(arr[i]);
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  function walk(node: unknown): void {
    if (!isRecord(node)) return;

    const name = getStringProp(node, 'name');
    const version = getStringProp(node, 'version');

    if (name && version) addToMap(result, name, version);

    const deps = getObjectProp(node, 'dependencies');

    if (deps) {
      const names = Object.keys(deps);

      for (let i = 0; i < names.length; i++) {
        const child = deps[names[i]];
        walk(child);
      }
    }
  }

  function safeParse(json: string): unknown {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
