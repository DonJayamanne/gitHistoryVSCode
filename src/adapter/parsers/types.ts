import { ActionedDetails, CommittedFile, LogEntry, Status } from '../../types';

export const IFileStatParser = 'IFileStatParser'; // Symbol.for('IFileStatParser');

export interface IFileStatParser {
    parse(gitRootPath: string, filesWithNumStat: string[], filesWithStats: string[]): CommittedFile[];
}
export const IFileStatStatusParser = Symbol.for('IFileStatStatusParser');
export interface IFileStatStatusParser {
    canParse(status: string): boolean;
    parse(status: string): Status | undefined;
}

export const IActionDetailsParser = Symbol.for('IActionDetailsParser');
export interface IActionDetailsParser {
    parse(name: string, email: string, unixTime: string): ActionedDetails | undefined;
}
export const ILogParser = Symbol.for('ILogParser');
export interface ILogParser {
    parse(summaryEntry: string, itemEntrySeparator: string, logFormatArgs: string[]): LogEntry;
    parserCommittedFiles(gitRepoPath: string, filesWithNumStat?: string, filesWithNameStatus?: string): CommittedFile[];
}
