export interface IUri {
  /**
   * Path is the `/some/path` part of `http://www.msft.com/some/path?query#fragment`.
   */
  readonly path: string;

  /**
   * The string representing the corresponding file system path of this Uri.
   *
   * Will handle UNC paths and normalize windows drive letters to lower-case. Also
   * uses the platform specific path separator. Will *not* validate the path for
   * invalid characters and semantics. Will *not* look at the scheme of this Uri.
   */
  readonly fsPath: string;
}

export enum RefType {
  Head,
  RemoteHead,
  Tag
}
export interface Ref {
  type: RefType;
  name?: string;
}
export interface Remote {
  name: string;
  url: string;
}

export interface BranchType extends Ref {
  upstream?: string;
  ahead?: number;
  behind?: number;
}

export interface CommittedFile {
  uri: IUri;
  oldUri?: IUri;
  oldRelativePath?: string;
  relativePath: string;
  status: Status;
  additions?: number;
  deletions?: number;
}

/////////////////////////////////////////////////////////
export interface ActionedDetails {
  name: string;
  email: string;
  date: Date;
  localisedDate: string;
}
export interface LogEntries {
  items: LogEntry[];
  count: number;
}
export interface LogEntry {
  author?: ActionedDetails;
  committer?: ActionedDetails;
  parents: Hash[];
  hash: Hash;
  tree: Hash;
  refs: Ref[];
  subject: string;
  body: string;
  notes: string;
  committedFiles: CommittedFile[];
  isLastCommit?: boolean;
  isThisLastCommitMerged?: boolean;
}

export interface CherryPickEntry {
  branch: string;
  hash: string;
}

export interface Hash {
  full: string;
  short: string;
}

export enum Status {
  Modified,
  Added,
  Deleted,
  Renamed,
  Copied
}

export enum Branch {
  All = 1,
  Current = 2
}
export interface ISettings {
  selectedBranchType?: Branch;
  selectedBranchName?: string;
  pageIndex?: number;
  searchText?: string;

}