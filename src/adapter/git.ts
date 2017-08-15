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

export interface Branch extends Ref {
    upstream?: string;
    ahead?: number;
    behind?: number;
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
export interface LogEntry {
    author?: ActionedDetails;
    committer?: ActionedDetails;
    parents: Sha1[];
    sha1: Sha1;
    tree: Sha1;
    refs: Ref[];
    subject: string;
    body: string;
    notes: string;
    committedFiles: CommittedFile[]
}

export interface CherryPickEntry {
    branch: string;
    sha: string;
}

export interface Sha1 {
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