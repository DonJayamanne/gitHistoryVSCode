import { Uri } from 'vscode';
import { GitOriginType } from './adapter/repository/index';
import { CommitDetails } from './common/types';

// Do not include any VS Code types in here
// This file will be imported by the client side code (WebPack)

export enum BranchSelection {
    Current = 1,
    All = 2,
    Detached = 3,
}

export type FsUri = {
    scheme: string;
    authority: string;
    path: string;
    query: string;
    fragment: string;
    fsPath: string;
};

export enum RefType {
    Head,
    RemoteHead,
    Tag,
}
export type Ref = {
    type: RefType;
    name?: string;
    onRemove?(): void;
    onAction?(name: string): void;
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
    avatarFilePath?: Uri;
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
    isLoadingCommit?: string;
};
export type LogEntries = {
    items: LogEntry[];
    count: number;
    selected?: LogEntry;
    isLoading?: boolean;
    isLoadingCommit?: string;
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
    TypeChanged,
}
export const IGitService = Symbol.for('IGitService');
export const IOutputChannel = Symbol.for('IOutputChannel');

export interface IGitService {
    getGitRoot(): string;
    getGitRelativePath(file: Uri): string;
    getHeadHashes(): { ref?: string; hash?: string }[];
    getAuthors(): Promise<ActionedUser[]>;
    getDetachedHash(): string | undefined;
    getBranches(): Promise<Branch[]>;
    getCurrentBranch(): string;
    getRefsContainingCommit(hash: string): Ref[];
    getLogEntries(
        pageIndex?: number,
        pageSize?: number,
        branches?: string[],
        searchText?: string,
        file?: Uri,
        lineNumber?: number,
        author?: string,
    ): Promise<LogEntries>;
    getPreviousCommitHashForFile(hash: string, file: FsUri): Promise<Hash>;
    getCommit(hash: string, withRefs?: boolean): Promise<LogEntry | undefined>;
    revertCommit(hash: string): Promise<void>;
    getCommitFile(hash: string, file: FsUri | string): Promise<Uri>;
    getDifferences(hash1: string, hash2: string): Promise<CommittedFile[]>;
    cherryPick(hash: string): Promise<void>;
    reset(hash: string, hard?: boolean): Promise<void>;
    checkout(hash: string): Promise<void>;
    createBranch(branchName: string, hash: string): Promise<void>;
    createTag(tagName: string, hash: string): Promise<string>;
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

export const IGitServiceFactory = Symbol.for('IGitServiceFactory');

export interface IGitServiceFactory {
    getIndex(): number;
    getService(index: number): IGitService;
    repositoryPicker(): Promise<void>;
    createGitService(resource?: Uri | string): Promise<IGitService>;
}

export interface IPostMessage {
    requestId: string;
    cmd: string;
    payload: object;
    error?: string;
}

export interface ISettings {
    branchSelection?: BranchSelection;
    branchName?: string;
    authorFilter?: string;
    pageIndex?: number;
    searchText?: string;
    file?: string;
    line?: number;
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
    NewLine,
}
