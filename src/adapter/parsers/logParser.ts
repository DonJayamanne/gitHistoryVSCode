import { CommittedFile, LogEntry } from '../git';
import parseRefs from './refParser';
import parsedActionedDetails from './actionedDetailsParser';
import parseFileStat from './summaryFileStatParser';
import { EOL } from 'os';

export default function parseLogEntry(summaryEntry: string, gitRootPath: string, itemEntrySeparator: string, statsSeparator: string, logFormatArgs: string[], nameStatEntry?: string): LogEntry {
    const logItems = summaryEntry.split(itemEntrySeparator);

    const fullParentHash = logItems[logFormatArgs.indexOf('%P')].split(' ').filter(hash => hash.trim().length > 0);
    const shortParentHash = logItems[logFormatArgs.indexOf('%p')].split(' ').filter(hash => hash.trim().length > 0);
    const parents = fullParentHash.map((hash, index) => { return { full: hash, short: shortParentHash[index] }; });

    let committedFiles: CommittedFile[] = [];
    if (nameStatEntry && nameStatEntry.length > 0) {
        const statsSeparatorIndex = logItems.indexOf(statsSeparator);
        const filesWithNumStat = logItems.slice(statsSeparatorIndex).join(EOL).split(/\r?\n/g).map(entry => entry.trim()).filter(entry => entry.length > 0);
        const filesWithModeChanges = nameStatEntry.split(/\r?\n/g).map(entry => entry.trim()).filter(entry => entry.length > 0);
        committedFiles = parseFileStat(gitRootPath, filesWithNumStat, filesWithModeChanges);
    }

    return {
        refs: parseRefs(logItems[logFormatArgs.indexOf('%d')]),
        author: parsedActionedDetails(logItems[logFormatArgs.indexOf('%an')], logItems[logFormatArgs.indexOf('%ae')], logItems[logFormatArgs.indexOf('%at')]),
        committer: parsedActionedDetails(logItems[logFormatArgs.indexOf('%c')], logItems[logFormatArgs.indexOf('%ce')], logItems[logFormatArgs.indexOf('%ct')]),
        body: logItems[logFormatArgs.indexOf('%b')],
        notes: logItems[logFormatArgs.indexOf('%N')],
        parents,
        committedFiles,
        hash: { full: logItems[logFormatArgs.indexOf('%H')], short: logItems[logFormatArgs.indexOf('%h')] },
        tree: { full: logItems[logFormatArgs.indexOf('%T')], short: logItems[logFormatArgs.indexOf('%t')] },
        subject: logItems[logFormatArgs.indexOf('%s')]
    };
}