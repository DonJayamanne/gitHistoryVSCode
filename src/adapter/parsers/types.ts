import { ActionedDetails, CommittedFile, LogEntry, Ref, Status } from '../../types';

export const IRefsParser = '';
export interface IRefsParser {
    parse(refsContent: string): Ref[];
}

export interface IFileStatParser {
    parse(filesWithNumStat: string[], filesWithStats: string[]): CommittedFile[];
}

export interface IFileStatStatusParser {
    canParse(status: string): boolean;
    parse(status: string): Status | undefined;
}

export interface IActionDetailsParser {
    parse(name: string, email: string, unixTime: string): ActionedDetails | undefined;
}

export interface ILogParser {
    parse(gitRepoPath: string, summaryEntry: string, itemEntrySeparator: string, statsSeparator: string, logFormatArgs: string[], nameStatEntry?: string): LogEntry;
}
