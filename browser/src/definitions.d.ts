// declare type NotebookOutput = {
//   id: string;
//   value: { [key: string]: any } | string;
// }
// declare interface NotebookResultSettings {
//   appendResults?: boolean;
// }
// declare type NotebookResultsState = NotebookOutput[];

interface ActionedDetails {
  name: string;
  email: string;
  date: Date;
  localisedDate: string;
}
interface ILogEntry {
  author: ActionedDetails;
  committer: ActionedDetails;
  parents: Sha1[];
  sha1: Sha1;
  tree: Sha1;
  refs: string[];
  subject: string;
  body: string;
  notes: string;
  fileStats: FileStat[];
  changes: [number, number, string][];
  tags: string[];
  branch: string;
  isHead: boolean;
}
interface Sha1 {
  full: string;
  short: string;
}

interface FileStat {
  path: string;
  additions?: number;
  deletions?: number;
}
declare var module: any;
declare var require: any;
