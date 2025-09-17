export interface ICompromisedEntry {
  name: string;
  versions: string[];
  source?: string;
}

export interface IFinding {
  name: string;
  version: string;
  paths: string[];
  source?: string;
}

export interface IScanOptions {
  cwd: string;
}

export type IPackageMap = Map<string, Set<string>>;
