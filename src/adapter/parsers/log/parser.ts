import { EOL } from 'os';
import { Helpers } from '../../helpers';
import { CommitInfo, CommittedFile, LogEntry } from '../../types';
import { IActionDetailsParser, IFileStatParser, ILogParser, IRefsParser } from '../types';

export class LogParser implements ILogParser {
    constructor(private refsparser: IRefsParser, private fileStatParser: IFileStatParser,
        private actionDetailsParser: IActionDetailsParser) {

    }
    private parserCommittedFiles(logItems: string[], statsSeparator: string, nameStatEntry?: string | undefined): CommittedFile[] {
        if (nameStatEntry && nameStatEntry.length > 0) {
            const statsSeparatorIndex = logItems.indexOf(statsSeparator) + 1;
            const filesWithNumStat = logItems.slice(statsSeparatorIndex).join(EOL).split(/\r?\n/g).map(entry => entry.trim()).filter(entry => entry.length > 0);
            const filesWithModeChanges = nameStatEntry.split(/\r?\n/g).map(entry => entry.trim()).filter(entry => entry.length > 0);
            return this.fileStatParser.parse(filesWithNumStat, filesWithModeChanges);
        }
        else {
            return [];
        }
    }
    private getCommitInfo(logItems: string[], logFormatArgs: string[], info: CommitInfo): string {
        const commitInfoFormatCode = Helpers.GetCommitInfoFormatCode(info);
        const indexInArgs = logFormatArgs.indexOf(commitInfoFormatCode);
        if (indexInArgs === -1) {
            throw new Error(`Commit Arg '${commitInfoFormatCode}' not found in the args`);
        }
        return logItems[indexInArgs];
    }
    private getAuthorInfo(logItems: string[], logFormatArgs: string[]) {
        const name = this.getCommitInfo(logItems, logFormatArgs, CommitInfo.AuthorName);
        const email = this.getCommitInfo(logItems, logFormatArgs, CommitInfo.AuthorEmail);
        const dateTime = this.getCommitInfo(logItems, logFormatArgs, CommitInfo.AuthorDateUnixTime);
        return this.actionDetailsParser.parse(name, email, dateTime);
    }
    private getCommitterInfo(logItems: string[], logFormatArgs: string[]) {
        const name = this.getCommitInfo(logItems, logFormatArgs, CommitInfo.CommitterName);
        const email = this.getCommitInfo(logItems, logFormatArgs, CommitInfo.CommitterEmail);
        const dateTime = this.getCommitInfo(logItems, logFormatArgs, CommitInfo.CommitterDateUnixTime);
        return this.actionDetailsParser.parse(name, email, dateTime);
    }
    public parse(gitRepoPath: string, summaryEntry: string, itemEntrySeparator: string, statsSeparator: string, logFormatArgs: string[], nameStatEntry?: string | undefined): LogEntry {
        const logItems = summaryEntry.split(itemEntrySeparator);

        const fullParentHash = this.getCommitInfo(logItems, logFormatArgs, CommitInfo.ParentFullHash).split(' ').filter(hash => hash.trim().length > 0);
        const shortParentHash = this.getCommitInfo(logItems, logFormatArgs, CommitInfo.ParentShortHash).split(' ').filter(hash => hash.trim().length > 0);
        const parents = fullParentHash.map((hash, index) => { return { full: hash, short: shortParentHash[index] }; });
        const committedFiles = this.parserCommittedFiles(logItems, statsSeparator, nameStatEntry);

        return {
            refs: this.refsparser.parse(this.getCommitInfo(logItems, logFormatArgs, CommitInfo.RefsNames)),
            author: this.getAuthorInfo(logItems, logFormatArgs),
            committer: this.getCommitterInfo(logItems, logFormatArgs),
            body: this.getCommitInfo(logItems, logFormatArgs, CommitInfo.Body),
            notes: this.getCommitInfo(logItems, logFormatArgs, CommitInfo.Notes),
            parents,
            committedFiles,
            hash: {
                full: this.getCommitInfo(logItems, logFormatArgs, CommitInfo.FullHash),
                short: this.getCommitInfo(logItems, logFormatArgs, CommitInfo.ShortHash)
            },
            tree: {
                full: this.getCommitInfo(logItems, logFormatArgs, CommitInfo.TreeFullHash),
                short: this.getCommitInfo(logItems, logFormatArgs, CommitInfo.TreeShortHash)
            },
            subject: this.getCommitInfo(logItems, logFormatArgs, CommitInfo.Subject)
        };
    }
}
