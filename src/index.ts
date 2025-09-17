import * as path from 'path';
import { findFirstExisting, getStringProp, isRecord } from './util.js';
import { scanPackageLock, scanYarnLock, scanPnpmLock, scanRuntimeTree } from './scanners/index.js';
import { matchFindings } from './db.js';
import type { IPackageMap } from './types.js';
import { formatText, formatJson } from './formatters/index.js';

interface IArgs {
  lock: boolean;
  tree: boolean;
  cwd: string;
  format: 'text' | 'json';
  ci: boolean;
}

function parseArgs(argv: string[]): IArgs {
  const args: IArgs = { lock: true, tree: false, cwd: process.cwd(), format: 'text', ci: false };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--tree') { args.tree = true; args.lock = false; continue; }
    if (arg === '--lock') { args.lock = true; args.tree = false; continue; }
    if (arg === '--ci') { args.ci = true; continue; }
    if (arg === '--format') { args.format = (argv[++i] ?? 'text') as 'text' | 'json'; continue; }
    if (arg === '--cwd') { args.cwd = path.resolve(argv[++i] ?? '.'); continue; }
  }
  return args;
}

function mergeMaps(primary: IPackageMap, secondary: IPackageMap): IPackageMap {
  const output: IPackageMap = new Map(primary);
  for (const [packageName, versions] of secondary) {
    if (!output.has(packageName)) output.set(packageName, new Set());
    const set = output.get(packageName);
    if (set) {
      for (const version of versions) set.add(version);
    }
  }
  return output;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  let index: IPackageMap = new Map();

  if (args.lock) {
    const npmLockPath = findFirstExisting(args.cwd, ['package-lock.json']);
    const pnpmLockPath = findFirstExisting(args.cwd, ['pnpm-lock.yaml']);
    const yarnLockPath = findFirstExisting(args.cwd, ['yarn.lock']);

    if (!npmLockPath && !pnpmLockPath && !yarnLockPath) {
      console.error('No lockfile found. Try --tree.');
      process.exitCode = 2;
      return;
    }

    if (npmLockPath) index = mergeMaps(index, scanPackageLock(npmLockPath));
    if (pnpmLockPath) index = mergeMaps(index, scanPnpmLock(pnpmLockPath));
    if (yarnLockPath) index = mergeMaps(index, scanYarnLock(yarnLockPath));
  }

  if (args.tree) {
    index = mergeMaps(index, scanRuntimeTree(args.cwd));
  }

  const findings = matchFindings(index);
  const output = args.format === 'json' ? formatJson(findings) : formatText(findings);

  if (args.format === 'json') {
    console.log(output);
  } else {
    console.error(output);
  }

  if (args.ci && findings.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  let message = '';
  if (isRecord(error)) {
    const stack = getStringProp(error, 'stack');
    message = stack ?? String(error);
  } else {
    message = String(error);
  }
  console.error('Fatal error:', message);
  process.exit(3);
});
