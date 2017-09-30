import { Uri } from 'vscode';
export * from './exec/types';

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
    uri: Uri;
    oldUri?: Uri;
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
    // localisedDate: string;
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

export interface IGit {
    getGitRoot(): Promise<string>;
    getHeadHashes(): Promise<{ ref: string, hash: string }[]>;
    getBranches(): Promise<Branch[]>;
    getCurrentBranch(): Promise<string>;
    getObjectHash(object: string): Promise<string>;
    getRefsContainingCommit(hash: string): Promise<string[]>;
    getLogEntries(pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, file?: Uri): Promise<LogEntries>;
    getCommitDate(hash: string): Promise<Date | undefined>;
    getCommit(hash: string): Promise<LogEntry | undefined>;
}

// export type CommitInfoIndexes = { commitInfo: CommitInfo, index: number };
// export type CommitInfoFormatCode = { commitInfo: CommitInfo, formatCode: string };
// export type CommitInfoIndexAndFormatCode = CommitInfoIndexes & CommitInfoFormatCode;

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
