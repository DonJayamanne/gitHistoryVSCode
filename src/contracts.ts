export interface ActionedDetails {
    name: string;
    email: string;
    date: Date;
}
export interface LogEntry {
    author: ActionedDetails;
    committer: ActionedDetails;
    parents: Sha1[];
    sha1: Sha1;
    tree: Sha1;
    refs: string[];
    subject: string;
    body: string;
    notes: string;
    changes: [number, number, string][];
}

export interface Sha1 {
    full: string;
    short: string;
}