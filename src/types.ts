export interface ActionedDetails {
    name: string;
    email: string;
    date: Date;
    localisedDate: string;
}
export interface LogEntry {
    author: ActionedDetails;
    committer: ActionedDetails;
    parents: Hash[];
    hash: Hash;
    tree: Hash;
    refs: string[];
    remoteRefs: string[];
    headRef: string;
    subject: string;
    body: string;
    notes: string;
    fileStats: FileStat[];
    changes: [number, number, string][];
    tags: string[];
    branch: string;
    isHead: boolean;
}

export interface CherryPickEntry {
    branch: string;
    hash: string;
}

export interface Hash {
    full: string;
    short: string;
}

export enum Modification {
    Modified,
    Created,
    Deleted,
    Renamed
}
export interface FileStat {
    path: string;
    additions?: number;
    deletions?: number;
    mode: Modification;
}