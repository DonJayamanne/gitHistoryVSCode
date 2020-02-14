import { Uri } from 'vscode';
import { GitOriginType } from './adapter/repository/index';
import { CommitDetails } from './common/types';

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
    onRemove?(): void;
};
export type Remote = {
    name: string;
    url: string;
};

export type Branch = {
    gitRoot: string;
    name: string;
    remote: string;
    remoteType: GitOriginType | undefined;
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
export type AvatarResponse = {
    items: Avatar[];
    timestamp: number;
};
export type Avatar = {
    login: string;
    name: string;
    email: string;
    url?: string;
    avatarUrl?: string;
    avatarFilePath?: FsUri;
};
export type ActionedUser = {
    name: string;
    email: string;
};
export type ActionedDetails = ActionedUser & {
    date: Date;
};
export type LogEntriesResponse = {
    items: LogEntry[];
    count: number;
    pageIndex?: number;
    pageSize?: number;
    lineNumber?: number;
    selected?: LogEntry;
    isLoading?: boolean;
    isLoadingCommit?: boolean;
};
export type LogEntries = {
    items: LogEntry[];
    count: number;
    selected?: LogEntry;
    isLoading?: boolean;
    isLoadingCommit?: boolean;
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
    getGitRelativePath(file: FsUri): Promise<string>;
    getHeadHashes(): Promise<{ ref?: string; hash?: string }[]>;
    getAuthors(): Promise<ActionedUser[]>;
    getBranches(): Promise<Branch[]>;
    getCurrentBranch(): Promise<string>;
    getRefsContainingCommit(hash: string): Promise<string[]>;
    getLogEntries(pageIndex?: number, pageSize?: number, branch?: string, searchText?: string, file?: FsUri, lineNumber?: number, author?: string): Promise<LogEntries>;
    getPreviousCommitHashForFile(hash: string, file: FsUri): Promise<Hash>;
    getCommit(hash: string): Promise<LogEntry | undefined>;
    revertCommit(hash: string): Promise<void>;
    getCommitFile(hash: string, file: FsUri | string): Promise<FsUri>;
    getDifferences(hash1: string, hash2: string): Promise<CommittedFile[]>;
    cherryPick(hash: string): Promise<void>;
    reset(hash: string, hard?: boolean): Promise<void>;
    checkout(hash: string): Promise<void>;
    createBranch(branchName: string, hash: string): Promise<void>;
    createTag(tagName: string, hash: string): Promise<void>;
    removeTag(tagName: string): Promise<void>;
    removeBranch(tagName: string): Promise<void>;
    removeRemoteBranch(remoteBranchName: string): Promise<void>;
    getOriginType(): Promise<GitOriginType | undefined>;
    getOriginUrl(): Promise<string>;
    merge(hash: string): Promise<void>;
    rebase(hash: string): Promise<void>;
}

export type CommitComparison = {
    leftCommit: CommitDetails;
    rightCommit: CommitDetails;
    differences: CommittedFile[];
};

export const IGitServiceFactory = Symbol('IGitServiceFactory');

export interface IGitServiceFactory {
    getIndex(): number;
    getService(index: number): IGitService;
    repositoryPicker(): Promise<void>;
    createGitService(resource?: Uri | string): Promise<IGitService>;
}

export interface ISettings {
    selectedBranchType?: BranchSelection;
    branchName?: string;
    authorFilter?: string;
    pageIndex?: number;
    searchText?: string;
    file?: string;
    id?: string;
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
