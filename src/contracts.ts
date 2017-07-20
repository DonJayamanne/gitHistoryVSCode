export interface ActionedDetails {
    name: string;
    email: string;
    date: Date;
    localisedDate: string;
}
export interface LogEntry {
    author: ActionedDetails;
    committer: ActionedDetails;
    parents: Sha1[];
    sha1: Sha1;
    tree: Sha1;
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
    sha: string;
}

export interface Sha1 {
    full: string;
    short: string;
}

export interface FileStat {
    path: string;
    additions?: number;
    deletions?: number;
}