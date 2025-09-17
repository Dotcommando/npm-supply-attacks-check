# npm-supply-attacks-check

Minimal CLI to detect **specific compromised versions** from two incidents:
1. debug/chalk attack (8–9 Sep 2025)
2. Shai-Hulud campaign (15–17 Sep 2025 and ongoing)

## Quick start

### Usage in your project

```bash
npm i -D npm-supply-attacks-check

npx npm-supply-attacks-check --lock --format text
```

### Local usage

```bash
npx tsx src/index.ts --lock --format text
```

### Build and run

```
npm i
npm run build
node dist/index.js --lock --format text
```

### CI example (GitHub Actions)

```yaml
- name: Scan for compromised npm packages
  run: |
    npm ci
    npx tsx src/index.ts --lock --format text --ci
```

The command exits 1 if any compromised versions are found.

### CLI options

`--lock` (default) scan lockfiles (package-lock.json, pnpm-lock.yaml, yarn.lock)

`--tree` scan runtime tree using npm ls or pnpm list

`--cwd` <path> project root (default process.cwd())

`--format` text|json output format (default text)

`--ci` exit 1 when findings exist

## Updating database

The package/version list is stored in compromised.json. Pull requests welcome.

The package/version list is stored in `compromised.json`. Pull requests welcome.
