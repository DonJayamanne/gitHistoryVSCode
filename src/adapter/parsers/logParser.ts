import { LogEntry } from '../git';
import parseRefs from './refParser';
import parsedActionedDetails from './actionedDetailsParser';
import parseFileStat from './summaryFileStatParser';

export default function parseLogEntry(summaryEntry: string, nameStatEntry: string, gitRootPath: string, itemEntrySeparator: string, logFormatArgs: string[]): LogEntry {
    const logItems = summaryEntry.split(itemEntrySeparator);
    const logItemsWithFileModeChanges = nameStatEntry.split(itemEntrySeparator);

    const fullParentSha = logItems[logFormatArgs.indexOf('%P')].split(' ').filter(sha => sha.trim().length > 0);
    const shortParentSha = logItems[logFormatArgs.indexOf('%p')].split(' ').filter(sha => sha.trim().length > 0);
    const parents = fullParentSha.map((sha, index) => { return { full: sha, short: shortParentSha[index] }; });

    const committedFiles = parseFileStat(gitRootPath, logItems[logItemsWithFileModeChanges.length], logItemsWithFileModeChanges[logItemsWithFileModeChanges.length]);

    return {
        refs: parseRefs(logItems[logFormatArgs.indexOf('%d')]),
        author: parsedActionedDetails(logItems[logFormatArgs.indexOf('%an')], logItems[logFormatArgs.indexOf('%ae')], logItems[logFormatArgs.indexOf('%at')]),
        committer: parsedActionedDetails(logItems[logFormatArgs.indexOf('%c')], logItems[logFormatArgs.indexOf('%ce')], logItems[logFormatArgs.indexOf('%ct')]),
        body: logItems[logFormatArgs.indexOf('%b')],
        notes: logItems[logFormatArgs.indexOf('%N')],
        parents,
        committedFiles,
        sha1: { full: logItems[logFormatArgs.indexOf('%H')], short: logItems[logFormatArgs.indexOf('%h')] },
        tree: { full: logItems[logFormatArgs.indexOf('%T')], short: logItems[logFormatArgs.indexOf('%t')] },
        subject: logItems[logFormatArgs.indexOf('%s')]
    };
}