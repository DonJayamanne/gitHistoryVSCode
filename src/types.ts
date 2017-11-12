// Do not include any VS Code types in here
// This file will be imported by the client side code (WebPack)

export enum BranchSelection {
    Current = 1,
    All = 2
}
export type FsUri = Readonly<{
    scheme: string;
    authority: string;
    path: string;
    query: string;
    fragment: string;
    fsPath: string;
}>;

export enum RefType {
    Head,
    RemoteHead,
    Tag
}
export type Ref = {
    type: RefType;
    name?: string;
};
export type Remote = {
    name: string;
    url: string;
};

export type Branch = {
    name: string;
    current: boolean;
};

export type CommittedFile = {
    uri: FsUri;
    oldUri?: FsUri;
    oldRelativePath?: string;
    relativePath: string;
    status: Status;
    additions?: number;
    deletions?: number;
};

/////////////////////////////////////////////////////////
export type ActionedDetails = {
    name: string;
    email: string;
    date: Date;
};
export type LogEntriesResponse = {
    items: LogEntry[];
    count: number;
    pageIndex?: number;
    pageSize?: number;
    branch?: string;
    searchText?: string;
    file?: FsUri;
    branchSelection?: BranchSelection
    selected?: LogEntry;
};
export type LogEntries = {
    items: LogEntry[];
    count: number;
};
export type LogEntry = {
    author?: ActionedDetails;
    committer?: ActionedDetails;
    parents: Hash[];
    hash: Hash;
    tree: Hash;
    refs: Ref[];
    subject: string;
    body: string;
    notes: string;
    committedFiles?: CommittedFile[];
    isLastCommit?: boolean;
    isThisLastCommitMerged?: boolean;
};

export type CherryPickEntry = {
    branch: string;
    hash: string;
};

export type Hash = {
    full: string;
    short: string;
};

export enum Status {
    Modified,
    Added,
    Deleted,
    Renamed,
    Copied,
    Unmerged,
    Unknown,
    Broken,
    TypeChanged
}
export const IGitService = Symbol('IGitService');
export const IOutputChannel = Symbol('IOutputChannel');

export interface IGitService {
    getGitRoot(): Promise<string>;
    getHeadHashes(): Promise<{ ref: string, hash: string }[]>;
    getBranches(): Promise<Branch[]>;
    getCurrentBranch(): Promise<string>;
    getObjectHash(object: string): Promise<string>;
    getHash(hash: string): Promise<Hash>;
    getRefsContainingCommit(hash: string): Promise<string[]>;
    getLogEntries(pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, file?: FsUri): Promise<LogEntries>;
    getPreviousCommitHashForFile(hash: string, file: FsUri): Promise<Hash>;
    getCommitDate(hash: string): Promise<Date | undefined>;
    getCommit(hash: string): Promise<LogEntry | undefined>;
    getCommitFile(hash: string, file: FsUri | string): Promise<FsUri>;
    getCommitFileContent(hash: string, file: FsUri | string): Promise<string>;
    getDifferences(hash1: string, hash2: string): Promise<CommittedFile[]>;
}

export const IGitServiceFactory = Symbol('IGitServiceFactory');

export interface IGitServiceFactory {
    createGitService(workspaceRoot: string): IGitService;
}

export enum CommitInfo {
    ParentFullHash,
    ParentShortHash,
    RefsNames,
    AuthorName,
    AuthorEmail,
    AuthorDateUnixTime,
    CommitterName,
    CommitterEmail,
    CommitterDateUnixTime,
    Body,
    Notes,
    FullHash,
    ShortHash,
    TreeFullHash,
    TreeShortHash,
    Subject,
    NewLine
}

// export interface ActionedDetails {
//     name: string;
//     email: string;
//     date: Date;
//     localisedDate: string;
// }
// export interface LogEntry {
//     author: ActionedDetails;
//     committer: ActionedDetails;
//     parents: Hash[];
//     hash: Hash;
//     tree: Hash;
//     refs: string[];
//     remoteRefs: string[];
//     headRef: string;
//     subject: string;
//     body: string;
//     notes: string;
//     fileStats: FileStat[];
//     changes: [number, number, string][];
//     tags: string[];
//     branch: string;
//     isHead: boolean;
// }

// export interface CherryPickEntry {
//     branch: string;
//     hash: string;
// }

// export interface Hash {
//     full: string;
//     short: string;
// }

// export enum Modification {
//     Modified,
//     Created,
//     Deleted,
//     Renamed
// }
// export interface FileStat {
//     path: string;
//     additions?: number;
//     deletions?: number;
//     mode: Modification;
// }
