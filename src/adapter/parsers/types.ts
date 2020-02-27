import { ActionedDetails, CommittedFile, LogEntry, Ref, Status } from '../../types';

export const IRefsParser = Symbol('IRefsParser');
export interface IRefsParser {
    parse(refsContent: string): Ref[];
}
export const IFileStatParser = 'IFileStatParser'; // Symbol('IFileStatParser');

export interface IFileStatParser {
    parse(gitRootPath: string, filesWithNumStat: string[], filesWithStats: string[]): CommittedFile[];
}
export const IFileStatStatusParser = Symbol('IFileStatStatusParser');
export interface IFileStatStatusParser {
    canParse(status: string): boolean;
    parse(status: string): Status | undefined;
}

export const IActionDetailsParser = Symbol('IActionDetailsParser');
export interface IActionDetailsParser {
    parse(name: string, email: string, unixTime: string): ActionedDetails | undefined;
}
export const ILogParser = Symbol('ILogParser');
export interface ILogParser {
    parse(
        gitRepoPath: string,
        summaryEntry: string,
        itemEntrySeparator: string,
        logFormatArgs: string[],
        filesWithNumStat?: string,
        filesWithNameStatus?: string,
    ): LogEntry;
}
