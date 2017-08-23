import { Uri } from 'vscode';

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

export interface Branch {
    name: string;
    current: boolean;
}

export interface CommittedFile {
    uri: Uri;
    oldUri?: Uri;
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
    committedFiles?: CommittedFile[];
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